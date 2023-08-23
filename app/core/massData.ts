import MassIncidientModel from '../models/MassIncidient';
import helperFunctions from '../utils/helperFunctions';
const currentDate = new Date().toLocaleString('ru-RU');


// Function to generate the next available ID in the format "mi_00"
async function generateNextMiId(): Promise<string> {
    return new Promise(async (resolve, reject) => {
        try {
            const highestIdDocument = await MassIncidientModel.findOne({}, { _id: 1 }).sort({ _id: -1 });
            const highestId = highestIdDocument ? parseInt(highestIdDocument._id.slice(3)) : 0;
            const nextIdNumber = highestId + 1;
            const paddedNextId = nextIdNumber.toString().padStart(6, '0');
            const miId = `${paddedNextId}`;
            resolve(miId);

        } catch (error) {
            console.error('Error generating mi_id:', error);
            reject(error); // Reject the promise with the error
        }
    })
}

// async function insertNewDocument(newDocument: MassIncidient): Promise<MassIncidient> {
//     try {
//         // Connect to MongoDB using the connectMongo function
//         const db = await helper.connectMongo();
//         // Create a new MassIncidient document using the MassIncidientModel
//         const createdDocument = await MassIncidientModel.create(newDocument);

//         // Close the connection to MongoDB
//         await db.connection.close();
//         console.log('Connection to MongoDB closed');

//         return createdDocument;
//     } catch (error) {
//         console.error('Error inserting new document:', error);
//         throw error;
//     }
// }

// async function insertNewDocument() {
//     try {
//         // Generate the next available mi_id
//         const miId = await generateNextMiId();

//         // Other data you want to store with the ID
//         // For example:
//         const document = {
//             mi_id: miId,
//             name: 'John Doe',
//             email: 'johndoe@example.com',
//             // Add more fields as needed
//         };

//         // Insert the document into the collection
//         const client = new MongoClient(mongoURL, { useUnifiedTopology: true });
//         await client.connect();
//         const db = client.db(dbName);
//         const collection = db.collection(collectionName);
//         await collection.insertOne(document);

//         console.log('New document inserted with mi_id:', miId);
//     } catch (error) {
//         console.error('Error inserting document:', error);
//     } finally {
//         // Close the connection to the MongoDB server
//         client.close();
//     }
// }

// Call the function to insert a new document with the generated mi_id
// insertNewDocument();
export default { generateNextMiId }