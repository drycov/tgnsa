import { logError, logger } from './logger.js';

const utils = {
    currentDate: new Date().toLocaleString("ru-RU"),
    logAndReturnError: (errorMessage, statusCode = 500, verify = false) => {
        const errorData = {
            date: utils.currentDate,
            error: errorMessage,
        };

        logger.error(JSON.stringify(errorData));

        if (statusCode === 500) {
            errorMessage = 'Internal Server Error';
        }
        return { message: errorMessage, statusCode: statusCode, verify: verify, error: true };
    }
}

export default utils
    