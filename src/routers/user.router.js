import { Router } from 'express';

import { UserController } from '../controllers/user.controller';
import {
    validateCredentials, validateParams,
    validateToken, validateRoles
} from '../middlewares/routes';

const {
    usersList, byUserId, editRoles, editGroups,
    getProfile, editProfile,
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

    const validateWithCred = (req, res, next) => validateCredentials(req, res, next, passport);
    const validateWithToken = (req, res, next) => validateToken(req, res, next, passport);

    // User Profile Routes
    router.get('/profile', [
        validateWithToken,
        (req, res) => getProfile(req, res)
    ]);
    router.put('/profile', [
        validateWithToken,
        (req, res) => editProfile(req, res)
    ]);

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

    // router.delete('/profile', [
    //     validateWithToken,
    //     (req, res) => deleteProfile(req, res)
    // ]);

    // Temporary Routes
    router.get('/tempAll', (req, res) => userTempAll(req, res));

    return router;
};