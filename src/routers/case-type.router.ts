import { NextFunction, Request, Response, Router } from 'express';

import { CaseTypeController } from '../controllers/case-type.controller';
import { validateParams, validateToken, validatePermissions } from '../middlewares/routes';
import { CAN_ADD_CASE_TYPE, CAN_EDIT_CASE_TYPE } from '../configs/permissions';

const { ctList, ctEdit, ctAdd, tempAll } = new CaseTypeController();

const router = Router();

// Middleware that is specific to this router
router.use((req: Request, res: Response, next: NextFunction) => {
    // Log for all requests
    console.log('Router: API: Case Type: Request made');
    next();
});

export const getCaseTypeRouter = (passport) => {

    const validateWithToken = (req: Request, res: Response, next: NextFunction) => validateToken(req, res, next, passport);

    router.get('/list', [
        validateWithToken,
        (req: Request, res: Response) => ctList(req, res)
    ]);

    router.put('/update', [
        validateWithToken,
        (req: Request, res: Response, next: NextFunction) => validatePermissions(req, res, next, CAN_EDIT_CASE_TYPE),
        (req: Request, res: Response, next: NextFunction) => validateParams(req, res, next, 'name,ctId'),
        (req: Request, res: Response) => ctEdit(req, res)
    ]);

    router.post('/add', [
        validateWithToken,
        (req: Request, res: Response, next: NextFunction) => validatePermissions(req, res, next, CAN_ADD_CASE_TYPE),
        (req: Request, res: Response, next: NextFunction) => validateParams(req, res, next, 'name'),
        (req: Request, res: Response) => ctAdd(req, res)
    ]);

    if (process.env.DB_FILL_MODE === 'ON') {
        router.get('/tempAll', (req: Request, res: Response) => tempAll(req, res));
    }

    return router;
};