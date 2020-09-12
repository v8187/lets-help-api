import { RelationshipModel } from '../models/relationship.model';

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
    RelationshipModel.saveRelationship(Object.assign(new RelationshipModel(), $relationship)).then(
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