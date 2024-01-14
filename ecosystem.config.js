module.exports = {
  apps: [
    {
      name: "TTC_NSA",
      cwd: "/opt/ttcNSA/",
      script: "npm run start:prod",
      watch: false,
      autorestart: true,
      max_restarts: 10,
      ignore_watch: ["logs",".git", "node_modules","src/api", "sessions", ".vscode", "source", "config.json"],
      env_production: {
        NODE_ENV: "production",
        APP_TYPE: "PROD",
        PORT: "5000"
      },
      env_development: {
        NODE_ENV: "development",
        APP_TYPE: "DEV",
        PORT: "5000",
      },
    },
    {
      name: "WebApp",
      cwd: "/opt/ttcNSA/src/api/client",
      script: "npm start",
      watch: false,
      autorestart: true,
      max_restarts: 10,
      ignore_watch: [ "node_modules",".git", "config.json"],
      env_production: {
        NODE_ENV: "production",
      },
      env_development: {
        NODE_ENV: "development",
      },
    },
  ],
};
