import winston from "winston";

const logLevel = process.env.APP_TYPE === "DEV" ? "debug" : "info";

const logger = winston.createLogger({
  level: logLevel, // Используем logLevel в зависимости от значения process.env.APP_TYPE
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ message }) => {
      return `${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "./logs/bot_logs.log", level: "info" }),
  ],
});

export default logger;
