// import { RelationshipModel } from '../models/relationship.model';
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/';
const AUTH = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZjdjNzg2OGU1ZWU1YTE4MTA2ZjQ1OTIiLCJlbWFpbCI6InZpa3JhbTF2aWNreUBnbWFpbC5jb20iLCJyb2xlcyI6W10sImlhdCI6MTYwMjIzNjE1OCwiZXhwIjoxNjAyMjcyMTU4fQ.bmUokN7ktrsoHa7pPwnhkhd69Vh38oww9pZOmDFvNFs';
const HEADERS = {
    'Content-Type': 'application/json',
    Authorization: AUTH,
    // 'Content-Type': 'application/x-www-form-urlencoded',
};

const actualRelationshipsData = [
    // 'self', 'referrer', 'mother', 'father', 'husband', 'wife', 'brother',
    // 'sister', 'son', 'daughter', 'uncle', 'aunt', 'cusion', 'friend', 'neighbours'
    { name: 'self', label: 'Self' },
    { name: 'Referrer', label: 'Referrer' },
    { name: 'mother', label: 'Mother' },
    { name: 'father', label: 'Father' },
    { name: 'husband', label: 'Husband' },
    { name: 'wife', label: 'Wife' },
    { name: 'brother', label: 'Brother' },
    { name: 'sister', label: 'Sister' },
    { name: 'son', label: 'Son' },
    { name: 'daughter', label: 'Daughter' },
    { name: 'uncle', label: 'Uncle' },
    { name: 'aunt', label: 'Aunt' },
    { name: 'cusion', label: 'Cusion' },
    { name: 'friend', label: 'Friend' },
    { name: 'neighbours', label: 'Neighbours' }
];

let initiated = 0, added = 0, notAdded = 0;
const vikram = 'admin';

const addRelationship = ($relationship, callback) => {

    $relationship.vAuthUser = vikram;

    // For Mock Data
    initiated++;

    fetch(`${BASE_URL}api/relationship/createRelationship`, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            ...HEADERS
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify($relationship)
    })
   /*  (new RelationshipModel($relationship)).save() */.then(
        saveRes => {
            added++;
            if (initiated === added + notAdded) {
                console.log('Relationships: %d added , %d failed to add', added, notAdded);
            }
            callback instanceof Function && callback();
        },
        saveErr => {
            notAdded++;
            if (initiated === added + notAdded) {
                console.log('Relationships: %d added , %d failed to add', added, notAdded);
            }
        })
        .catch(saveReason => {
            notAdded++;
            if (initiated === added + notAdded) {
                console.log('Relationships: %d added , %d failed to add', added, notAdded);
            }
        });
};

actualRelationshipsData.map(addRelationship);