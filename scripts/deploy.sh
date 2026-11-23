#!/usr/bin/env bash
# Runs on the EC2 server, from the repo folder, after the code is at origin/main (the CI/CD workflow does that).
# Install, build with the server's .env (NEXT_PUBLIC_API_URL is baked in at build time), reload PM2, check it answers.
set -euo pipefail

cd "$(dirname "$0")/.."

# Shells opened over SSH do not load nvm by themselves.
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

echo "==> Install"
pnpm install --frozen-lockfile

echo "==> Build"
# A small server can run out of memory building Next.js; give Node more room.
NODE_OPTIONS="--max-old-space-size=${BUILD_MEMORY_MB:-1536}" pnpm build

echo "==> Reload PM2"
# PM2 keeps an app's original script on reload. If master-web was started some other way (e.g. `npm start`), reloading
# would mix that script with this file's arguments; start it fresh from ecosystem.config.cjs instead (a few seconds down).
expected="$(readlink -f "$(pwd)/node_modules/next/dist/bin/next")"
current="$(pm2 jlist 2>/dev/null | node -e '
  let raw = ""; process.stdin.on("data", (c) => (raw += c)).on("end", () => {
    try { const app = JSON.parse(raw).find((p) => p.name === process.argv[1]); process.stdout.write(app ? app.pm2_env.pm_exec_path : ""); }
    catch { process.stdout.write(""); }
  });' "master-web")"
# Compare real paths: with pnpm, node_modules/next is a symlink.
if [ -n "$current" ] && [ "$(readlink -f "$current")" != "$expected" ]; then
  echo "master-web runs $current, not $expected: starting it fresh."
  pm2 delete master-web
  pm2 start ecosystem.config.cjs --update-env
else
  pm2 startOrReload ecosystem.config.cjs --update-env
fi
pm2 save

echo "==> Health check"
for attempt in $(seq 1 20); do
  if curl -fsS "http://127.0.0.1:3001" > /dev/null; then
    echo "Web is up on port 3001."
    exit 0
  fi
  sleep 3
done
echo "Web did not answer on port 3001 after the deploy." >&2
pm2 logs master-web --lines 50 --nostream || true
exit 1
