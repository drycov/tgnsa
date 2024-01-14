import bodyParser from "body-parser";
import express, { NextFunction, Request, Response } from "express";
import * as path from "path";
import logger from "../bot/utils/logger";

import loggerMiddleware from "./middlewares /loggerMiddleware";
import router from "./router";
const configPath = path.join(__dirname, '../', '../', `config.json`);
const config = require(configPath);
const app = express();
const currentDate = new Date().toLocaleString("ru-RU");

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