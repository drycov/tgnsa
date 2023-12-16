import util from "util";
import UserModel from "../models/User";
import { db } from '../utils/firebaseConfig';

import logger from "../utils/logger";
import User from "../models/User";

const currentDate = new Date().toLocaleString("ru-RU");

const userData = {
  saveUser: (userData: User): Promise<any> => {
    let action = "saveUser"; // Просто задаем строку для описания действия
    let message = util.format(
      '{"date":"%s", "%s":%s","%s":"%s", ',
      currentDate,
      "action",
      action,
      "data",
      userData
    );
    return new Promise(async (resolve, reject) => {
      try {
        // const userDataObj = JSON.parse(data);
        // console.log(userDataObj);

        // const db = await helper.connectMongo();
        const usersCollection = db.collection('users');
        const newUserDoc = await usersCollection.add(userData);

        // const newUserDoc = await usersCollection.add(userDataObj);
        // Access the Mongoose model for the specified collection
        // const user = new UserModel(userDataObj); // Create the user model

        // Save the user data as a new document in the collection
        const userID = newUserDoc.id

        // const result = await user.save();
        message += util.format(
          '"%s": "%s"}',
          "info",
          `User saved successfully: ${userID}`
        );
        logger.info(message);
        // console.log('User saved successfully:', result._id);

        // Close the database connection
        // db.connection.close();

        resolve(userID); // Resolve the promise with the saved user data
      } catch (error) {
        message += util.format('"%s":"%s",', "data", "Error saving user");
        message += util.format('"%s":"%s"}', "error", error);
        logger.error(message);
        reject(error); // Reject the promise with the error
      }
    });
  },
  getUserDataByTgId: (tgId: string): Promise<any> => {
    let action = userData.getUserDataByTgId.name;
    let message = util.format(
      '{"date":"%s", "%s":%s","%s":"%s", ',
      currentDate,
      "action",
      action,
      "id",
      tgId
    );
    return new Promise(async (resolve, reject) => {
      try {
        // const db = await helper.connectMongo();

        // Find the user data based on the specified tgId
        // const user = await UserModel.findOne({ tgId: tgId }).maxTimeMS(30000);
        const userSnapshot = await db.collection('users').where('tgId', '==', tgId).get();
        if (!userSnapshot.empty) {
          userSnapshot.forEach(doc => {
            resolve(doc.data()); // Резолв промиса с данными пользователя
          });
        } else {
          //   message += util.format(
          //     '"%s":"%s"}',
          //     "status",
          //     `User with id: ${tgId} not found`
          //   );
          //   logger.error(message);
          //   resolve(null); 
          // }
          // if (user) {
          //   // User data found, do something with it
          //   // console.log('User found:', user);
          //   resolve(user); // Resolve the promise with the found user data
          // } else {
          // User data not found
          message += util.format(
            '"%s":"%s"}',
            "status",
            `User with id: ${tgId} not found`
          );
          logger.error(message);
          console.log("User with tgId", tgId, "not found.");
          resolve(null); // Resolve the promise with null if user not found
        }
        // db.connection.close();
      } catch (error) {
        message += util.format(
          '"%s":"%s",',
          "data",
          "Error fetching user data"
        );
        message += util.format('"%s":"%s"}', "error", error);
        logger.error(message);
        reject(error); // Reject the promise with the error
      }
    });
  },
  getAdminsUsers: (): Promise<any> => {
    let action = userData.getAdminsUsers.name;
    let message = util.format(
      '{"date":"%s", "%s":%s", ',
      currentDate,
      "action",
      action
    );
    return new Promise(async (resolve, reject) => {
      try {
        // const db = await helper.connectMongo();

        // Find users with isAdmin set to true
        const adminsSnapshot = await db.collection('users').where('isAdmin', '==', true).get();

        // const admins = await UserModel.find({ isAdmin: true });

        const admins: FirebaseFirestore.DocumentData[] = [];
        if (!adminsSnapshot.empty) {
          adminsSnapshot.forEach(doc => {
            admins.push(doc.data());
          });
          resolve(admins); // Резолв промиса с данными администраторов
        } else {
          // if (admins) {
          //   // Users found, resolve the promise with the result
          //   resolve(admins);
          // } else {
          // Users not found, resolve the promise with an empty array
          message += util.format(
            '"%s":"%s"}',
            "status",
            `No admin users found`
          );
          logger.error(message);
          resolve([]);
        }
        // db.connection.close();
      } catch (error) {
        // Handle errors, reject the promise with the error
        message += util.format(
          '"%s":"%s",',
          "data",
          "Error fetching admin users"
        );
        message += util.format('"%s":"%s"}', "error", error);
        logger.error(message);
        reject(error);
      }
    });
  },
};

export default userData;
