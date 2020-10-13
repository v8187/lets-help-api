import { fillCollection } from './fetch.api';

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

export default (callback) => fillCollection(actualBloodGroupsData, 'api/bloodGroup/createBloodGroup', 'Blood Group', callback);