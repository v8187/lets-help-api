import { Router } from 'express';

import { UserController } from '../controllers/user.controller';
import {
    validateParams,
    validateToken, validateRoles
} from '../middlewares/routes';

const {
    ids, usersList, userProfile, byUserId, count,
    myProfile, editProfile, createProfile,
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
        // (req, res, next) => validateRoles(req, res, next, 'admin'),
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

    router.post('/createUser', [
        validateWithToken,
        (req, res, next) => validateRoles(req, res, next, 'admin'),
        (req, res, next) => validateParams(req, res, next, 'email,name'),
        (req, res) => createProfile(req, res)
    ]);

    router.get('/info/:userId', [
        validateWithToken,
        (req, res, next) => validateRoles(req, res, next, 'admin'),
        (req, res, next) => validateParams(req, res, next, 'userId'),
        (req, res) => byUserId(req, res)
    ]);

    // router.delete('/profile', [
    //     validateWithToken,
    //     (req, res) => deleteProfile(req, res)
    // ]);

    // Temporary Routes
    router.get('/tempAll', (req, res) => userTempAll(req, res));

    return router;
};