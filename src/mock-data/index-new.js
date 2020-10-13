require('dotenv').config();

require = require('esm')(module);

const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI || process.env.DB_PATH, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

let colLen = 0;
let colDropped = 0, colNotDropped = 0;
let bgsAdded = false, ctsAdded = false, relsAdded = false, ursAdded = false;

function checkAllRemoved() {
    if (colLen === colDropped + colNotDropped) {
        if (colNotDropped === 0) {
            fillDB();
        } else {
            console.log('All collections could not removed from DB');
        }
    }
}

function fillDB() {
    const colName = 'Increment';

    bgsAdded = false;
    ctsAdded = false;
    relsAdded = false;
    ursAdded = false;

    // Added meta data
    db.createCollection(colName).then((res) => {
        console.log(`${colName} created successfully!!!`);
        require('./blood-groups.data').default(() => {
            bgsAdded = true;
            onMetadataAdded();
        });
        require('./case-types.data').default(() => {
            ctsAdded = true;
            onMetadataAdded();
        });
        require('./relationships.data').default(() => {
            relsAdded = true;
            onMetadataAdded();
        });
        require('./user-roles.data').default(() => {
            ursAdded = true;
            onMetadataAdded();
        });
    }, (err) => {
        console.log(`Cannot create ${colName} collection`);
    });
}

function onMetadataAdded() {
    if (!bgsAdded || !ctsAdded || !relsAdded || !ursAdded) {
        return;
    }
    console.log('Metadata collections are filled...');
    require('./users.data');
}

db.on('open', () => {
    console.log('database is now openned!!!', db.db.databaseName);
    db.db.listCollections().toArray((error, collections) => {
        if (error) {
            console.error(error);
            return false
        }

        colLen = collections.length;
        colDropped = 0;
        colNotDropped = 0;

        !collections.length ? checkAllRemoved() : collections.forEach((coll) => {

            db.dropCollection(coll.name, (err) => {
                if (err) {
                    colNotDropped++;
                    console.error(err);
                    checkAllRemoved();
                    return;
                }
                colDropped++;
                console.log('%s collection dropped', coll.name);
                checkAllRemoved();
            });
        });
    });
});