import database from "./app/utils/database";
import { GrammyError, HttpError } from 'grammy';
import bot from './app/bot'

import { run } from "@grammyjs/runner";

const runner = run(bot);

database();

bot.catch((err: any) => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}:`);
    const e = err.error;
    if (e instanceof GrammyError) {
        console.error("Error in request:", e.description);
    } else if (e instanceof HttpError) {
        console.error("Could not contact Telegram:", e);
    } else {
        console.error("Unknown error:", e);
    }
});

const stopRunner = () => {
    if (runner.isRunning()) {
        console.log(`${bot.botInfo.username} Stopped`);
        runner.stop();
    }
};

process.once("SIGINT", stopRunner);
process.once("SIGTERM", stopRunner);
