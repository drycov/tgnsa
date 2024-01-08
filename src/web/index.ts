import os from "os";
import * as path from "path";
import bodyParser from "body-parser";
import compression from "compression";
import cookieParser from 'cookie-parser';
import util from "util";
import express, { NextFunction, Request, Response } from "express";
import cookieSession from 'cookie-session';
import expressLayouts from "express-ejs-layouts";
import useragent from "express-useragent";
import process from "process";
// import * as favicon from "serve-favicon";

import logger from "../app/utils/logger";
import loggerMiddleware from "./middlewares/loggerMiddleware";
import corsMiddleware from "./middlewares/corsMiddleware";
import helmet from "helmet";

import router from "./router";

const configPath = path.join(__dirname, '../', '../', `config.json`);
const config = require(configPath);

const uptimeInSeconds = process.uptime();

const app = express();

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
// app.use(favicon(path.join(__dirname, "./public", "favicon.ico")));
app.use(express.static(path.join(__dirname, "./static")));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      'script-src': ["'self'", 'https://gc.kis.v2.scr.kaspersky-labs.com', 'wss://gc.kis.v2.scr.kaspersky-labs.com', 'https://telegram.org', 'https://www.google.com', "'unsafe-inline'"],
    },
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(expressLayouts);
app.enable("view cache");
app.set("layout", "layouts/main");
app.set("layout extractScripts", true);
app.set("views", path.join(__dirname, "views"));
app.disable("x-powered-by");
app.disable("expires");
app.use(loggerMiddleware);
// app.use(corsMiddleware);
router(app);



app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).render("error", {
    error: true,
    title: "Error",
    name: "Error",
    messages: {
      pageTitle: "Internal Server Error",
      status: res.statusCode,
      text: "Internal Server Error",
    },
  });
});
export default app;