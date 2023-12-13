import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';
const filePath = path.join(__dirname, '../', 'src', `serviceAccount.json`);

const serviceAccount = require(filePath);

try {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: 'https://telcofusion-6194b-default-rtdb.firebaseio.com'
    });
} catch (e) {
    console.log(e)
}

const db = admin.firestore();


export { db };
