import { Router } from 'express';

import { UserRoleController } from '../controllers/user-role.controller';
import {
    validateParams,
    validateToken, validateRoles
} from '../middlewares/routes';

const {
    ids, userRolesList, editUserRole, createUserRole,
    tempAll: userRoleTempAll
} = new UserRoleController();

const router = Router();

// Middleware that is specific to this router
router.use((req, res, next) => {
    // Log for all requests
    console.log('Router: API: User Role: Request made');
    next();
});

export const getUserRoleRouter = (passport) => {

    const validateWithToken = (req, res, next) => validateToken(req, res, next, passport);

    router.get('/list', [
        validateWithToken,
        (req, res) => userRolesList(req, res)
    ]);

    router.put('/updateUserRole', [
        validateWithToken,
        (req, res, next) => validateRoles(req, res, next, 'admin'),
        (req, res, next) => validateParams(req, res, next, 'name,label'),
        (req, res) => editUserRole(req, res)
    ]);

    router.post('/createUserRole', [
        validateWithToken,
        (req, res, next) => validateRoles(req, res, next, 'admin'),
        (req, res, next) => validateParams(req, res, next, 'name,label'),
        (req, res) => createUserRole(req, res)
    ]);

    // Temporary Routes
    router.get('/tempAll', (req, res) => userRoleTempAll(req, res));

    return router;
};