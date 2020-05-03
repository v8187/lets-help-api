import { Router } from 'express';

import { TransactionController } from '../controllers/transaction.controller';
import { validateParams, validateToken, validateRoles } from '../middlewares/routes';
import { FIELDS_TRANSACTION_REQUIRED } from '../configs/query-fields';

const {
    findTransaction, transStats, transactionsList, transDetails,
    editTransaction, createTransaction,
    tempAll: transTempAll
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
        (req, res) => findTransaction(req, res)
    ]);

    router.get('/stats', [
        validateWithToken,
        (req, res) => transStats(req, res)
    ]);

    router.get('/list', [
        validateWithToken,
        (req, res) => transactionsList(req, res)
    ]);

    router.get('/transInfo/:transId', [
        validateWithToken,
        (req, res, next) => validateParams(req, res, next, 'transId'),
        (req, res) => transDetails(req, res)
    ]);

    router.put('/updateTransaction', [
        validateWithToken,
        (req, res, next) => validateRoles(req, res, next, 'admin'),
        (req, res, next) => validateParams(req, res, next, 'transId'),
        (req, res) => editTransaction(req, res)
    ]);

    router.post('/createTransaction', [
        validateWithToken,
        (req, res, next) => validateRoles(req, res, next, 'admin'),
        (req, res, next) => validateParams(req, res, next, FIELDS_TRANSACTION_REQUIRED),
        (req, res) => createTransaction(req, res)
    ]);

    // Temporary Routes
    router.get('/tempAll', (req, res) => transTempAll(req, res));

    return router;
};