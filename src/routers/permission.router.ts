import { NextFunction, Request, Response, Router } from 'express';

import { PermissionController } from '../controllers/permission.controller';
import { validateToken } from '../middlewares/routes';

const { permList, permAdd, tempAll } = new PermissionController();

const router = Router();

// Middleware that is specific to this router
router.use((req: Request, res: Response, next: NextFunction) => {
    // Log for all requests
    console.log('Router: API: Permission: Request made');
    next();
});

export const getPermissionRouter = (passport) => {

    const validateWithToken = (req: Request, res: Response, next: NextFunction) => validateToken(req, res, next, passport);

    router.get('/list', [
        validateWithToken,
        (req: Request, res: Response) => permList(req, res)
    ]);

    if (process.env.DB_FILL_MODE === 'ON') {
        router.post('/add', [
            (req: Request, res: Response) => permAdd(req, res)
        ]);

        router.get('/tempAll', (req: Request, res: Response) => tempAll(req, res));
    }

    return router;
};