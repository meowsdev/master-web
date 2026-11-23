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
pm2 startOrReload ecosystem.config.cjs --update-env
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
