import { Router } from 'express';

import { UserController } from '../controllers/user.controller';
import { validateParams, validateToken, validatePermissions } from '../middlewares/routes';
import { CAN_ADD_MEMBER } from '../configs/permissions';

const {
    ids, usersList, userProfile, byUserId, count,
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

    router.get('/userProfile/:userId', [
        validateWithToken,
        (req, res, next) => validateParams(req, res, next, 'userId'),
        (req, res) => userProfile(req, res)
    ]);

    router.get('/myProfile', [
        validateWithToken,
        (req, res) => myProfile(req, res)
    ]);

    router.put('/updateUser', [
        validateWithToken,
        (req, res) => editProfile(req, res)
    ]);

    router.put('/updateDevice', [
        validateWithToken,
        (req, res) => editDevice(req, res)
    ]);

    router.post('/createUser', [
        validateWithToken,
        (req, res, next) => validatePermissions(req, res, next, CAN_ADD_MEMBER),
        (req, res, next) => validateParams(req, res, next, 'email,name'),
        (req, res) => createProfile(req, res)
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