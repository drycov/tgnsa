module.exports = {
  apps: [
    {
      name: "TTC_NSA",
      cwd: "/opt/ttcNSA/",
      script: "npm run start:prod",
      watch: false,
      autorestart: true,
      max_restarts: 10,
      ignore_watch: ["logs", ".git", "node_modules", "src/api", "sessions", ".vscode", "source", "config.json"],
      env: {
        NODE_ENV: "production",
        APP_TYPE: "PROD",
        HOST: "91.185.5.210",
        PORT: "5000"
      },
    },
    {
      name: "ApiServer",
      cwd: "/opt/ttcNSA/src/api",
      script: "npm start",
      watch: true,
      autorestart: true,
      max_restarts: 10,
      ignore_watch: ["node_modules", ".git", "config.json"],
      env: {
        NODE_ENV: "production",
      }
    },
    
  ],
};
