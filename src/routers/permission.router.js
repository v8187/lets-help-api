import { Router } from 'express';

import { PermissionController } from '../controllers/permission.controller';
import { validateParams, validateToken } from '../middlewares/routes';
import { } from '../configs/permissions';

const {
    ids, permissionsList, editPermission, createPermission,
    tempAll: permissionTempAll
} = new PermissionController();

const router = Router();

// Middleware that is specific to this router
router.use((req, res, next) => {
    // Log for all requests
    console.log('Router: API: Permission: Request made');
    next();
});

export const getPermissionRouter = (passport) => {

    const validateWithToken = (req, res, next) => validateToken(req, res, next, passport);

    router.get('/list', [
        validateWithToken,
        (req, res) => permissionsList(req, res)
    ]);

    if (process.env.DB_FILL_MODE === 'ON') {
        router.put('/updatePermission', [
            (req, res, next) => validateParams(req, res, next, 'name,urId'),
            (req, res) => editPermission(req, res)
        ]);

        router.post('/createPermission', [
            (req, res, next) => validateParams(req, res, next, 'name'),
            (req, res) => createPermission(req, res)
        ]);

        router.get('/tempAll', (req, res) => permissionTempAll(req, res));
    }

    return router;
};