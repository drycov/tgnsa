import os from "os";
import * as path from "path";
import bodyParser from "body-parser";
import compression from "compression";
import cookieParser from 'cookie-parser';
import util from "util";
import express, { NextFunction, Request, Response } from "express";
import cookieSession from 'cookie-session';
import useragent from "express-useragent";
import process from "process";
import logger from "../bot/utils/logger";

import router from "./router";
import loggerMiddleware from "./middlewares /loggerMiddleware";
import { error } from "console";
const configPath = path.join(__dirname, '../', '../', `config.json`);
const config = require(configPath);
const app = express();
const currentDate = new Date().toLocaleString("ru-RU");

app.use(
  cookieSession({
    name: 'session',
    keys: [config.sesionKey,], // Replace with your secret keys
    maxAge: 60 * 60 * 1000, // 1 hours
  })
);

app.use(cookieParser());
app.use(useragent.express());
app.use(compression());
app.use(express.static(path.join(__dirname, "./static")));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.disable("x-powered-by");
app.disable("expires");
app.use(loggerMiddleware);

router(app);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  const error = {
    date: currentDate,
    status: res.statusCode,
    error: err.message as string,
  };
  logger.error(JSON.stringify(error));
  res.status(500).json(JSON.stringify(error));
});
export default app;