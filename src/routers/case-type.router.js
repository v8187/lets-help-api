import { Router } from 'express';

import { CaseTypeController } from '../controllers/case-type.controller';
import { validateParams, validateToken, validatePermissions } from '../middlewares/routes';
import { CAN_ADD_CASE_TYPE, CAN_EDIT_CASE_TYPE } from '../configs/permissions';

const { ctList, ctEdit, ctAdd, tempAll } = new CaseTypeController();

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
        (req, res) => ctList(req, res)
    ]);

    router.put('/update', [
        validateWithToken,
        (req, res, next) => validatePermissions(req, res, next, CAN_EDIT_CASE_TYPE),
        (req, res, next) => validateParams(req, res, next, 'name,ctId'),
        (req, res) => ctEdit(req, res)
    ]);

    router.post('/add', [
        validateWithToken,
        (req, res, next) => validatePermissions(req, res, next, CAN_ADD_CASE_TYPE),
        (req, res, next) => validateParams(req, res, next, 'name'),
        (req, res) => ctAdd(req, res)
    ]);

    if (process.env.DB_FILL_MODE === 'ON') {
        router.get('/tempAll', (req, res) => tempAll(req, res));
    }

    return router;
};