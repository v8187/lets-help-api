import { Router } from 'express';

import { CaseTypeController } from '../controllers/case-type.controller';
import { validateParams, validateToken, validatePermissions } from '../middlewares/routes';
import { CAN_ADD_CASE_TYPE, CAN_EDIT_CASE_TYPE } from '../configs/permissions';

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
        (req, res, next) => validatePermissions(req, res, next, CAN_EDIT_CASE_TYPE),
        (req, res, next) => validateParams(req, res, next, 'name,ctId'),
        (req, res) => editCaseType(req, res)
    ]);

    router.post('/createCaseType', [
        validateWithToken,
        (req, res, next) => validatePermissions(req, res, next, CAN_ADD_CASE_TYPE),
        (req, res, next) => validateParams(req, res, next, 'name'),
        (req, res) => createCaseType(req, res)
    ]);

    if (process.env.DB_FILL_MODE === 'ON') {
        // Temporary Routes
        router.get('/tempAll', (req, res) => caseTypeTempAll(req, res));
    }

    return router;
};