import firebaseAdmin from 'firebase-admin';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const configPath = join(__dirname, './../../../../', 'config.json');
const serviceAccountPath = join(__dirname, './../../../../', 'serviceAccountKey.json');

let config, serviceAccount;

try {
    config = await fs.readFile(configPath, 'utf8');
    serviceAccount = await fs.readFile(serviceAccountPath, 'utf8');
    config = JSON.parse(config);
    serviceAccount = JSON.parse(serviceAccount);
} catch (e) {
    console.error(e);
}

try {
    firebaseAdmin.initializeApp({
        credential: firebaseAdmin.credential.cert(serviceAccount),
        databaseURL: config.databaseURL
    });
} catch (e) {
    console.error(e);
}

const db = firebaseAdmin.firestore();

export default { db, admin: firebaseAdmin };
