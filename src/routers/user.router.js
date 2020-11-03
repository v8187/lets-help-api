import { Router } from 'express';

import { UserController } from '../controllers/user.controller';
import { validateParams, validateToken, validatePermissions } from '../middlewares/routes';
import {
    CAN_ADD_MEMBER, CAN_EDIT_MEMBER, CAN_EDIT_MEMBER_ROLES,
    CAN_REFER_MEMBER, CAN_VERIFY_MEMBER, CAN_VIEW_MEMBER_PROFILE
} from '../configs/permissions';

const {
    ids, usersList, userProfile, count,
    myProfile, editProfile, createProfile, editDevice,
    tempAll: userTempAll
} = new UserController();

const router = Router();

// Middleware that is specific to this router
router.use((req, res, next) => {
    // Log for all requests
    console.log('Router: API: User: Request made');
    next();
});

export const getUserRouter = (passport) => {

    const validateWithToken = (req, res, next) => validateToken(req, res, next, passport);

    router.post('/add', [
        validateWithToken,
        (req, res, next) => validatePermissions(req, res, next, CAN_ADD_MEMBER),
        (req, res, next) => validateParams(req, res, next, 'email,name'),
        (req, res) => createProfile(req, res)
    ]);

    router.put('/update', [
        validateWithToken,
        (req, res, next) => validatePermissions(req, res, next, CAN_EDIT_MEMBER),
        (req, res) => editProfile(req, res)
    ]);

    router.post('/refer', [
        validateWithToken,
        (req, res, next) => validatePermissions(req, res, next, CAN_REFER_MEMBER),
        (req, res) => editProfile(req, res)
    ]);

    router.put('/refer', [
        validateWithToken,
        (req, res, next) => validatePermissions(req, res, next, CAN_REFER_MEMBER),
        (req, res) => editProfile(req, res)
    ]);

    router.get('/profile/:userId', [
        validateWithToken,
        (req, res, next) => validatePermissions(req, res, next, CAN_VIEW_MEMBER_PROFILE),
        (req, res, next) => validateParams(req, res, next, 'userId'),
        (req, res) => userProfile(req, res)
    ]);

    router.put('/roles', [
        validateWithToken,
        (req, res, next) => validatePermissions(req, res, next, CAN_EDIT_MEMBER_ROLES),
        (req, res, next) => validateParams(req, res, next, 'userId,roles'),
        (req, res) => userProfile(req, res)
    ]);

    router.put('/verify', [
        validateWithToken,
        (req, res, next) => validatePermissions(req, res, next, CAN_VERIFY_MEMBER),
        (req, res, next) => validateParams(req, res, next, 'userId'),
        (req, res) => userProfile(req, res)
    ]);

    router.get('/myProfile', [
        validateWithToken,
        (req, res) => userProfile(req, res)
    ]);

    router.put('/myProfile', [
        validateWithToken,
        (req, res) => userProfile(req, res)
    ]);

    router.get('/count', [
        validateWithToken,
        (req, res) => count(req, res)
    ]);

    router.get('/ids', [
        validateWithToken,
        (req, res) => ids(req, res)
    ]);

    router.get('/list', [
        validateWithToken,
        (req, res) => usersList(req, res)
    ]);

    router.put('/device', [
        validateWithToken,
        (req, res) => editDevice(req, res)
    ]);

    // router.delete('/profile', [
    //     validateWithToken,
    //     (req, res) => deleteProfile(req, res)
    // ]);

    if (process.env.DB_FILL_MODE === 'ON') {
        router.get('/tempAll', (req, res) => userTempAll(req, res));
    }

    return router;
};