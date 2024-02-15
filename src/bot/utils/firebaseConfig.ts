import * as admin from 'firebase-admin';
import * as path from 'path';
import helperFunctions from './helperFunctions';
import logger from './logger';
const configPath = path.join(__dirname, '../', '../', '../', `config.json`);
const config = require(configPath);

const filePath = path.join(__dirname, '../', '../', '../', `serviceAccountKey.json`);

const serviceAccount = require(filePath);

try {

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: config.databaseURL
  });
} catch (e: any) {
  const error = {
    date: helperFunctions.currentDate,
    // action,
    error: e.message as string,
  };
  logger.error(JSON.stringify(error));
}

const siteSecretKey = "1:867314600149:web:88ef9ce4cf6276a95eba5c";

const appCheckToken = admin.appCheck().createToken(siteSecretKey)
  .then((appCheckToken) => {
    // Token expires in an hour.
    const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60;

    // Return appCheckToken and expiresAt to the client.
    console.log("App Check token:", appCheckToken);
    console.log("Token expires at:", new Date(expiresAt * 1000).toLocaleString());
    return appCheckToken;

  })
  .catch((err) => {
    console.error('Unable to create App Check token.');
    console.error(err);
  });

const db = admin.firestore();
const rdb = admin.database();


export { admin, db, rdb };
