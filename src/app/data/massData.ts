import util from "util";
import { db } from '../utils/firebaseConfig';

import logger from "../utils/logger";
import MassIncidient from "../models/MassIncidient";
const currentDate = new Date().toLocaleString("ru-RU");
const massData = {
    saveMassData: async (miData: MassIncidient): Promise<any> => {
        let action = "saveMassData";
        let message = util.format(
            '{"date":"%s", "%s":"%s", "%s":"%s"}',
            currentDate,
            "action",
            action,
            "data",
            JSON.stringify(miData) // Преобразуем объект в строку JSON
        );
    
        try {
            const miCollection = db.collection('massIncidient');
            const newMIDoc = await miCollection.add(miData);
            const MIID = newMIDoc.id;
    
            message += util.format(
                ', "%s": "%s"}',
                "info",
                `Mass Incidient saved successfully: ${MIID}`
            );
            logger.info(message);
            return `${MIID}`;
        } catch (error) {
            message += util.format(
                ', "%s": "%s", "%s": "%s"}',
                "data",
                "Error saving Mass Incidient",
                "error",
                error
            );
            logger.error(message);
            throw error;
        }
    },
    getMassDataByMIID: (mi_id: string): Promise<any> => {
        let action = massData.getMassDataByMIID.name;
        let message = util.format(
            '{"date":"%s", "%s":%s","%s":"%s", ',
            currentDate,
            "action",
            action,
            "id",
            mi_id
        );
        return new Promise(async (resolve, reject) => {
            try {
                const miSnapshot = await db.collection('massIncidient').where('mi_id', '==', mi_id).get();
                if (!miSnapshot.empty) {
                    miSnapshot.forEach(doc => {
                        resolve(doc.data()); // Резолв промиса с данными пользователя
                    });
                } else {
                    // User data not found
                    message += util.format(
                        '"%s":"%s"}',
                        "status",
                        `Mass Incidient with id: ${mi_id} not found`
                    );
                    logger.error(message);
                    console.log("Mass Incidient with id", mi_id, "not found.");
                    resolve(null); // Resolve the promise with null if user not found
                }
            } catch (error) {
                message += util.format(
                    '"%s":"%s",',
                    "data",
                    "Error fetching Mass Incidient data"
                );
                message += util.format('"%s":"%s"}', "error", error);
                logger.error(message);
                reject(error);
            }
        });
    },
    generateNextMiId: async () => {
        try {
            // Получаем ссылку на коллекцию MassIncident
            const collectionRef = db.collection('MassIncident');

            // Получаем документ с самым высоким идентификатором, сортируя по убыванию идентификаторов
            const querySnapshot = await collectionRef.orderBy('_id', 'desc').limit(1).get();

            let highestId = 0;
            // Если есть документ с самым высоким идентификатором, получаем его значение
            if (!querySnapshot.empty) {
                querySnapshot.forEach(doc => {
                    highestId = parseInt(doc.id.slice(3)); // Получаем число из идентификатора документа
                });
            }

            const nextIdNumber = highestId + 1;
            const paddedNextId = nextIdNumber.toString().padStart(6, '0');
            const miId = `${paddedNextId}`;

            return miId;
        } catch (error) {
            console.error('Error generating mi_id:', error);
            throw error; // Выбрасываем ошибку
        }
    }
}
export default massData;
