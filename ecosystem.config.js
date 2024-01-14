module.exports = {
  apps: [
    {
      name: "TTC_NSA",
      cwd: "/opt/ttcNSA/",
      script: "npm run start:prod",
      watch: true,
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
      watch: true,
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
  deploy: {
    production: {
      host: "localhost",
      user: "root",
      ref: "origin/main", // Change to your default branch name
      repo: "https://github.com/drykov-ttc/ttcNSA.git", // HTTPS URL of your GitHub repo
      path: "/opt/ttcNSA",
      "post-deploy":
        "npm install && npm install --include dev && npm i -g typescript ts-node rimraf pre-commit nodemon copyfiles && npm run build && pm2 reload ecosystem.config.js --env production --trace",
    },
  },
};
