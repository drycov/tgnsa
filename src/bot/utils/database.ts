import mongoose from "mongoose";
import util from "util";

import * as path from "path";
import logger from "./logger";
const configPath = path.join(__dirname, '../', '../', '../', `config.json`);
const config = require(configPath);
const currentDate = new Date().toLocaleString("ru-RU");

const connectToDatabase = () => {
  let action = connectToDatabase.name;
  let message = util.format(
    '{"date":"%s", "%s":"%s",',
    currentDate,
    "action",
    action
  );
  try {
    mongoose.connect(config.mongoURI, config.mongoOptions);
    message += util.format('"%s":"%s"}', "status", "DB connect");
    logger.info(message);
    return mongoose;
  } catch (error) {
    // console.error('Failed to connect to MongoDB', error);
    message += util.format('"%s":"%s"}', "error", error);
    logger.error(message);
    throw error;
  }
};

export default connectToDatabase;
