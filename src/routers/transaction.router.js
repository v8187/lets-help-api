import { Router } from 'express';

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
router.use((req, res, next) => {
    // Log for all requests
    console.log('Router: API: Transaction: Request made');
    next();
});

export const getTransactionRouter = (passport) => {

    const validateWithToken = (req, res, next) => validateToken(req, res, next, passport);

    router.post('/find', [
        validateWithToken,
        (req, res, next) => validatePermissions(req, res, next, CAN_SEARCH_TRANSACTION),
        (req, res) => findTransaction(req, res)
    ]);

    router.get('/stats', [
        validateWithToken,
        (req, res, next) => validatePermissions(req, res, next, CAN_SEARCH_TRANSACTION),
        (req, res) => transStats(req, res)
    ]);

    router.get('/list', [
        validateWithToken,
        (req, res, next) => validatePermissions(req, res, next, CAN_SEARCH_TRANSACTION),
        (req, res) => transList(req, res)
    ]);

    router.get('/transInfo/:transId', [
        validateWithToken,
        (req, res, next) => validatePermissions(req, res, next, CAN_VIEW_TRANSACTION_DETAILS),
        (req, res, next) => validateParams(req, res, next, 'transId'),
        (req, res) => transDetails(req, res)
    ]);

    router.put('/update', [
        validateWithToken,
        (req, res, next) => validatePermissions(req, res, next, CAN_EDIT_TRANSACTION),
        (req, res, next) => validateParams(req, res, next, 'transId'),
        (req, res) => transEdit(req, res)
    ]);

    router.post('/add', [
        validateWithToken,
        (req, res, next) => validatePermissions(req, res, next, CAN_ADD_TRANSACTION),
        (req, res, next) => validateParams(req, res, next, FIELDS_TRANSACTION_REQUIRED),
        (req, res) => transAdd(req, res)
    ]);

    if (process.env.DB_FILL_MODE === 'ON') {
        router.get('/tempAll', (req, res) => tempAll(req, res));
    }

    return router;
};