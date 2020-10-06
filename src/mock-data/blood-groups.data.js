import { BloodGroupModel } from '../models/blood-group.model';

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
    BloodGroupModel.saveBloodGroup(Object.assign(new BloodGroupModel(), $bloodGroup)).then(
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

actualBloodGroupsData.map(addBloodGroup);