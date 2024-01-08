import { Express } from 'express';
import indexController from './controllers/indexController';
export default function (app: Express) {
    app.get('/hcs', (req, res) => res.sendStatus(200));

    app.get('/', (req, res) => {
        res.redirect('/index');
    });
    app.route('/index').get(indexController.getIndexPage);

}