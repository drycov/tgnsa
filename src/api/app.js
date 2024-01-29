import readline from 'readline';
import app from './app/api.js';

const port = process.env.PORT || 5000;
const address = process.env.HOST || "localhost";
let server = app.listen(port, address, () => {
    const { address, port } = server.address();
    console.log('\x1b[32m%s\x1b[0m', `Server is running at http://${address}:${port}`);
});
// Функция для перезапуска сервера
function restartServer() {
}

// Обработчик события SIGINT для завершения работы сервера
process.on('SIGINT', () => {
    server.close(() => {
        console.log('\x1b[33m%s\x1b[0m', 'Server stopped');
        process.exit(0);
    });
});

// Обработка команд для завершения работы сервера или перезапуска
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.on('line', (input) => {
    if (input === 'stop') {
        rl.pause();
        rl.question('Вы действительно хотите остановить сервер? (yes/no) ', (answer) => {
            if (answer.toLowerCase() === 'yes') {
                process.emit('SIGINT');
            } else {
                rl.resume();
            }
        });
    } else if (input === 'restart') {
        rl.pause();
        restartServer();
    }
});

process.on('SIGINT', () => {
    rl.close();
});

rl.prompt();