// import { BloodGroupModel } from '../models/blood-group.model';
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/';
const AUTH = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZjdjNzg2OGU1ZWU1YTE4MTA2ZjQ1OTIiLCJlbWFpbCI6InZpa3JhbTF2aWNreUBnbWFpbC5jb20iLCJyb2xlcyI6W10sImlhdCI6MTYwMjIzNjE1OCwiZXhwIjoxNjAyMjcyMTU4fQ.bmUokN7ktrsoHa7pPwnhkhd69Vh38oww9pZOmDFvNFs';
const HEADERS = {
    'Content-Type': 'application/json',
    Authorization: AUTH,
    // 'Content-Type': 'application/x-www-form-urlencoded',
};

const actualBloodGroupsData = [
    // 'a+', 'a-', 'b+', 'b-', 'o+', 'o-', 'ab+', 'ab-'
    { name: 'a+', label: 'A +' },
    { name: 'a-', label: 'A -' },
    { name: 'b+', label: 'B +' },
    { name: 'b-', label: 'B -' },
    { name: 'o+', label: 'O +' },
    { name: 'o-', label: 'O -' },
    { name: 'ab+', label: 'AB +' },
    { name: 'ab-', label: 'AB -' }
];

let initiated = 0, added = 0, notAdded = 0;
const vikram = 'admin';

const addBloodGroup = ($bloodGroup, callback) => {

    $bloodGroup.vAuthUser = vikram;

    // For Mock Data
    initiated++;

    fetch(`${BASE_URL}api/bloodGroup/createBloodGroup`, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            ...HEADERS
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify($bloodGroup)
    })
   /*  (new BloodGroupModel($bloodGroup)).save() */.then(
        saveRes => {
            added++;
            if (initiated === added + notAdded) {
                console.log('BloodGroups: %d added , %d failed to add', added, notAdded);
            }
            callback instanceof Function && callback();
        },
        saveErr => {
            notAdded++;
            if (initiated === added + notAdded) {
                console.log('BloodGroups: %d added , %d failed to add', added, notAdded);
            }
        })
        .catch(saveReason => {
            notAdded++;
            if (initiated === added + notAdded) {
                console.log('BloodGroups: %d added , %d failed to add', added, notAdded);
            }
        });
};

actualBloodGroupsData.map(data => { addBloodGroup(data) });