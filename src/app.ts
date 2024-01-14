import { run } from "@grammyjs/runner";
import util from "util";
import { Server, createServer } from "http";
import app from "./bot/bot";
import web from "./api/api";
import * as fs from "fs";
import logger from "./bot/utils/logger";
import * as path from "path";
import helperFunctions from "./bot/utils/helperFunctions";
import readline from "readline";

const currentDate = new Date().toLocaleString("ru-RU");
const configPath = path.join(__dirname, '../', `config.json`);
const config = require(configPath);
const port = process.env.PORT || 5000;

const runner = run(app);

// server: Server | null = null;

let server: Server | null = null;

const options = {
  cert: fs.readFileSync(path.join(__dirname, './sslcert/fullchain.pem')),
  key: fs.readFileSync(path.join(__dirname, './sslcert/privkey.pem'))
};

function startAPIServer(port: string | number) {
  const serverPort = typeof port === 'string' ? parseInt(port, 10) : port;
  
  web.listen(serverPort, () => console.log( "\x1b[32m%s\x1b[0m",`Listening on port ${port}`)); //Строка 6
}

function restartServer(port: string | number) {
  if (server) {
    server.close(() => {
      console.log("\x1b[33m%s\x1b[0m", "Server stopped");
      startAPIServer(port);
    });
  } else {
    console.log("Server is not running, cannot restart.");
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.on("line", (input) => {
  if (input === "stop") {
    rl.pause();
    rl.question(
      "Вы действительно хотите остановить сервер? (yes/no) ",
      (answer) => {
        if (answer.toLowerCase() === "yes") {
          process.emit("SIGINT");
        } else {
          rl.resume();
        }
      }
    );
  } else if (input === "restart") {
    rl.pause();
    restartServer(port);
  }
});

const startApplication = async () => {
  await helperFunctions.saveConfigToFirestore();
  helperFunctions.monitorFirestoreChanges();

  try {
    const status = runner.isRunning();
    await app.init();

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
startAPIServer(port);



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
  if (server) {
    server.close(() => {
      console.log("\x1b[33m%s\x1b[0m", "Server stopped");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

rl.prompt();
