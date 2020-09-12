import { Router } from 'express';

import { CaseTypeController } from '../controllers/case-type.controller';
import {
    validateParams,
    validateToken, validateRoles
} from '../middlewares/routes';

const {
    ids, caseTypesList, editCaseType, createCaseType,
    tempAll: caseTypeTempAll
} = new CaseTypeController();

const router = Router();

// Middleware that is specific to this router
router.use((req, res, next) => {
    // Log for all requests
    console.log('Router: API: Case Type: Request made');
    next();
});

export const getCaseTypeRouter = (passport) => {

    const validateWithToken = (req, res, next) => validateToken(req, res, next, passport);

    router.get('/list', [
        validateWithToken,
        (req, res) => caseTypesList(req, res)
    ]);

    router.put('/updateCaseType', [
        validateWithToken,
        (req, res, next) => validateRoles(req, res, next, 'admin'),
        (req, res, next) => validateParams(req, res, next, 'name,label,caseTypeId'),
        (req, res) => editCaseType(req, res)
    ]);

    router.post('/createCaseType', [
        validateWithToken,
        (req, res, next) => validateRoles(req, res, next, 'admin'),
        (req, res, next) => validateParams(req, res, next, 'name,label'),
        (req, res) => createCaseType(req, res)
    ]);

    // Temporary Routes
    router.get('/tempAll', (req, res) => caseTypeTempAll(req, res));

    return router;
};