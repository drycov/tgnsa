import jwt from 'jsonwebtoken';
import util from 'util';
import userData from '../controllers/controller_UserManager.js';
import { logError, logger } from '../utils/logger.js';
import utils from '../utils/utils.js';

const verifyToken = util.promisify(jwt.verify);

const authenticateUser = async (token) => {
    try {
        if (!token) {
            return utils.logAndReturnError('Token not provided', 401);
        }

        const decodedToken = jwt.decode(token);

        if (!decodedToken) {
            return utils.logAndReturnError('Invalid token', 401);
        }

        const user = await getUserByTgId(decodedToken.tgId);

        if (!user) {
            return utils.logAndReturnError('User not found', 401);
        }

        const decoded = await verifyToken(token, user.hash);
        if(decoded){
            return { message: 'Authorization successful', verify: true, error: false, statusCode: 200 };
        }
    } catch (error) {
        return utils.logAndReturnError(`Error during authentication: ${error.message}`, 500);
    }
};

const getUserByTgId = async (tgId) => {
    try {
        return await userData.getUserByTgId(tgId);
    } catch (error) {
        return utils.logAndReturnError(error.message);
    }
};


export default authenticateUser;
