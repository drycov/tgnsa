import util from "util";
import { db } from '../utils/firebaseConfig';
import logger from "../utils/logger";
import User from "../models/User";

const currentDate = new Date().toLocaleString("ru-RU");

const saveUser = async (userData: User): Promise<string> => {
    const action = "saveUser";
    let message = util.format('{"date":"%s", "%s":%s","%s":"%s", ', currentDate, "action", action);

    try {
        const customDocId = userData.tgId.toString();

        const usersCollection = db.collection('users');
        const docRef = usersCollection.doc(customDocId);

        const newUserDoc = await docRef.set(userData).then(() => {
            message += util.format('"%s": "%s"}', "info", `User saved successfully: ${customDocId}`);
            logger.info(message);
            return customDocId;
        })
            .catch((error) => {
                handleError(message, "Error saving user", error);
                return error;
            });
        return newUserDoc;
    } catch (error) {
        handleError(message, "Error saving user", error);
        throw error;
    }
};

const getUserDataByTgId = async (tgId: string): Promise<any> => {
    const action = getUserDataByTgId.name;
    const message = util.format('{"date":"%s", "%s":%s","%s":"%s", ', currentDate, "action", action, "id", tgId);

    try {
        const userSnapshot = await db.collection('users').where('tgId', '==', tgId).get();

        if (userSnapshot.empty) {
            handleUserNotFound(message, tgId);
            return null;
        }

        const userData = userSnapshot.docs[0].data();
        return userData;
    } catch (error) {
        handleError(message, "Error fetching user data", error);
        throw error;
    }
};

const getAdminsUsers = async (): Promise<any> => {
    const action = getAdminsUsers.name;
    const message = util.format('{"date":"%s", "%s":%s", ', currentDate, "action", action);

    try {
        const adminsSnapshot = await db.collection('users').where('isAdmin', '==', true).get();

        const admins: FirebaseFirestore.DocumentData[] = [];
        if (!adminsSnapshot.empty) {
            adminsSnapshot.forEach(doc => admins.push(doc.data()));
            return admins;
        } else {
            handleNoAdminUsersFound(message);
            return [];
        }
    } catch (error) {
        handleError(message, "Error fetching admin users", error);
        throw error;
    }
};

const handleError = (message: string, data: string, error: any): void => {
    message += util.format('"%s":"%s",', "data", data);
    message += util.format('"%s":"%s"}', "error", error);
    logger.error(message);
    throw error;
};

const handleUserNotFound = (message: string, tgId: string): void => {
    message += util.format('"%s":"%s"}', "status", `User with id: ${tgId} not found`);
    logger.error(message);
};

const handleNoAdminUsersFound = (message: string): void => {
    message += util.format('"%s":"%s"}', "status", `No admin users found`);
    logger.error(message);
};

const userData = { saveUser, getUserDataByTgId, getAdminsUsers };

export default userData;
