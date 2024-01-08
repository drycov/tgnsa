import { Request, Response, NextFunction } from 'express';

export default {
    getIndexPage: (req: Request, res: Response) => {
        // Ваш код для обработки запроса на страницу "index" здесь
        res.render('pages/index', {
            title: 'home',
            name: 'tgnasa',

            // Другие данные, которые нужно передать в представление
        });
    }

}
