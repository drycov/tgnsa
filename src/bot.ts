import { run } from "@grammyjs/runner";
import util from "util";
import app from "./app/index";
import database from "./app/utils/database";
import logger from "./app/utils/logger";

import * as path from "path";
import helperFunctions from "./app/utils/helperFunctions";
const configPath = path.join(__dirname, '../', `config.json`);
const config = require(configPath);

const currentDate = new Date().toLocaleString("ru-RU");

const runner = run(app);

const startApplication = async () => {
  let action = startApplication.name;
  await helperFunctions.saveConfigToFirestore();
  helperFunctions.monitorFirestoreChanges();
  let message = util.format(
    '{"date":"%s", "%s":"%s",',
    currentDate,
    "action",
    action
  );
  try {
    // await database();
    const status = runner.isRunning();
    await app.init();
    message += util.format(
      '"%s":"%s"}',
      "status",
      status
        ? `${app.botInfo.username} Running`
        : `${app.botInfo.username} Not Running`
    );
    logger.info(message);
  } catch (error) {
    console.error("Error during initialization:", error);
    message += util.format('"%s":"%s"}', "error", error);
    logger.error(message);
  }
};

startApplication();

const stopRunner = () => {
  let action = stopRunner.name;
  let message = util.format(
    '{"date":"%s", "%s":"%s",',
    currentDate,
    "action",
    action
  );
  if (runner.isRunning()) {
    message += util.format(
      '"%s":"%s"}',
      "status",
      `${app.botInfo.username} Stopped`
    );
    logger.info(message);
    runner.stop();
  }
};

process.once("SIGINT", stopRunner);
process.once("SIGTERM", stopRunner);
