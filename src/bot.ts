import { run } from "@grammyjs/runner";
import util from "util";
import https from "https"
import io from "@pm2/io"

import app from "./app/index";
import database from "./app/utils/database";
import logger from "./app/utils/logger";

import * as path from "path";
import helperFunctions from "./app/utils/helperFunctions";
const configPath = path.join(__dirname, '../', `config.json`);
const config = require(configPath);
const port = process.env.PORT || config.port;

const currentDate = new Date().toLocaleString("ru-RU");

const runner = run(app);
let server: https.Server;

function startServer(port: string | number) {
  const server = https.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });

    res.end(`<html><head>
    <!-- ... -->
    <script src="https://telegram.org/js/telegram-web-app.js"></script>
    <!-- ... other scripts -->
  </head><body>
    Привет мир! Это HTTP сервер!
    
    </body></html>`);
  });
    
  server.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
  });
}
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
// PM2_PUBLIC_KEY=8bttggxx2kqgol6
// PM2_SECRET_KEY=2uv8dlcc0y6lul2
io.init({

  tracing:true,
  apmOptions:{
    appName:"tgnsa",
    publicKey:"8bttggxx2kqgol6",
    secretKey:"2uv8dlcc0y6lul2"
  }
  // transactions: true // will enable the transaction tracing
  // http: true // will enable metrics about the http server (optional)
})

if(!process.env.NOWEB && process.env.APP_TYPE == "DEV"){
  startServer(port);
}

console.log(process.env.NOWEB,process.env.APP_TYPE )


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
