// import { BloodGroupModel } from '../models/blood-group.model';
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/';
const HEADERS = {
    'Content-Type': 'application/json',
    // Authorization: AUTH,
    // 'Content-Type': 'application/x-www-form-urlencoded',
};
const vikram = 'admin';

export const fillCollection = (data, url, name, onFilled) => {

    let initiated = 0, added = 0, notAdded = 0;

    const addDocument = ($doc, callback) => {
        $doc.vAuthUser = vikram;

        // For Mock Data
        initiated++;

        fetch(`${BASE_URL}${url}`, {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
                ...HEADERS
            },
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify($doc)
        }).then(
            saveRes => {
                added++;
                if (initiated === added + notAdded) {
                    console.log(`${name}: ${added} added, ${notAdded} failed to add`);
                    onFilled instanceof Function && onFilled();
                }
                callback instanceof Function && callback();
            },
            saveErr => {
                notAdded++;
                if (initiated === added + notAdded) {
                    console.log(`${name}: ${added} added, ${notAdded} failed to add`);
                }
            })
            .catch(saveReason => {
                notAdded++;
                if (initiated === added + notAdded) {
                    console.log(`${name}: ${added} added, ${notAdded} failed to add`);
                }
            });
    };

    data.map(addDocument);
};