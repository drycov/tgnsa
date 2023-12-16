import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';
const configPath = path.join(__dirname, '../', '../', '../', `config.json`);
const config = require(configPath);

const filePath = path.join(__dirname, '../', '../', '../', `serviceAccountKey.json`);

const serviceAccount = require(filePath);

try {

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: config.databaseURL
  });
} catch (e) {
  console.log(e)
}

const db = admin.firestore();


export { db, admin };
