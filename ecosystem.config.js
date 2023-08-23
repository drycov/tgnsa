module.exports = {
  apps: [{
    name: "TTC_NSA",
    cwd: "/opt/ttcNSA/",
    script: "node_modules/.bin/ts-node",
    args: "./bot.ts",
    env_production: {
      NODE_ENV: "production",
      APP_TYPE: "PROD"
    },
    env_development: {
      NODE_ENV: "development",
      APP_TYPE: "DEV"
    }
  }], 
  deploy: {
    production: {
      host:'localhost',
      user:"root",
      ref: "origin/main", // Change to your default branch name
      repo: "https://github.com/drykov-ttc/ttcNSA.git", // HTTPS URL of your GitHub repo
      path: "/opt/ttcNSA",
      "post-deploy": "npm install && pm2 reload ecosystem.config.js --env production"
    },
  }
};