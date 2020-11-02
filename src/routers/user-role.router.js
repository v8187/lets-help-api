import { Router } from 'express';

import { UserRoleController } from '../controllers/user-role.controller';
import { validateParams, validateToken, validatePermissions } from '../middlewares/routes';
import { CAN_ADD_USER_ROLE, CAN_EDIT_USER_ROLE } from '../configs/permissions';

const { urList, urEdit, urAdd, tempAll } = new UserRoleController();

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
        (req, res) => urList(req, res)
    ]);

    router.put('/update', [
        validateWithToken,
        (req, res, next) => validatePermissions(req, res, next, CAN_EDIT_USER_ROLE),
        (req, res, next) => validateParams(req, res, next, 'name,urId'),
        (req, res) => urEdit(req, res)
    ]);

    router.post('/add', [
        validateWithToken,
        (req, res, next) => validatePermissions(req, res, next, CAN_ADD_USER_ROLE),
        (req, res, next) => validateParams(req, res, next, 'name'),
        (req, res) => urAdd(req, res)
    ]);

    if (process.env.DB_FILL_MODE === 'ON') {
        router.get('/tempAll', (req, res) => tempAll(req, res));
    }

    return router;
};