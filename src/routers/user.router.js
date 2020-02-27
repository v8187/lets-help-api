import { Router } from 'express';

import { UserController } from '../controllers/user.controller';
import {
    validateCredentials, validateParams,
    validateToken, validateRoles
} from '../middlewares/routes';

const {
    usersList, byUserId, editRoles, editGroups,
    getProfile, editProfile, deleteProfile, changeUserPin,
    tempAll: userTempAll
} = new UserController();

// const {
//     addressList, addAddress, editAddress, deleteAddress,
//     tempAll: addressTempAll
// } = new AddressController();

// const {
//     phoneNoList, addPhoneNo, editPhoneNo, deletePhoneNo,
//     tempAll: phoneNoTempAll
// } = new PhoneNoController();

const router = Router();

// Middleware that is specific to this router
router.use((req, res, next) => {
    // Log for all requests
    console.log('Router: API: User: Request made');
    next();
});

export const getUserRouter = (passport) => {

    const validateWithCred = (req, res, next) => validateCredentials(req, res, next, passport);
    const validateWithToken = (req, res, next) => validateToken(req, res, next, passport);

    // Special Roles based routes
    router.get('/list', [
        validateWithToken,
        (req, res, next) => validateRoles(req, res, next, 'admin'),
        (req, res) => usersList(req, res)
    ]);
    router.get('/info/:userId', [
        validateWithToken,
        (req, res, next) => validateRoles(req, res, next, 'admin'),
        (req, res, next) => validateParams(req, res, next, 'userId'),
        (req, res) => byUserId(req, res)
    ]);
    router.put('/roles', [
        validateWithToken,
        (req, res, next) => validateRoles(req, res, next, 'admin'),
        (req, res, next) => validateParams(req, res, next, 'userId,newRoles'),
        (req, res) => editRoles(req, res)
    ]);
    router.put('/groups', [
        validateWithToken,
        (req, res, next) => validateRoles(req, res, next, 'admin'),
        (req, res, next) => validateParams(req, res, next, 'userId,newGroups'),
        (req, res) => editGroups(req, res)
    ]);

    // User Profile Routes
    router.get('/profile', [
        validateWithToken,
        (req, res) => getProfile(req, res)
    ]);
    router.put('/profile', [
        validateWithToken,
        (req, res) => editProfile(req, res)
    ]);
    router.delete('/profile', [
        validateWithToken,
        (req, res) => deleteProfile(req, res)
    ]);
    router.put('/userPin', [
        validateWithCred,
        (req, res, next) => validateParams(req, res, next, 'email,userPin,newUserPin'),
        (req, res) => changeUserPin(req, res)
    ]);

    // User Addresses Routes
    // router.get('/address/list', [
    //     validateWithToken,
    //     (req, res) => addressList(req, res)
    // ]);
    // router.post('/address', [
    //     validateWithToken,
    //     (req, res) => addAddress(req, res)
    // ]);
    // router.put('/address', [
    //     validateWithToken,
    //     (req, res, next) => validateParams(req, res, next, 'addressId,data'),
    //     (req, res) => editAddress(req, res)
    // ]);
    // router.delete('/address', [
    //     validateWithToken,
    //     (req, res, next) => validateParams(req, res, next, 'addressId'),
    //     (req, res) => deleteAddress(req, res)
    // ]);

    // // User PhoneNos Routes
    // router.get('/phoneNo/list', [
    //     validateWithToken,
    //     (req, res) => phoneNoList(req, res)
    // ]);
    // router.post('/phoneNo', [
    //     validateWithToken,
    //     (req, res) => addPhoneNo(req, res)
    // ]);
    // router.put('/phoneNo', [
    //     validateWithToken,
    //     (req, res, next) => validateParams(req, res, next, 'phoneId,data'),
    //     (req, res) => editPhoneNo(req, res)
    // ]);
    // router.delete('/phoneNo', [
    //     validateWithToken,
    //     (req, res, next) => validateParams(req, res, next, 'phoneId'),
    //     (req, res) => deletePhoneNo(req, res)
    // ]);

    // Temporary Routes
    router.get('/tempAll', (req, res) => userTempAll(req, res));
    router.get('/address/tempAll', (req, res) => addressTempAll(req, res));
    router.get('/phoneNo/tempAll', (req, res) => phoneNoTempAll(req, res));

    return router;
};