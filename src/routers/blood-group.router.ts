import { NextFunction, Request, Response, Router } from 'express';

import { BloodGroupController } from '../controllers/blood-group.controller';
import { validateParams, validateToken, validatePermissions } from '../middlewares/routes';
import { CAN_ADD_BLOOD_GROUP, CAN_EDIT_BLOOD_GROUP } from '../configs/permissions';

const { bgList, bgEdit, bgAdd, tempAll } = new BloodGroupController();

const router = Router();

// Middleware that is specific to this router
router.use((req: Request, res: Response, next: NextFunction) => {
    // Log for all requests
    console.log('Router: API: BloodGroup: Request made');
    next();
});

export const getBloodGroupRouter = (passport) => {

    const validateWithToken = (req: Request, res: Response, next: NextFunction) => validateToken(req, res, next, passport);

    router.get('/list', [
        validateWithToken,
        (req: Request, res: Response) => bgList(req, res)
    ]);

    router.put('/update', [
        validateWithToken,
        (req: Request, res: Response, next: NextFunction) => validatePermissions(req, res, next, CAN_EDIT_BLOOD_GROUP),
        (req: Request, res: Response, next: NextFunction) => validateParams(req, res, next, 'name,bgId'),
        (req: Request, res: Response) => bgEdit(req, res)
    ]);

    router.post('/add', [
        validateWithToken,
        (req: Request, res: Response, next: NextFunction) => validatePermissions(req, res, next, CAN_ADD_BLOOD_GROUP),
        (req: Request, res: Response, next: NextFunction) => validateParams(req, res, next, 'name'),
        (req: Request, res: Response) => bgAdd(req, res)
    ]);

    if (process.env.DB_FILL_MODE === 'ON') {
        router.get('/tempAll', (req: Request, res: Response) => tempAll(req, res));
    }
    return router;
};