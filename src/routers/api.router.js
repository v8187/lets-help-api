import { Router } from 'express';

import { enumValuesRouter } from './enum-values.router';
import { getUserRouter } from './user.router';
import { getCaseRouter } from './case.router';
import { getTransactionRouter } from './transaction.router';

const router = Router();

// Middleware that is specific to this router
router.use((req, res, next) => {
    // Log for all requests
    console.log('Router: API: Index: Request made');
    next();
});

export const getApiRouter = (passport) => {
    router.use('/enumValues', enumValuesRouter);
    router.use('/user', getUserRouter(passport));
    router.use('/case', getCaseRouter(passport));
    router.use('/transaction', getTransactionRouter(passport));
    router.use('/userRole', getCaseRouter(passport));
    router.use('/caseType', getCaseRouter(passport));
    router.use('/personRelation', getCaseRouter(passport));
    router.use('/location', getCaseRouter(passport));
    router.use('/message', getCaseRouter(passport));
    return router;
};