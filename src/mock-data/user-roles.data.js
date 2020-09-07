import { UserRoleModel } from '../models/user-role.model';

const actualUserRolesData = [
    //  'default', 'admins', 'super-admins', 'volunteers', 'refferers', 'donors'
    { name: 'default', label: 'Default' },
    { name: 'admin', label: 'admin' },
    { name: 'super-admin', label: 'Super Admin' },
    { name: 'volunteer', label: 'Volunteer' },
    { name: 'refferers', label: 'Refferer' }
];

let initiated = 0, added = 0, notAdded = 0;
const vikram = 'admin';

const addUserRole = ($userRole, callback) => {

    $userRole.vAuthUser = vikram;

    // For Mock Data
    initiated++;
    UserRoleModel.saveUserRole(Object.assign(new UserRoleModel(), $userRole)).then(
        saveRes => {
            added++;
            if (initiated === added + notAdded) {
                console.log('UserRoles: %d added , %d failed to add', added, notAdded);
            }
            callback instanceof Function && callback();
        },
        saveErr => {
            notAdded++;
            if (initiated === added + notAdded) {
                console.log('UserRoles: %d added , %d failed to add', added, notAdded);
            }
        })
        .catch(saveReason => {
            notAdded++;
            if (initiated === added + notAdded) {
                console.log('UserRoles: %d added , %d failed to add', added, notAdded);
            }
        });
};

// (async () => {
    actualUserRolesData.map(addUserRole);
// })();