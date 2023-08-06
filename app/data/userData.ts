import UserModel from '../models/User';

export = {
    saveUser: (userData: any): Promise<any> => {
        return new Promise(async (resolve, reject) => {
            try {
                // const db = await helper.connectMongo();

                // Parse the userData JSON string to an object
                const userDataObj = JSON.parse(userData);
                console.log(userData)

                // Access the Mongoose model for the specified collection
                const user = new UserModel(userDataObj); // Create the user model

                // Save the user data as a new document in the collection
                const result = await user.save();

                console.log('User saved successfully:', result._id);

                // Close the database connection
                // db.connection.close();

                resolve(result); // Resolve the promise with the saved user data
            } catch (error) {
                console.error('Error saving user:', error);
                reject(error); // Reject the promise with the error
            }
        });
    },
    getUserDataByTgId: (tgId: string): Promise<any> => {
        return new Promise(async (resolve, reject) => {
            try {
                // const db = await helper.connectMongo();

                // Find the user data based on the specified tgId
                const user = await UserModel.findOne({ tgId: tgId }).maxTimeMS(30000);
                if (user) {
                    // User data found, do something with it
                    // console.log('User found:', user);
                    resolve(user); // Resolve the promise with the found user data
                } else {
                    // User data not found
                    console.log('User with tgId', tgId, 'not found.');
                    resolve(null); // Resolve the promise with null if user not found
                }
                // db.connection.close();

            } catch (error) {
                console.error('Error fetching user data:', error);
                reject(error); // Reject the promise with the error
            }
        });
    },
    getAdminsUsers: (): Promise<any> => {
        return new Promise(async (resolve, reject) => {
            try {
                // const db = await helper.connectMongo();

                // Find users with isAdmin set to true
                const admins = await UserModel.find({ isAdmin: true });

                if (admins) {
                    // Users found, resolve the promise with the result
                    console.log('Admin users found:', admins);
                    resolve(admins);
                } else {
                    // Users not found, resolve the promise with an empty array
                    console.log('No admin users found.');
                    resolve([]);
                }
                // db.connection.close();

            } catch (error) {
                // Handle errors, reject the promise with the error
                console.error('Error fetching admin users:', error);
                reject(error);
            }
        });
    },
};
