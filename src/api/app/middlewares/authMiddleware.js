import fs from 'fs/promises';
import jwt from 'jsonwebtoken';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import userData from '../controllers/controller_UserManager.js';
import { logError, logger } from '../utils/logger.js';
import utils from '../utils/utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const configPath = join(__dirname, './../../../../', 'config.json');
let config;

try {
    config = JSON.parse(await fs.readFile(configPath, 'utf8'));
} catch (e) {
    const error = {
        date: utils.currentDate,
        error: e.message,
    };
    logger.error(JSON.stringify(error));
}

const checkTokenMiddleware = async (req, res, next) => {
    const { useragent, headers, ip, method, url } = req;
    const { browser, version, os, device } = useragent;
    const token = headers.authorization;
    const decodedToken = jwt.decode(token)
    if (!token) {
        logError('Unauthorized - Token not provided', 401, req);
        const error = {
            date: utils.currentDate,
            ip: req.ip,

            error: 'Token not provided',
        };
        logger.error(JSON.stringify(error));
        return res.status(401).json({ status: res.statusCode, api: 'v1', error: 'Unauthorized - Token not provided' });
    }
    let user = '';
    try {
        user = await userData.getUserByTgId(decodedToken.tgId).then((data) => { return data })
    } catch (e) {
        const error = {
            date: utils.currentDate,
            ip: req.ip,
            error: e.message,
        };
        logger.error(JSON.stringify(error));
    }
    jwt.verify(token, user.hash, (err, decoded) => {
        if (err) {
            const errorType = err.name === 'TokenExpiredError' ? 'Token has expired' : 'Invalid token';
            logError(`Unauthorized - ${errorType}`, 401, req);
            const error = {
                date: utils.currentDate,
                ip: req.ip,
                error: errorType,
            };
            logger.error(JSON.stringify(error));
            return res.status(401).json({ status: res.statusCode, api: 'v1', error: `Unauthorized - ${errorType}` });
        }
        req.user = decoded;
        next();
    });
};

export default checkTokenMiddleware;