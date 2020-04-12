import { Router } from 'express';

import { CaseController } from '../controllers/case.controller';
import {
    validateParams,
    validateToken, validateRoles
} from '../middlewares/routes';

const {
    ids, casesList, caseDetails, byCaseId,
    editCase, createCase,
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

    router.get('/ids', [
        validateWithToken,
        (req, res) => ids(req, res)
    ]);

    router.get('/list', [
        validateWithToken,
        // (req, res, next) => validateRoles(req, res, next, 'admin'),
        (req, res) => casesList(req, res)
    ]);

    router.get('/caseInfo/:caseId', [
        validateWithToken,
        (req, res, next) => validateParams(req, res, next, 'caseId'),
        (req, res) => caseDetails(req, res)
    ]);

    router.put('/updateCase', [
        validateWithToken,
        (req, res) => editCase(req, res)
    ]);

    router.post('/createCase', [
        validateWithToken,
        (req, res, next) => validateRoles(req, res, next, 'admin'),
        (req, res, next) => validateParams(req, res, next, 'email,name'),
        (req, res) => createCase(req, res)
    ]);

    router.post('/requestCase', [
        validateWithToken,
        (req, res, next) => validateRoles(req, res, next, 'admin'),
        (req, res, next) => validateParams(req, res, next, 'email,name'),
        (req, res) => createCase(req, res)
    ]);

    // router.get('/info/:caseId', [
    //     validateWithToken,
    //     (req, res, next) => validateRoles(req, res, next, 'admin'),
    //     (req, res, next) => validateParams(req, res, next, 'caseId'),
    //     (req, res) => byCaseId(req, res)
    // ]);

    // Temporary Routes
    router.get('/tempAll', (req, res) => caseTempAll(req, res));

    return router;
};