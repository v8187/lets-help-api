import { fillCollection } from './fetch.api';

const data = [
    // Case
    { name: 'add case' },
    { name: 'edit case' },
    { name: 'request case' },
    { name: 'search case' },
    // Member
    { name: 'add member' },
    { name: 'edit member' },
    { name: 'refer member' },
    { name: 'search member' },
    { name: 'view member profile' },
    // Transaction
    { name: 'add transaction' },
    { name: 'edit transaction' },
    { name: 'search transaction' },
    { name: 'view transaction details' },
    // Blood Group
    { name: 'add blood group' },
    { name: 'edit blood group' },
    // Case Type
    { name: 'add case type' },
    { name: 'edit case type' },
    // Relationship
    { name: 'add Relationship' },
    { name: 'edit Relationship' },
    // User Role
    { name: 'add User Role' },
    { name: 'edit User Role' },
    { name: 'map permissions to roles' },
];

export default (callback) => fillCollection(data, 'api/permission/createPermission', 'Permission', callback);