import { NextFunction, Request, Response, Router } from 'express';

import { UserRoleController } from '../controllers/user-role.controller';
import { validateParams, validateToken, validatePermissions } from '../middlewares/routes';
import { CAN_ADD_USER_ROLE, CAN_EDIT_USER_ROLE } from '../configs/permissions';

const { urList, urEdit, urAdd, tempAll } = new UserRoleController();

const router = Router();

// Middleware that is specific to this router
router.use((req: Request, res: Response, next: NextFunction) => {
    // Log for all requests
    console.log('Router: API: User Role: Request made');
    next();
});

export const getUserRoleRouter = (passport) => {

    const validateWithToken = (req: Request, res: Response, next: NextFunction) => validateToken(req, res, next, passport);

    router.get('/list', [
        validateWithToken,
        (req: Request, res: Response) => urList(req, res)
    ]);

    router.put('/update', [
        validateWithToken,
        (req: Request, res: Response, next: NextFunction) => validatePermissions(req, res, next, CAN_EDIT_USER_ROLE),
        (req: Request, res: Response, next: NextFunction) => validateParams(req, res, next, 'name,urId'),
        (req: Request, res: Response) => urEdit(req, res)
    ]);

    router.post('/add', [
        validateWithToken,
        (req: Request, res: Response, next: NextFunction) => validatePermissions(req, res, next, CAN_ADD_USER_ROLE),
        (req: Request, res: Response, next: NextFunction) => validateParams(req, res, next, 'name'),
        (req: Request, res: Response) => urAdd(req, res)
    ]);

    if (process.env.DB_FILL_MODE === 'ON') {
        router.get('/tempAll', (req: Request, res: Response) => tempAll(req, res));
    }

    return router;
};