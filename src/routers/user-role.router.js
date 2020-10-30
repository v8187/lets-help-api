import { Router } from 'express';

import { UserRoleController } from '../controllers/user-role.controller';
import { validateParams, validateToken, validatePermissions } from '../middlewares/routes';
import { CAN_ADD_USER_ROLE, CAN_EDIT_USER_ROLE } from '../configs/permissions';

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
        (req, res, next) => validatePermissions(req, res, next, CAN_EDIT_USER_ROLE),
        (req, res, next) => validateParams(req, res, next, 'name,urId'),
        (req, res) => editUserRole(req, res)
    ]);

    router.post('/createUserRole', [
        validateWithToken,
        (req, res, next) => validatePermissions(req, res, next, CAN_ADD_USER_ROLE),
        (req, res, next) => validateParams(req, res, next, 'name'),
        (req, res) => createUserRole(req, res)
    ]);

    if (process.env.DB_FILL_MODE === 'ON') {
        router.get('/tempAll', (req, res) => userRoleTempAll(req, res));
    }

    return router;
};