import app from './app/app';

import { run } from "@grammyjs/runner";
import database from "./app/utils/database";

const runner = run(app);
database();


const stopRunner = () => {
    if (runner.isRunning()) {
        console.log(`${app.botInfo.username} Stopped`);
        runner.stop();
    }
};

process.once("SIGINT", stopRunner);
process.once("SIGTERM", stopRunner);
