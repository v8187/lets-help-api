import { NextFunction, Request, Response, Router } from 'express';

import { CaseController } from '../controllers/case.controller';
import { validateParams, validateToken, validatePermissions } from '../middlewares/routes';
import { CAN_ADD_CASE, CAN_REQUEST_CASE } from '../configs/permissions';

const {
    ids, casesList, caseDetails,
    editCase, createCase, count, toggleReaction,
    tempAll: caseTempAll
} = new CaseController();

const router = Router();

// Middleware that is specific to this router
router.use((req: Request, res: Response, next: NextFunction) => {
    // Log for all requests
    console.log('Router: API: Case: Request made');
    next();
});

export const getCaseRouter = (passport) => {

    const validateWithToken = (req: Request, res: Response, next: NextFunction) => validateToken(req, res, next, passport);

    router.post('/add', [
        validateWithToken,
        (req: Request, res: Response, next: NextFunction) => validatePermissions(req, res, next, CAN_ADD_CASE),
        (req: Request, res: Response, next: NextFunction) => validateParams(req, res, next, 'title,name,contactNo,city'),
        (req: Request, res: Response) => createCase(req, res)
    ]);

    router.put('/update', [
        validateWithToken,
        (req: Request, res: Response, next: NextFunction) => validatePermissions(req, res, next, CAN_ADD_CASE),
        (req: Request, res: Response, next: NextFunction) => validateParams(req, res, next, 'caseId'),
        (req: Request, res: Response) => editCase(req, res)
    ]);

    router.post('/request', [
        validateWithToken,
        (req: Request, res: Response, next: NextFunction) => validatePermissions(req, res, next, CAN_REQUEST_CASE),
        (req: Request, res: Response, next: NextFunction) => validateParams(req, res, next, 'title,name,contactNo,city'),
        (req: Request, res: Response) => createCase(req, res, true)
    ]);

    router.put('/request', [
        validateWithToken,
        (req: Request, res: Response, next: NextFunction) => validatePermissions(req, res, next, CAN_REQUEST_CASE),
        (req: Request, res: Response, next: NextFunction) => validateParams(req, res, next, 'caseId'),
        (req: Request, res: Response) => editCase(req, res)
    ]);

    router.get('/info/:caseId', [
        validateWithToken,
        (req: Request, res: Response, next: NextFunction) => validateParams(req, res, next, 'caseId'),
        (req: Request, res: Response) => caseDetails(req, res)
    ]);

    router.get('/list', [
        validateWithToken,
        (req: Request, res: Response) => casesList(req, res)
    ]);

    router.put('/react', [
        validateWithToken,
        (req: Request, res: Response, next: NextFunction) => validateParams(req, res, next, 'caseId,reactionType'),
        (req: Request, res: Response) => toggleReaction(req, res)
    ]);

    router.get('/count', [
        validateWithToken,
        (req: Request, res: Response) => count(req, res)
    ]);

    router.get('/ids', [
        validateWithToken,
        (req: Request, res: Response) => ids(req, res)
    ]);

    if (process.env.DB_FILL_MODE === 'ON') {
        router.get('/tempAll', (req: Request, res: Response) => caseTempAll(req, res));
    }

    return router;
};