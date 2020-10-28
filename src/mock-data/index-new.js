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
let bloodGroupsAdded = false, caseTypesAdded = false,
    relationshipsAdded = false, permissionsAdded = false, userRolesAdded = false;

function checkColsDropped() {
    if (colLen === colDropped + colNotDropped) {
        if (colNotDropped === 0) {
            fillDB();
        } else {
            console.log('All collections could not removed from DB');
        }
    }
}

const COL_INCREMENT = 'Increment';
const COL_NOTIFICATION = 'Notification';

function fillDB() {
    bloodGroupsAdded = false;
    caseTypesAdded = false;
    relationshipsAdded = false;
    permissionsAdded = false;
    userRolesAdded = false;

    db.createCollection(COL_NOTIFICATION).then((res) => {
        console.log(`${COL_NOTIFICATION} created successfully!!!`);
    }, (err) => {
        console.log(`Cannot create ${COL_NOTIFICATION} collection`);
    });

    // Add meta data
    db.createCollection(COL_INCREMENT).then((res) => {
        console.log(`${COL_INCREMENT} created successfully!!!`);
        require('./blood-groups.data').default(() => {
            bloodGroupsAdded = true;
            onMetadataAdded();
        });
        require('./case-types.data').default(() => {
            caseTypesAdded = true;
            onMetadataAdded();
        });
        require('./relationships.data').default(() => {
            relationshipsAdded = true;
            onMetadataAdded();
        });
        require('./permissions.data').default(() => {
            permissionsAdded = true;
            onMetadataAdded();
        });
        // require('./user-roles.data').default(() => {
        //     userRolesAdded = true;
        //     onMetadataAdded();
        // });
    }, (err) => {
        console.log(`Cannot create ${COL_INCREMENT} collection`);
    });
}

async function onMetadataAdded() {
    if (!bloodGroupsAdded || !caseTypesAdded || !relationshipsAdded || !permissionsAdded /* || !userRolesAdded */) {
        return;
    }
    const { PermissionModel } = require('../models/permission.model');
    console.log('Metadata collections are filled...');
    require('./user-roles.data').default(onUserRoleDataAdded);
}

function onUserRoleDataAdded() {
    console.log('User Role collection is filled...');
    require('./users.data').default(onUserDataAdded);
}

function onUserDataAdded() {
    console.log('User collection is filled...');
    require('./cases.data').default(onCaseDataAdded);
}

function onCaseDataAdded() {
    console.log('Case collection is filled...');

    require('./transactions.data').default(onTransactionDataAdded);
}

function onTransactionDataAdded() {
    console.log('Transaction collection is filled...');
    db.close();
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

        !collections.length ? checkColsDropped() : collections.forEach((coll) => {

            db.dropCollection(coll.name, (err) => {
                if (err) {
                    colNotDropped++;
                    console.error(err);
                    checkColsDropped();
                    return;
                }
                colDropped++;
                console.log('%s collection dropped', coll.name);
                checkColsDropped();
            });
        });
    });
});