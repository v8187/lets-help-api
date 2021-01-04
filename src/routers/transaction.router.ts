import { NextFunction, Request, Response, Router } from 'express';

import { TransactionController, FIELDS_TRANSACTION_REQUIRED } from '../controllers/transaction.controller';
import { validateParams, validateToken, validatePermissions } from '../middlewares/routes';
import { CAN_ADD_TRANSACTION, CAN_EDIT_TRANSACTION, CAN_SEARCH_TRANSACTION, CAN_VIEW_TRANSACTION_DETAILS } from '../configs/permissions';

const {
    findTransaction, transStats, transList, transDetails,
    transEdit, transAdd,
    tempAll
} = new TransactionController();

const router = Router();

// Middleware that is specific to this router
router.use((req: Request, res: Response, next: NextFunction) => {
    // Log for all requests
    console.log('Router: API: Transaction: Request made');
    next();
});

export const getTransactionRouter = (passport) => {

    const validateWithToken = (req: Request, res: Response, next: NextFunction) => validateToken(req, res, next, passport);

    router.post('/find', [
        validateWithToken,
        (req: Request, res: Response, next: NextFunction) => validatePermissions(req, res, next, CAN_SEARCH_TRANSACTION),
        (req: Request, res: Response) => findTransaction(req, res)
    ]);

    router.get('/stats', [
        validateWithToken,
        (req: Request, res: Response, next: NextFunction) => validatePermissions(req, res, next, CAN_SEARCH_TRANSACTION),
        (req: Request, res: Response) => transStats(req, res)
    ]);

    router.get('/list', [
        validateWithToken,
        (req: Request, res: Response, next: NextFunction) => validatePermissions(req, res, next, CAN_SEARCH_TRANSACTION),
        (req: Request, res: Response) => transList(req, res)
    ]);

    router.get('/transInfo/:transId', [
        validateWithToken,
        (req: Request, res: Response, next: NextFunction) => validatePermissions(req, res, next, CAN_VIEW_TRANSACTION_DETAILS),
        (req: Request, res: Response, next: NextFunction) => validateParams(req, res, next, 'transId'),
        (req: Request, res: Response) => transDetails(req, res)
    ]);

    router.put('/update', [
        validateWithToken,
        (req: Request, res: Response, next: NextFunction) => validatePermissions(req, res, next, CAN_EDIT_TRANSACTION),
        (req: Request, res: Response, next: NextFunction) => validateParams(req, res, next, 'transId'),
        (req: Request, res: Response) => transEdit(req, res)
    ]);

    router.post('/add', [
        validateWithToken,
        (req: Request, res: Response, next: NextFunction) => validatePermissions(req, res, next, CAN_ADD_TRANSACTION),
        (req: Request, res: Response, next: NextFunction) => validateParams(req, res, next, FIELDS_TRANSACTION_REQUIRED),
        (req: Request, res: Response) => transAdd(req, res)
    ]);

    if (process.env.DB_FILL_MODE === 'ON') {
        router.get('/tempAll', (req: Request, res: Response) => tempAll(req, res));
    }

    return router;
};