import { randomItem } from '@v8187/rs-utils';

import { UserModel } from '../models/user.model';
import { BloodGroupModel } from '../models/blood-group.model';
import { UserRoleModel } from '../models/user-role.model';
import { pName, gender, email, dob, recentDate, country, state, city, bool, phoneNo, addr } from './utils';

// Add Mock Users data
const common = {
    gender: 'm',
    userPin: '1234',
    country: 'India',
    state: 'Punjab',
    city: 'Amritsar',
    isVerified: true,
};
const myProfile = {
    name: 'Vikram Gupta',
    email: 'vikram1vicky@gmail.com',
    contactNo: '919779958985',
    ...common
};
const mockUsersData = [{
    name: 'Vikram',
    email: 'vik5sep@gmail.com',
    contactNo: '919888811427',
    ...common
}, {
    name: 'Gurinder Singh',
    email: 'gurinder1god@gmail.com',
    contactNo: '919814114034',
    ...common
},
...new Array(87).join(',').split(',')];

let initiated = 0, added = 0, notAdded = 0;

let bloodGroups, userRoles;

const addUser = (mockUser, callback) => {
    if (['vikram1vicky@gmail.com', 'gurinder1god@gmail.com'].indexOf(mockUser.email) !== -1) {
        mockUser.roleIds = userRoles;
        // mockUser.groups = userGroups;
    } else {
        if (!mockUser.email) {
            mockUser = {};
        }
        mockUser.roleIds = [randomItem(userRoles)];
    }
    if (['vikram1vicky@gmail.com', 'gurinder1god@gmail.com', 'vik5sep@gmail.com'].indexOf(mockUser.email) === -1) {
        mockUser.name = pName();
        mockUser.gender = gender();
        mockUser.email = email(mockUser.name);
        mockUser.contactNo = phoneNo();
        mockUser.alternateNo1 = phoneNo();
        mockUser.alternateNo2 = phoneNo();
        mockUser.country = country();
        mockUser.state = state();
        mockUser.city = city();
        mockUser.password = 1234;
        mockUser.isVerified = bool();
    }
    mockUser.dob = dob();
    mockUser.address = addr();
    mockUser.joinedOn = recentDate();
    mockUser.bloodGroupId = randomItem(bloodGroups);
    mockUser.showEmail = bool();
    mockUser.showContactNos = bool();
    mockUser.showBloodGroup = bool();
    mockUser.showAddress = bool();
    mockUser.showContributions = bool();
    mockUser.showBirthday = bool();

    initiated++;
    UserModel.saveUser(Object.assign(new UserModel(), mockUser)).then(
        saveRes => {
            added++;
            if (initiated === added + notAdded) {
                console.log('Users: %d added , %d failed to add', added, notAdded);
            }
            callback instanceof Function && callback();
        },
        saveErr => {
            notAdded++;
            if (initiated === added + notAdded) {
                console.log('Users: %d added , %d failed to add', added, notAdded);
            }
        })
        .catch(saveReason => {
            notAdded++;
            if (initiated === added + notAdded) {
                console.log('Users: %d added , %d failed to add', added, notAdded);
            }
        });
};

(async () => {
    bloodGroups = (await BloodGroupModel.find({}).select('bloodGroupId -_id').exec()).map(bg => bg.bloodGroupId);
    userRoles = (await UserRoleModel.find({}).select('userRoleId -_id').exec()).map(ur => ur.userRoleId);
    console.log('bloodGroups = %o, userRoles = %o', bloodGroups, userRoles);
    addUser(myProfile, () => {
        mockUsersData.map(addUser);
    });
})();

// UserModel.insertMany(mockUsersData, (err, docs) => {
//     if (err) {
//         console.error('UserModel.insertMany: Failed', err);
//         return false;
//     }
//     console.log('%d Users added successfully!!!', docs.length);
// });