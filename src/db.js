import mongoose from 'mongoose';

mongoose.set('useCreateIndex', true);

const { DB_BUFFER_COMMANDS, DB_CONNECTION_TIMEOUT_MS, DB_KEEP_ALIVE,
    DB_SOCKET_TIMEOUT_MS, DB_PATH } = process.env;

export const initDatabase = (cb) => {
    mongoose.connect(process.env.MONGODB_URI || DB_PATH || 'mongodb://localhost:27017/test', {
        // bufferCommands: DB_BUFFER_COMMANDS === 'true',       // Turn off the bufferCommands to disable buffering
        // connectTimeoutMS: parseInt(DB_CONNECTION_TIMEOUT_MS),
        // socketTimeoutMS: parseInt(DB_SOCKET_TIMEOUT_MS),
        // keepAlive: DB_KEEP_ALIVE === 'true',
        // reconnectTries: parseInt(DB_RECONNECT_TRIES),
        useNewUrlParser: true,
        // dbName: 'heroku_1rgknm91' || process.env.DB_NAME,
        useUnifiedTopology: true
    }).then(
        (db) => {
            console.log('Connected to MongoDB successfully!');
            require('./firebase-sdk');
            cb && cb(db);
        },
        error => {
            console.error('Error while making connection to MongoDB', error);
        }
    );
};