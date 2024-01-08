import { run } from "@grammyjs/runner";
import util from "util";
import https from "https";
import app from "./app/index";
import web from "./web/index";
import * as fs from "fs";
import logger from "./app/utils/logger";
import * as path from "path";
import helperFunctions from "./app/utils/helperFunctions";
import readline from "readline";

const currentDate = new Date().toLocaleString("ru-RU");
const configPath = path.join(__dirname, '../', `config.json`);
const config = require(configPath);
const port = process.env.PORT || config.port;

const runner = run(app);
let server: https.Server | null = null;

const options = {
  cert: fs.readFileSync(path.join(__dirname, './sslcert/fullchain.pem')),
  key: fs.readFileSync(path.join(__dirname, './sslcert/privkey.pem'))
};

function startServer(port: string | number) {
  server = https.createServer(options, web).listen(port, () => {
    const serverAddress = server?.address();
    if (serverAddress && typeof serverAddress !== "string") {
      const { address, port } = serverAddress;
      const hostname = address === "::" ? "localhost" : address;
      console.log(
        "\x1b[32m%s\x1b[0m",
        `Server is running at https://${hostname}:${port}`
      );
    } else {
      console.log("\x1b[32m%s\x1b[0m", `Server is running on ${serverAddress}`);
    }
  });
}

function restartServer(port: string | number) {
  if (server) {
    server.close(() => {
      console.log("\x1b[33m%s\x1b[0m", "Server stopped");
      startServer(port);
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

console.log(`NOWEB:${process.env.NOWEB} APP_TYPE:${process.env.APP_TYPE}`)
if (process.env.NOWEB && process.env.APP_TYPE === "DEV") {
  startServer(port);
}

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
