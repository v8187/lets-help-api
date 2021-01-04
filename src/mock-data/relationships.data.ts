import { fillCollection } from './fetch.api';

const actualRelationshipsData = [
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

export default (callback) => fillCollection(actualRelationshipsData, 'api/relationship/add', 'Relationship', callback);