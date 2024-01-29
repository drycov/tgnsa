import util from "util";
import firebaseConfig from '../utils/firebaseConfig.js';
import User from "../models/User.js";
import { logger,handleError } from "../utils/logger.js";


const currentDate = new Date().toLocaleString("ru-RU");

const handleResultNotFound = (message, status, description) => {
    message += util.format('"%s":"%s"', "status", status);
    if (description) {
        message += util.format(', "%s":"%s"}', "description", description);
    } else {
        message += util.format('}');
    }
        
    
logger.error(message);
};

const getAllUsers = async () => {
    const action = getAllUsers.name;
    const message = util.format('{"date":"%s", "%s":"%s", ', currentDate, "action", action);

    try {
        const userSnapshot = await firebaseConfig.db.collection('users').get();

        if (userSnapshot.empty) {
            handleResultNotFound(message, "No users found");
        }

        const allUsers = userSnapshot.docs.map(doc => doc.data());
        return allUsers;
    } catch (error) {
        handleError(message, "Error fetching user data", error);
    }
};

const getUserByTgId = async (tgId) => {
    const action = getUserByTgId.name;
    const message = util.format('{"date":"%s", "%s":%s","%s":"%s", ', currentDate, "action", action, "id", tgId);
    let id = parseInt(tgId);

    try {
        const userSnapshot = await firebaseConfig.db.collection('users').where('tgId', '==', parseInt(tgId)).get();

        if (userSnapshot.empty) {
            handleResultNotFound(message, "User not found", `User with id: ${tgId} not found`);
            return null;
        }

        const userData = userSnapshot.docs[0].data();
        return userData;
    } catch (error) {
        handleError(message, "Error fetching user data", error);
        throw error;
    }
};

const getAdminsUsers = async () => {
    const action = getAdminsUsers.name;
    const message = util.format('{"date":"%s", "%s":%s", ', currentDate, "action", action);

    try {
        const adminsSnapshot = await firebaseConfig.db.collection('users').where('isAdmin', '==', true).get();

        if (adminsSnapshot.isEmpty) {
            handleResultNotFound(message, "No admin users found");
            return [];
        }

        const admins = adminsSnapshot.docs.map(doc => doc.data());
        return admins;
    } catch (error) {
        handleError(message, "Error fetching admin users", error);
        throw error;
    }
};

const updateUser = async (tgId, updatedUserData) => {
    const action = updateUser.name;
    const message = util.format('{"date":"%s", "%s":%s", ', currentDate, "action", action);

    try {
        // Найти id документа по tgId
        const querySnapshot = await firebaseConfig.db.collection('users').where('tgId', '==', parseInt(tgId)).get();

        if (querySnapshot.empty) {
            handleResultNotFound(message, "User not found", `User with id: ${tgId} not found`);
            return null;
        }

        // Взять первый документ из результатов запроса (предполагается, что tgId уникально)
        const userDoc = querySnapshot.docs[0];

        // Получить ссылку на документ
        const userRef = userDoc.ref;

        // Обновить данные документа
        await userRef.update(updatedUserData);

        // Получить обновленные данные
        const updatedUserSnapshot = await userRef.get();
        const updatedUser = updatedUserSnapshot.data();

        return updatedUser;
    } catch (error) {
        handleError(message, "Error updating user data", error);
        throw error;
    }
};

const userData = { getAllUsers, getUserByTgId, getAdminsUsers, updateUser };

export default userData;
