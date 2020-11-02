import { Router } from 'express';

import { getBloodGroupRouter } from './blood-group.router';
import { getCaseTypeRouter } from './case-type.router';
import { getCaseRouter } from './case.router';
import { getNotificationRouter } from './notification.router';
import { getPermissionRouter } from './permission.router';
import { getRelationshipRouter } from './relationship.router';
import { getTransactionRouter } from './transaction.router';
import { getUserRoleRouter } from './user-role.router';
import { getUserRouter } from './user.router';

const router = Router();

// Middleware that is specific to this router
router.use((req, res, next) => {
    // Log for all requests
    console.log('Router: API: Index: Request made');
    next();
});

export const getApiRouter = (passport) => {
    router.use('/bloodGroup', getBloodGroupRouter(passport));
    router.use('/caseType', getCaseTypeRouter(passport));
    router.use('/case', getCaseRouter(passport));
    router.use('/notification', getNotificationRouter(passport));
    router.use('/permission', getPermissionRouter(passport));
    router.use('/relationship', getRelationshipRouter(passport));
    router.use('/transaction', getTransactionRouter(passport));
    router.use('/userRole', getUserRoleRouter(passport));
    router.use('/user', getUserRouter(passport));
    return router;
};