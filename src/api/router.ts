import { Express, Response, Request } from 'express';

export default function (app: Express) {
    app.get('/', (req: Request, res: Response) => {
        const jsonData = {
            status: 'ok'
        };
        // Ваш обработчик запроса
        res.json(jsonData);
    });
    app.get('/express_backend', (req, res) => {
        const jsonData = {
            express: 'YOUR EXPRESS BACKEND IS CONNECTED TO REACT'
        };
        res.json(jsonData); //Строка 10
    }); //Строка 11
}
