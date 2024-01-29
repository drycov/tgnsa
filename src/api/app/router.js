import userData from "./controllers/controller_UserManager.js";
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
        .get((req, res) => {
            res.json({ status: 200, api: 'v1', verify: true });
        })
        .post((req, res) => {
            res.json({ status: 200, api: 'v1', verify: true });
        });

    app.route('/api/v1/verify').get((req, res) => {
        
        res.json({ status: 200, api: 'v1', verify: true });
    });

    app.route('/api/v1/users').get(checkTokenMiddleware, async (req, res) => {
        const queryParams = req.query;
        let data = [];
        if (queryParams.action == "getAll") {
            data = await userData.getAllUsers().then((data) => { return data })
            res.json({ status: 200, api: 'v1', data });
        } else if (queryParams.action == "getUser") {
            data = await userData.getUserByTgId(queryParams.id).then((data) => { return data })
            res.json({ status: 200, api: 'v1', data })
        } else {
            res.json({ status: 200, api: 'v1', data });
        }


    }).post(checkTokenMiddleware, async (req, res) => {});
    app.route('/api/v1/validate').get((req, res) => {
        res.json({ status: 200, api: 'v1', verify: true });
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