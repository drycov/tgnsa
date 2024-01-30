import winston from "winston";
import DailyRotateFile from 'winston-daily-rotate-file';

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
    new DailyRotateFile({
      filename: './logs/bot_logs-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m', // Максимальный размер файла лога
      maxFiles: '14d', // Максимальное количество хранимых файлов
      level: "info" 
    }),
  ],
});

export default logger;
