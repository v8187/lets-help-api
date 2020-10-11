import { fillCollection } from './fetch.api';

const actualUserRolesData = [
    //  'default', 'admins', 'super-admins', 'volunteers', 'refferers', 'donors'
    { name: 'default', label: 'Default' },
    { name: 'admin', label: 'admin' },
    { name: 'super-admin', label: 'Super Admin' },
    { name: 'volunteer', label: 'Volunteer' },
    { name: 'refferers', label: 'Refferer' }
];

fillCollection(actualUserRolesData, 'api/userRole/createUserRole', 'User Role', () => {
    console.log('User Roles added....');
});