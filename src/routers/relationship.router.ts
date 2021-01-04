import { NextFunction, Request, Response, Router } from 'express';

import { RelationshipController } from '../controllers/relationship.controller';
import { validateParams, validateToken, validatePermissions } from '../middlewares/routes';
import { CAN_ADD_RELATIONSHIP, CAN_EDIT_RELATIONSHIP } from '../configs/permissions';

const { relList, relEdit, relAdd, tempAll } = new RelationshipController();

const router = Router();

// Middleware that is specific to this router
router.use((req: Request, res: Response, next: NextFunction) => {
    // Log for all requests
    console.log('Router: API: Relationship: Request made');
    next();
});

export const getRelationshipRouter = (passport) => {

    const validateWithToken = (req: Request, res: Response, next: NextFunction) => validateToken(req, res, next, passport);

    router.get('/list', [
        validateWithToken,
        (req: Request, res: Response) => relList(req, res)
    ]);

    router.put('/update', [
        validateWithToken,
        (req: Request, res: Response, next: NextFunction) => validatePermissions(req, res, next, CAN_EDIT_RELATIONSHIP),
        (req: Request, res: Response, next: NextFunction) => validateParams(req, res, next, 'name,relId'),
        (req: Request, res: Response) => relEdit(req, res)
    ]);

    router.post('/add', [
        validateWithToken,
        (req: Request, res: Response, next: NextFunction) => validatePermissions(req, res, next, CAN_ADD_RELATIONSHIP),
        (req: Request, res: Response, next: NextFunction) => validateParams(req, res, next, 'name'),
        (req: Request, res: Response) => relAdd(req, res)
    ]);

    if (process.env.DB_FILL_MODE === 'ON') {
        router.get('/tempAll', (req: Request, res: Response) => tempAll(req, res));
    }

    return router;
};