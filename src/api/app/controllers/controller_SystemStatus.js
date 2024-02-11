// controllers/controller_SystemStatus.js

import os from 'os';
import pm2 from 'pm2';
import utils from '../utils/utils.js';

const getSystemStatus = async () => {
    try {
        const list = await getList();

        const serviceNames = ['TTC_NSA', 'ApiServer']; // Замените на имена ваших сервисов
        const serviceStatuses = findServiceStatuses(serviceNames, list);

        const status = {
            hostname: os.hostname(),
            platform: os.platform(),
            arch: os.arch(),
            os: `${os.type()} ${os.release()}`,
            cpus: os.cpus().length,
            totalMemory: os.totalmem(),
            freeMemory: os.freemem(),
            uptime: os.uptime(),
            services: serviceStatuses,
        };

        return { status, error: false, };
    } catch (error) {
        console.error(`Error while fetching system status: ${error.message}`);
        const errorMessage = `Error during system status retrieval: ${error.message}`;
        return utils.logAndReturnError(errorMessage, 500);
    }
};

const getList = async () => {
    return new Promise((resolve, reject) => {
        pm2.connect((err) => {
            if (err) {
                console.error(err);
                reject(err);
                process.exit(2);
            }

            pm2.list((err, list) => {
                pm2.disconnect();
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    resolve(list);
                }
            });
        });
    });
};

const findServiceStatuses = (serviceNames, pm2List) => {
    return serviceNames.map((serviceName) => {
        const service = pm2List.find((item) => item.name === serviceName);

        if (!service) {
            return { [serviceName]: { error: 'Service not found' } };
        }
        return {
            [service.pm_id]: {
                name: service.name,
                pid: service.pid,
                status: service.pm2_env.status,
                memoryUsage: service.monit.memory,
                cpuUsage: service.monit.cpu,
                // env: service.pm2_env.env
                // Добавьте другие необходимые данные по вашему выбору
            },
        };
    });
};

export default getSystemStatus;
