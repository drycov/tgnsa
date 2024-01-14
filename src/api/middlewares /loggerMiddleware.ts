import { Request, Response, NextFunction } from "express";
const logLevel = process.env.APP_TYPE === "DEV" ? "debug" : "info";

const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const userAgent = req.useragent;

  const browser = userAgent?.browser;
  const version = userAgent?.version;
  const os = userAgent?.os;

  console.log(
    `[${new Date().toISOString()}] ip: ${req.ip} ${req.method} ${
      req.url
    } status:${
      res.statusCode
    } {Browser: ${browser} Version: ${version} OS: ${os} }`
  );
  next();
};

export default loggerMiddleware;