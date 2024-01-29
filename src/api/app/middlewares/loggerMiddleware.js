// import { webLogger } from "../utils/logger.js";
// const loggerMiddleware = (req, res, next) => {
//   const userAgent = req.useragent;

//   const browser = userAgent.browser;
//   const version = userAgent.version;
//   const os = userAgent.os;
//   const device = userAgent.device;
//   const logMessage = `[${new Date().toISOString()}] ip: ${req.ip} ${req.method} ${req.url} status:${res.statusCode} {Browser: ${browser} Version: ${version} OS: ${os} Device: ${device}}`;
//   // Log to the console
//   console.log(logMessage);

//   // Log to the web logger file
//   webLogger.info(logMessage);
//   next();
// }

// export default loggerMiddleware;