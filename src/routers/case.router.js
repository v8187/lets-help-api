import { Router } from 'express';

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
router.use((req, res, next) => {
    // Log for all requests
    console.log('Router: API: Case: Request made');
    next();
});

export const getCaseRouter = (passport) => {

    const validateWithToken = (req, res, next) => validateToken(req, res, next, passport);

    router.post('/add', [
        validateWithToken,
        (req, res, next) => validatePermissions(req, res, next, CAN_ADD_CASE),
        (req, res, next) => validateParams(req, res, next, 'title,name,contactNo,city'),
        (req, res) => createCase(req, res)
    ]);

    router.put('/update', [
        validateWithToken,
        (req, res, next) => validatePermissions(req, res, next, CAN_ADD_CASE),
        (req, res, next) => validateParams(req, res, next, 'caseId'),
        (req, res) => editCase(req, res)
    ]);

    router.post('/request', [
        validateWithToken,
        (req, res, next) => validatePermissions(req, res, next, CAN_REQUEST_CASE),
        (req, res, next) => validateParams(req, res, next, 'title,name,contactNo,city'),
        (req, res) => createCase(req, res, true)
    ]);

    router.put('/request', [
        validateWithToken,
        (req, res, next) => validatePermissions(req, res, next, CAN_REQUEST_CASE),
        (req, res, next) => validateParams(req, res, next, 'caseId'),
        (req, res) => editCase(req, res)
    ]);

    router.get('/info/:caseId', [
        validateWithToken,
        (req, res, next) => validateParams(req, res, next, 'caseId'),
        (req, res) => caseDetails(req, res)
    ]);

    router.get('/list', [
        validateWithToken,
        (req, res) => casesList(req, res)
    ]);

    router.put('/react', [
        validateWithToken,
        (req, res, next) => validateParams(req, res, next, 'caseId,reactionType'),
        (req, res) => toggleReaction(req, res)
    ]);

    router.get('/count', [
        validateWithToken,
        (req, res) => count(req, res)
    ]);

    router.get('/ids', [
        validateWithToken,
        (req, res) => ids(req, res)
    ]);

    if (process.env.DB_FILL_MODE === 'ON') {
        router.get('/tempAll', (req, res) => caseTempAll(req, res));
    }

    return router;
};