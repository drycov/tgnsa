import { Express, Response, Request } from 'express';

export default function (app: Express) {
    app.get('/', (req: Request, res: Response) => {
        // Ваш обработчик запроса
        res.status(200).json({ "status": "ok" });
    });
}
