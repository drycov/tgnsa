import util from "util";
import { db, rdb } from '../utils/firebaseConfig';
import logger from "../utils/logger";
import User from "../models/User";

const currentDate = new Date().toLocaleString("ru-RU");

const handleError = (message: string, data: string, error: any): void => {
    message += util.format('"%s":"%s",', "data", data);
    message += util.format('"%s":"%s"}', "error", error);
    logger.error(message);
    throw error;
};


const handleResultNotFound = (message: string, status: string, description?: string): void => {
    message += util.format('"%s":"%s"', "status", status);

    if (description) {
        message += util.format(', "%s":"%s"}', "description", description);
    } else {
        message += util.format('}');
    }

    logger.error(message);
};

// const saveUser = async (userData: User): Promise<string> => {
//     const action = "saveUser";
//     let message = util.format('{"date":"%s", "%s":%s","%s":"%s", ', currentDate, "action", action);

//     try {
//         const customDocId = userData.tgId.toString();

//         const usersCollection = db.collection('users');
//         const docRef = usersCollection.doc(customDocId);

//         const newUserDoc = await docRef.set(userData).then(() => {
//             message += util.format('"%s": "%s"}', "info", `User saved successfully: ${customDocId}`);
//             logger.info(message);
//             return customDocId;
//         })
//             .catch((error) => {
//                 handleError(message, "Error saving user", error);
//                 return error;
//             });
//         return newUserDoc;
//     } catch (error: any) {
//         handleError(message, "Error saving user", error.message as string);
//     }
//     return ' ';
// };

// const getUserDataByTgId = async (tgId: string): Promise<any> => {
//     const action = getUserDataByTgId.name;
//     const message = util.format('{"date":"%s", "%s":%s","%s":"%s", ', currentDate, "action", action, "id", tgId);

//     try {
//         const userSnapshot = await db.collection('users').where('tgId', '==', parseInt(tgId)).get();

//         if (userSnapshot.empty) {
//             handleUserNotFound(message, tgId);
//             return null;
//         }

//         const userData = userSnapshot.docs[0].data();
//         return userData;
//     } catch (error) {
//         handleError(message, "Error fetching user data", error);
//         throw error;
//     }
// };

// const getAdminsUsers = async (): Promise<any> => {
//     const action = getAdminsUsers.name;
//     const message = util.format('{"date":"%s", "%s":%s", ', currentDate, "action", action);

//     try {
//         const adminsSnapshot = await db.collection('users').where('isAdmin', '==', true).get();

//         const admins: FirebaseFirestore.DocumentData[] = [];
//         if (!adminsSnapshot.empty) {
//             adminsSnapshot.forEach(doc => admins.push(doc.data()));
//             return admins;
//         } else {
//             handleNoAdminUsersFound(message);
//             return [];
//         }
//     } catch (error) {
//         handleError(message, "Error fetching admin users", error);
//         throw error;
//     }
// };

const saveUser = async (userData: User): Promise<string> => {
    const action = "saveUser";
    let message = util.format('{"date":"%s", "%s":%s","%s":"%s", ', currentDate, "action", action);

    try {
        const customDocId = userData.tgId.toString();

        const usersRef = rdb.ref('users');
        const userRef = usersRef.child(customDocId);

        await userRef.set(userData)
            .then(() => {
                message += util.format('"%s": "%s"}', "info", `User saved successfully: ${customDocId}`);
                logger.info(message);
                return customDocId;
            })
            .catch((error) => {
                handleError(message, "Error saving user", error);
                return error;
            });

        return customDocId;
    } catch (error: any) {
        handleError(message, "Error saving user", error.message as string);
        return ' ';
    }
};

const getAllUsers = async (): Promise<any[]> => {
    const action = getAllUsers.name;
    const message = util.format('{"date":"%s", "%s":"%s", ', currentDate, "action", action);

    try {
        // const userSnapshot = await db.collection('users').get();
        const usersRef = rdb.ref('users');
        const userSnapshot = await usersRef.once('value');


        // if (userSnapshot.empty) {
        //     handleResultNotFound(message, "No users found");
        // }

        if (!userSnapshot.exists()) {
            handleResultNotFound(message, "No users found");
            return [];
        }


        // const allUsers = userSnapshot.docs.map(doc => doc.data());
        // return allUsers;

        return Object.values(userSnapshot.val());

    } catch (error: any) {
        handleError(message, "Error fetching user data", error.message as string);
        // throw error;
    }
    return [];
};

const getUserByTgId = async (tgId: string): Promise<any | null> => {
    const action = getUserByTgId.name;
    const message = util.format('{"date":"%s", "%s":%s","%s":"%s", ', currentDate, "action", action, "id", tgId);
    const id = parseInt(tgId, 10);

    // try {
    //     const userSnapshot = await db.collection('users').where('tgId', '==', id).get();

    //     if (userSnapshot.empty) {
    //         handleResultNotFound(message, "User not found", `User with id: ${tgId} not found`);
    //         return null;
    //     }

    //     const userData = userSnapshot.docs[0].data();
    //     return userData;
    try {
        const usersRef = rdb.ref('users');
        const userSnapshot = await usersRef.orderByChild('tgId').equalTo(parseInt(tgId)).once('value');

        if (!userSnapshot.exists()) {
            handleResultNotFound(message, "User not found", `User with id: ${tgId} not found`);
            return null;
        }

        return userSnapshot.val()[Object.keys(userSnapshot.val())[0]];
    } catch (error) {
        handleError(message, "Error fetching user data", error);
    }
};

const getAdminsUsers = async (): Promise<any[]> => {
    const action = getAdminsUsers.name;
    const message = util.format('{"date":"%s", "%s":%s", ', currentDate, "action", action);

    // try {
    //     const adminsSnapshot = await db.collection('users').where('isAdmin', '==', true).get();

    //     if (adminsSnapshot.empty) {
    //         handleResultNotFound(message, "No admin users found");
    //         return [];
    //     }

    //     const admins = adminsSnapshot.docs.map(doc => doc.data());
    //     return admins;
    try {
        const usersRef = rdb.ref('users');
        const adminsSnapshot = await usersRef.orderByChild('isAdmin').equalTo(true).once('value');

        if (!adminsSnapshot.exists()) {
            handleResultNotFound(message, "No admin users found");
            return [];
        }

        return Object.values(adminsSnapshot.val());
    } catch (error: any) {
        handleError(message, "Error fetching admin users", error.message as string);
    }
    return [];
};

const updateUser = async (tgId: string, updatedUserData: any): Promise<any | null> => {
    const action = updateUser.name;
    const message = util.format('{"date":"%s", "%s":%s", ', currentDate, "action", action);

    // try {
    //     // Найти id документа по tgId
    //     const querySnapshot = await db.collection('users').where('tgId', '==', parseInt(tgId, 10)).get();

    //     if (querySnapshot.empty) {
    //         handleResultNotFound(message, "User not found", `User with id: ${tgId} not found`);
    //         return null;
    //     }

    //     // Взять первый документ из результатов запроса (предполагается, что tgId уникально)
    //     const userDoc = querySnapshot.docs[0];

    //     // Получить ссылку на документ
    //     const userRef = userDoc.ref;

    //     // Обновить данные документа
    //     await userRef.update(updatedUserData);

    //     // Получить обновленные данные
    //     const updatedUserSnapshot = await userRef.get();
    //     const updatedUser = updatedUserSnapshot.data();

    //     return updatedUser;
    try {
        const usersRef = rdb.ref('users');
        const userSnapshot = await usersRef.orderByChild('tgId').equalTo(parseInt(tgId)).once('value');

        if (!userSnapshot.exists()) {
            handleResultNotFound(message, "User not found", `User with id: ${tgId} not found`);
            return null;
        }

        const userId = Object.keys(userSnapshot.val())[0];
        await usersRef.child(userId).update(updatedUserData);

        const updatedUserSnapshot = await usersRef.child(userId).once('value');
        return updatedUserSnapshot.val();
    } catch (error: any) {
        handleError(message, "Error updating user data", error.message as string);
    }
};


const userData = { saveUser, getAllUsers, getAdminsUsers, getUserByTgId, updateUser };

export default userData;
