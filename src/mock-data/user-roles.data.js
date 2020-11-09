import { fillCollection } from './fetch.api';

const { PermissionModel } = require('../models/permission.model');

const data = [
    { name: 'member', label: 'Member' },
    { name: 'admin', label: 'admin' },
    { name: 'super-admin', label: 'Super Admin' },
    { name: 'moderator', label: 'Moderator' },
    { name: 'guest', label: 'Guest' }
];

export default async (callback) => {
    let permissions = await PermissionModel.find().sort('permId').select('permId name -_id').exec();
    console.log('permissions = %o', permissions);
    // permissions = permissions.map(perm => perm.permId);
    const userRolesTemp = data.map(ur => {
        let permIds = (ur.name.indexOf('admin') !== -1 ? permissions :
            permissions.filter(perm => !(/add|edit|map|hidden|close|approve|verify/.test(perm.name))))
            .map(perm => perm.permId);

        return {
            ...ur,
            permIds
        };
    });
   
    fillCollection(userRolesTemp, 'api/userRole/add', 'User Role', callback);
}