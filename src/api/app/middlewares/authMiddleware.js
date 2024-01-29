import fs from 'fs/promises';
import jwt from 'jsonwebtoken';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { logError } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const configPath = join(__dirname, './../../../../', 'config.json');
let config;

try {
    config = JSON.parse(await fs.readFile(configPath, 'utf8'));
} catch (e) {
    console.error(e);
}

const checkTokenMiddleware = (req, res, next) => {
    const { useragent, headers, ip, method, url } = req;
    const { browser, version, os, device } = useragent;
    const token = headers.authorization;



    if (!token) {
        logError('Unauthorized - Token not provided', 401, req);
        return res.status(401).json({ status: res.statusCode, api: 'v1', error: 'Unauthorized - Token not provided' });
    }

    jwt.verify(token, config.sesionKey, (err, decoded) => {
        // res.json({ status: 200, api: 'v1', data })
        if (err) {
            const errorType = err.name === 'TokenExpiredError' ? 'Token has expired' : 'Invalid token';
            logError(`Unauthorized - ${errorType}`, 401, req);
            return res.status(401).json({ status: res.statusCode, api: 'v1', error: `Unauthorized - ${errorType}` });
        }

        req.user = decoded;
        next();
    });
};

export default checkTokenMiddleware;
