import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import { isbot } from "isbot";
import { webLogger as logger, logError,handleError,  } from '../utils/logger.js';
import util from 'util';
import SQLiteModule from '../utils/sqliteModule.js';

const sqliteModule = new SQLiteModule('/opt/ttcNSA/database.sqlite');
const createTableQuery = `
      CREATE TABLE IF NOT EXISTS blocked_ips (
        id INTEGER PRIMARY KEY,
        ip TEXT , date TEXT
      );
    `;
sqliteModule.createTable(createTableQuery);



const currentDate = new Date().toLocaleString("ru-RU");



// Middleware для ограничения количества запросов в единицу времени
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 5, // максимальное количество запросов
  message: 'Too many requests from this IP, please try again later.',
});

// Middleware для замедления частоты запросов
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 минут
  delayAfter: 3, // после 3 запросов
  delayMs: (used, req) => {
    const delayAfter = req.slowDown.limit;
    return (used - delayAfter) * 1000;
  },
});

// Middleware для обнаружения ботов
const botDetector = async (req, res, next) => {
  try {
    const action = botDetector.name;
    const message = util.format('{"date":"%s", "%s":"%s", ', currentDate, "action", action);

    const userAgent = req.headers['user-agent'];
    const isBotUserAgent = isbot(userAgent);

    if (isBotUserAgent) {
      // Handle bot request, for example, log it or take appropriate action
      logError(`Bot detected - Access forbidden for bots`, 403, req);
      handleError(message, "Bot detected:", userAgent);
      const clientIP = req.ip || req.connection.remoteAddress;
      await sqliteModule.addBlockedIP(clientIP);
      // Закрываем соединение с базой данных
      sqliteModule.closeConnection();
      return res.status(403).json({ status: res.statusCode, api: 'v1',  error: 'Access forbidden for bots.' });
    }

    // Continue to the next middleware if not a bot
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 500, api: 'v1', error: 'Internal Server Error' });
  }
};



const blockIPMiddleware = async (req, res, next) => {
  try {
    const clientIP = req.ip || req.connection.remoteAddress;
    const blockedIPs = await sqliteModule.getBlockedIPs();

    if (blockedIPs.includes(clientIP)) {
      // IP-адрес заблокирован
      return res.status(403).json({ status: res.statusCode, api: 'v1',  error: 'Access forbidden for your IP address.' });
    }

    // Продолжаем обработку запроса
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 500, api: 'v1', error: 'Internal Server Error' });
  }
};

const loggerMiddleware = (req, res, next) => {
  const userAgent = req.useragent || {};;
  const { ip, method, url } = req;
  const logMessage = `[${new Date().toISOString()}] ip: ${ip} ${method} ${url} status:${res.statusCode} {Browser: ${userAgent.browser} Version: ${userAgent.version} OS: ${userAgent.os}}`;
  logger.info(logMessage);
  next();
};

const fail2ban = { limiter, speedLimiter, botDetector, loggerMiddleware, blockIPMiddleware }
export default fail2ban;
