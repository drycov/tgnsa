import { createLogger, format as _format, transports as _transports } from 'winston';
import util from 'util';

const logLevel = process.env.APP_TYPE === 'DEV' ? 'debug' : 'info';


// Function Logger
const logger = createLogger({
    level: logLevel,
    format: _format.combine(
        _format.timestamp(),
        _format.printf(({ message }) => {
            return `${message}`;
        })
    ),
    transports: [new _transports.File({ filename: '/opt/ttcNSA/logs/api_logs.log', level: 'info' })],
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
    transports: [new _transports.Console(), new _transports.File({ filename: '/opt/ttcNSA/logs/web_logs.log', level: 'info' })],
});


const logError = (error, status, req) => {
    const userAgent = req.useragent || {};
    const { ip, method, url } = req;
    const errorMessage = `[${new Date().toISOString()}] ip: ${ip} ${method} ${url} status:${status} error: '${error}' {Browser: ${userAgent.browser} Version: ${userAgent.version} OS: ${userAgent.os} Device: ${userAgent.device}}`;
    webLogger.error(errorMessage);
};

const handleError = (message, data, error) => {
    message += util.format('"%s":"%s",', "data", data);
    message += util.format('"%s":"%s"}', "error", error);
    logger.error(message);
    throw error;
};

export { logger, webLogger, logError, handleError };