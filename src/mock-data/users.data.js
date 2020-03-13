import { UserModel } from '../models/user.model';
import { userRoles, userGroups } from '../configs/enum-constants';
import { pName, gender, email, dob, recentDate, country, state, city, bloodgroup, bool } from './utils';

// Add Mock Users data
const mockUsersData = [{
    username: 'noInfo@gmail.com'
}, {
    name: 'Vikram Gupta',
    gender: 'm',
    email: 'vikram1vicky@gmail.com',
    userPin: '1234'
}, {
    name: 'Gurinder Singh',
    gender: 'm',
    email: 'gurinder1god@gmail.com',
    userPin: '1234'
}, ,
...new Array(20).join(',').split(',')];

let initiated = 0, added = 0, notAdded = 0;

mockUsersData.map((mockUser, i) => {
    if (['vikram1vicky@gmail.com', 'gurinder1god@gmail.com'].indexOf(mockUser.email) !== -1) {
        mockUser.roles = userRoles;
        mockUser.groups = userGroups;
    }
    if (i > 2) {
        mockUser = {};
        mockUser.name = pName();
        mockUser.gender = gender();
        mockUser.email = email(mockUser.name);
    }
    mockUser.dob = dob();
    mockUser.joinedOn = recentDate();
    mockUser.countryId = country();
    mockUser.stateId = state();
    mockUser.cityId = city();
    mockUser.bloodGroup = bloodgroup();
    mockUser.password = 1234;
    mockUser.provider = 'local';
    mockUser.showBloodGroup = bool();
    mockUser.showPhoneNos = bool();
    mockUser.showAddresses = bool();
    mockUser.showEmail = bool();
    mockUser.showContributions = bool();
    mockUser.showBirthday = bool();
    mockUser.showBirthOfyear = bool();
    mockUser.showPicture = bool();

    initiated++;
    UserModel.saveUser(Object.assign(new UserModel(), mockUser)).then(
        saveRes => {
            added++;
            if (initiated === added + notAdded) {
                console.log('Users: %d added , %d failed to add', added, notAdded);
            }
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
});

// UserModel.insertMany(mockUsersData, (err, docs) => {
//     if (err) {
//         console.error('UserModel.insertMany: Failed', err);
//         return false;
//     }
//     console.log('%d Users added successfully!!!', docs.length);
// });