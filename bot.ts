// Пример использования ESM синтаксиса в файле bot.ts
import app from './app/app';
import { run } from "@grammyjs/runner";
import database from "./app/utils/database";

const startBot = async () => {
    const runner = run(app);

    if (runner.isRunning()) {
        await app.init();
        console.log(`${app.botInfo.username} Started`);
        database();
    }

    const stopRunner = () => {
        if (runner.isRunning()) {
            console.log(`${app.botInfo.username} Stopped`);
            runner.stop();
        }
    };

    process.once("SIGINT", stopRunner);
    process.once("SIGTERM", stopRunner);
};

startBot(); // Вызываем асинхронную функцию
