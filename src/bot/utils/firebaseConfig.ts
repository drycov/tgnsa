import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';
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
} catch (e:any) {
  const error = {
    date: helperFunctions.currentDate,
    // action,
    error: e.message as string,
  };
  logger.error(JSON.stringify(error));
}

const db = admin.firestore();


export { db, admin };
