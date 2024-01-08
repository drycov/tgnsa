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
import favicon from "serve-favicon";

import logger from "../app/utils/logger";


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
  app.use(favicon(path.join(__dirname, "./public", "favicon.ico")));
  app.use("/public", express.static(path.join(__dirname, "./public")));
  