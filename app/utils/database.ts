import mongoose from 'mongoose';
import config from '../config';

const connectToDatabase = () => {
    try {
         mongoose.connect(config.mongoURI, config.mongoOptions);
        console.log('DB Connect');
        return mongoose;
    } catch (error) {
        console.error('Failed to connect to MongoDB', error);
        throw error;
    }
};

export default connectToDatabase;