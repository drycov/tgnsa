import { createLogger, format as _format, transports as _transports } from 'winston';
import util from 'util';
import DailyRotateFile from 'winston-daily-rotate-file';


const logLevel = process.env.APP_TYPE === 'DEV' ? 'debug' : 'info';
const currentDate = new Date();
const options = { 
  timeZone: 'Europe/Moscow', // Укажите нужный вам часовой пояс
  hour12: false, // Формат 24 часа
};

const formattedDate = new Intl.DateTimeFormat('ru-RU', options).format(currentDate);


// Function Logger
const logger = createLogger({
    level: logLevel,
    format: _format.combine(
        _format.timestamp(),
        _format.printf(({ message }) => {
            return `${message}`;
        })
    ),
    transports: [new _transports.Console(), new DailyRotateFile({
        filename: '/opt/ttcNSA/logs/api_logs-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m', // Максимальный размер файла лога
        maxFiles: '14d', // Максимальное количество хранимых файлов
        level: 'info'
    })],
});

// Web Logger
const webLogger = createLogger({
    level: logLevel,
    format: _format.combine(
        _format.timestamp(),
        _format.printf(({ message }) => {
            return `${message}`;
        })
    ),
    transports: [new _transports.Console(), , new DailyRotateFile({
        filename: '/opt/ttcNSA/logs/web_logs-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m', // Максимальный размер файла лога
        maxFiles: '14d', // Максимальное количество хранимых файлов
        level: 'info'
    })],
});


const logError = (error, status, req) => {
    const userAgent = req.useragent || {};
    const { ip, method, url } = req;
    const errorMessage = `[${formattedDate}] ip: ${ip} ${method} ${url} status:${status} error: '${error}' {Browser: ${userAgent.browser} Version: ${userAgent.version} OS: ${userAgent.os} Device: ${userAgent.device}}`;
    webLogger.error(errorMessage);
};

const handleError = (message, data, error) => {
    message += util.format('"%s":"%s",', "data", data);
    message += util.format('"%s":"%s"}', "error", error);
    logger.error(message);
    throw error;
};

export { logger, webLogger, logError, handleError };