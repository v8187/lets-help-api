import { Router } from 'express';

import { enumValuesRouter } from './enum-values.router';
import { getUserRouter } from './user.router';
import { getCaseRouter } from './case.router';
import { getTransactionRouter } from './transaction.router';
import { getUserRoleRouter } from './user-role.router';
import { getCaseTypeRouter } from './case-type.router';
import { getRelationshipRouter } from './relationship.router';
import { getNotificationRouter } from './notification.router';
import { getBloodGroupRouter } from './blood-group.router';

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
    router.use('/userRole', getUserRoleRouter(passport));
    router.use('/caseType', getCaseTypeRouter(passport));
    router.use('/relationship', getRelationshipRouter(passport));
    router.use('/bloodGroup', getBloodGroupRouter(passport));
    router.use('/notification', getNotificationRouter(passport));
    // router.use('/message', getCaseRouter(passport));
    return router;
};