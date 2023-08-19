import winston from 'winston';
// import { Syslog } from 'winston-syslog';


const logger = winston.createLogger({
  level: 'info', // Минимальный уровень логов для вывода
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ message }) => {
      return `${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(), // Вывод в консоль
    new winston.transports.File({ filename: 'logs.log', level: 'info' })
  ]
});

export default logger;
