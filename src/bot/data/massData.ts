import util from "util";
import { rdb } from '../utils/firebaseConfig'; // Используем rdb вместо db

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
      JSON.stringify(miData)
    );

    try {
      const miRef = rdb.ref('massIncidient'); // Используем ссылку на узел в Realtime Database
      const newMIDoc = await miRef.push(miData);
      const MIID = newMIDoc.key;

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
        const miRef = rdb.ref('massIncidient'); // Используем ссылку на узел в Realtime Database
        const miSnapshot = await miRef.orderByChild('mi_id').equalTo(mi_id).once('value');

        if (miSnapshot.exists()) {
          resolve(miSnapshot.val()); // Резолв промиса с данными пользователя
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
      // Получаем ссылку на узел MassIncident в Realtime Database
      const miRef = rdb.ref('MassIncident');

      // Получаем данные о всех MassIncident
      const snapshot = await miRef.once('value');
      let highestId = 0;

      // Если есть данные, определяем самый высокий идентификатор
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          const currentId = parseInt(child.key!); // Получаем число из идентификатора
          if (currentId > highestId) {
            highestId = currentId;
          }
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
  },
};

export default massData;
