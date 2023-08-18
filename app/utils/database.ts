import mongoose from 'mongoose';
import util from "util";

import config from '../config';
import helperFunctions from './helperFunctions';
const currentDate = helperFunctions.getHumanDate(new Date());

const connectToDatabase = () => {
    let action = connectToDatabase.name;
    let message = util.format('{"date":"%s", "%s":%s",',currentDate,"action",action)
    try {
        mongoose.connect(config.mongoURI, config.mongoOptions);
        message += util.format('"%s":"%s"}',"status","DB connect")
        console.info(message);
        return mongoose;
    } catch (error) {
        // console.error('Failed to connect to MongoDB', error);
        message += util.format('"%s":"%s"}',"error",error)
        console.error(message);
        throw error;
    }
};

export default connectToDatabase;