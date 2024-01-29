import express from 'express';
import cors from 'cors';
import http from 'http';
import bodyParser from 'body-parser';
import compression from 'compression';
import useragent from 'express-useragent';
// import loggerMiddleware from './middlewares/loggerMiddleware.js'
import router from './router.js'
import fail2ban from './middlewares/fail2banMiddleware.js';
import corsMiddleware from './middlewares/corsMiddleware.js';
const app = express();

// app.use(fail2ban.limiter)
// app.use(fail2ban.speedLimiter)
// app.use(fail2ban.botDetector)


app.use(cors());
app.use(corsMiddleware)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(compression({ level: 9 }));
app.use(useragent.express());
// app.disable('x-powered-by');
// app.disable('expires');

app.use(fail2ban.loggerMiddleware);
// app.use(fail2ban.blockIPMiddleware)
router(app);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ status: res.statusCode, error: 'Internal Server Error' });
});

const server = http.createServer(app);

export default server;