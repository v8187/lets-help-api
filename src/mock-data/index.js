require('dotenv').config();

require = require('esm')(module);

const mongoose = require('mongoose');

// import { initDatabase } from '../db';


mongoose.connect(process.env.MONGODB_URI || process.env.DB_PATH, {
    useNewUrlParser: true,
    // dbName: process.env.DB_NAME,
    useUnifiedTopology: true
});

const
    db = mongoose.connection,
    COLLECTIONS = [
        // { file: 'countries', name: 'Country' }, { file: 'states', name: 'State' }, { file: 'cities', name: 'City' },
        { file: 'user-roles', name: 'UserRole' },
        /** Dependent on Country, State, City Data */
        // { file: 'users', name: 'User' },
        /** Dependent on User, Country, State, City Data */
        // { file: 'cases', name: 'Case' },
        // { file: 'transactions', name: 'Transaction' },
    ];
// initDatabase(() => {
//     require(`./${COLLECTIONS[0].file}.data`);
// });

db.on('open', () => {
    console.log('database is now openned!!!', db.db.databaseName);
    db.db.listCollections().toArray((error, collections) => {
        if (error) {
            console.error(error);
            return false
        }
        // Clear DB and remove all collections
        // console.log('collections.length', collections, collections.length);
        // collections.forEach((coll) => {
        //     db.dropCollection(coll.name, (err): void => {
        //         if (err) {
        //             console.error(err);
        //             return;
        //         }
        //         console.log('%s collection dropped', coll.name);
        //     });
        // });
        // return;
        // console.log(collections);
        COLLECTIONS.forEach(coll => {
            const hasCollection = collections.some(_col => { return _col.name === coll.name; });

            if (hasCollection) {
                // Drop the existing Collection to set the new Data
                db.dropCollection(coll.name, (err) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    // If no error, add data
                    console.log('%s collection dropped', coll.name);
                    if (coll.file) {
                        require(`./${coll.file}.data`);
                    } else {
                        db.createCollection(coll.name).then((res) => {
                            console.log(`${coll.name} created successfully!!!`);
                        }, (err) => console.log('Cannot create collection'));

                    }
                });
            } else {
                console.log('%s Collection does not exist', coll.name);
                if (coll.file) {
                    require(`./${coll.file}.data`);
                } else {
                    db.createCollection(coll.name).then((res) => {
                        console.log(`${coll.name} created successfully!!!`);
                    }, (err) => console.log('Cannot create collection'));
                }
            }
        });
    });
});