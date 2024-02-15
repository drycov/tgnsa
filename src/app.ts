import { run } from "@grammyjs/runner";
import util from "util";
import app from "./bot/bot";
import helperFunctions from "./bot/utils/helperFunctions";
import logger from "./bot/utils/logger";

const currentDate = new Date().toLocaleString("ru-RU");

const runner = run(app);


const startApplication = async () => {
  await helperFunctions.saveConfigToRealtimeDb();
  helperFunctions.monitorRealtimeDbChanges();

  try {
    await app.init();
    const status = runner.isRunning();
    const message = util.format(
      '{"date":"%s", "%s":"%s", "%s":"%s"}',
      currentDate,
      "action",
      startApplication.name,
      "status",
      status ? `${app.botInfo.username} Running` : `${app.botInfo.username} Not Running`
    );
    logger.info(message);
  } catch (error) {
    const errorMessage = util.format('{"date":"%s", "%s":"%s", "%s":"%s"}', currentDate, "action", startApplication.name, "error", error);
    logger.error(errorMessage);
  }
};

startApplication();

const stopRunner = () => {
  const action = stopRunner.name;
  const message = util.format(
    '{"date":"%s", "%s":"%s", "%s":"%s"}',
    currentDate,
    "action",
    action,
    "status",
    `${app.botInfo.username} Stopped`
  );

  if (runner.isRunning()) {
    logger.info(message);
    runner.stop();
  }
};

const gracefulShutdown = () => {
  stopRunner();
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);