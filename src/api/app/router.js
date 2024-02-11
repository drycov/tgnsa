import getSystemStatus from "./controllers/controller_SystemStatus.js";
import userData from "./controllers/controller_UserManager.js";
import authenticateUser from "./controllers/controller_authUser.js";
import checkTokenMiddleware from "./middlewares/authMiddleware.js";

export default function (app) {
    app.route('/').get((req, res) => {
        // Redirect to /api/v1/
        res.redirect(301, '/api/');
    });

    app.route('/api/v1').get((req, res) => {
        res.json({ status: 200, api: 'v1' });
    });

    app.route('/api/v1/login')
        .post(async (req, res) => {
            const { token } = req.body;
            const result = await authenticateUser(token).then((result) => { return result });
            if (result.error) {
                if (typeof result.error === 'string' && result.error.includes("Internal")) {
                    res.status(500).json({ status: result.statusCode, api: 'v1', error: result.error, verify: result.verify,message:result.message });
                } else {
                    res.status(401).json({ status: result.statusCode, api: 'v1', error: result.error, verify: result.verify,message:result.message });
                }
                // Обработка ошибки
            } else {
                // Ответ при успешной авторизации
                res.json({ status: result.statusCode, api: 'v1', verify: result.verify, error: result.error });
            }
        });

    app.route('/api/v1/users').get(checkTokenMiddleware, async (req, res) => {
        const queryParams = req.query;
        let data = [];
        if (queryParams.action == "getAll") {
            data = await userData.getAllUsers().then((data) => { return data })
            res.json({ status: 200, api: 'v1', data });
        } else if (queryParams.action == "getUser") {
            if (!queryParams.id || typeof queryParams.id == "undefined") {
                data = await userData.getUserByTgId(req.user.tgId).then((data) => { return data })
            } else {
                data = await userData.getUserByTgId(queryParams.id).then((data) => { return data })
            }
            res.json({ status: 200, api: 'v1', data })
        } else {
            res.json({ status: 200, api: 'v1', data });
        }
    }).post(checkTokenMiddleware, async (req, res) => {
        const queryParams = req.query;
        if (queryParams.action == "update") {
            data = await userData.getUserByTgId(queryParams.id).then((data) => { return data })
            res.json({ status: 200, api: 'v1', data });
        }
    });
    app.route('/api/v1/system-status').get(checkTokenMiddleware, async (req, res) => {
        const result = await getSystemStatus();
        if (result.error) {
            if (result.error.includes("Internal")) {
                res.status(500).json({ status: 500, api: 'v1', error: result.error, verify: result.verify });
            } else {
                res.status(401).json({ status: 401, api: 'v1', error: result.error, verify: result.verify });
            }
            // Обработка ошибки
        } else {
            // Ответ при успешной авторизации
            res.json({ status: result.statusCode, api: 'v1', system: result.status, error: result.error });
        }
    });

    // Dynamically generate a list of routes with methods and access levels when a request is made to /api/
    app.route('/api/').get((req, res) => {
        const routes = app._router.stack
            .filter(layer => layer.route)
            .map(layer => {
                const route = layer.route;
                return {
                    path: route.path,
                    methods: Object.keys(route.methods).filter(method => method !== '_all'),
                    accessLevel: route.stack.find(middleware => middleware.name === 'checkTokenMiddleware') ? 'protected' : 'public'
                };
            });

        res.json({ status: 200, api: 'v1', routes });
    });

    app.route('/api/*').all((req, res) => {
        res.status(404).json({ status: 404, error: 'Not Found' });
    });
    // Создание GET маршрута

};