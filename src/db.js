import mongoose from 'mongoose';

mongoose.set('useCreateIndex', true);

const { DB_PATH, MONGODB_URI } = process.env;

export const initDatabase = (cb) => {
    mongoose.connect(MONGODB_URI || DB_PATH || 'mongodb://localhost:27017/test', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false // Set to false to make findOneAndUpdate() and findOneAndRemove() use native findOneAndUpdate() rather than findAndModify()
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