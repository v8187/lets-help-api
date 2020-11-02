import { Router } from 'express';

import { PermissionController } from '../controllers/permission.controller';
import { validateParams, validateToken } from '../middlewares/routes';
import { } from '../configs/permissions';

const { permList, permAdd, tempAll } = new PermissionController();

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
        (req, res) => permList(req, res)
    ]);

    if (process.env.DB_FILL_MODE === 'ON') {
        router.post('/add', [
            (req, res, next) => validateParams(req, res, next, 'name'),
            (req, res) => permAdd(req, res)
        ]);

        router.get('/tempAll', (req, res) => tempAll(req, res));
    }

    return router;
};