// PM2 process of the website on the EC2 server (scripts/deploy.sh starts or reloads it). Port 3001, as `pnpm start`.
module.exports = {
  apps: [
    {
      name: 'master-web',
      cwd: __dirname,
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3001',
      env: { NODE_ENV: 'production' },
      instances: 1,
      autorestart: true,
      max_memory_restart: '700M',
      time: true,
    },
  ],
};
