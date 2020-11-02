import { Router } from 'express';

import { BloodGroupController } from '../controllers/blood-group.controller';
import { validateParams, validateToken, validatePermissions } from '../middlewares/routes';
import { CAN_ADD_BLOOD_GROUP, CAN_EDIT_BLOOD_GROUP } from '../configs/permissions';

const { bgList, bgEdit, bgAdd, tempAll } = new BloodGroupController();

const router = Router();

// Middleware that is specific to this router
router.use((req, res, next) => {
    // Log for all requests
    console.log('Router: API: BloodGroup: Request made');
    next();
});

export const getBloodGroupRouter = (passport) => {

    const validateWithToken = (req, res, next) => validateToken(req, res, next, passport);

    router.get('/list', [
        validateWithToken,
        (req, res) => bgList(req, res)
    ]);

    router.put('/update', [
        validateWithToken,
        (req, res, next) => validatePermissions(req, res, next, CAN_EDIT_BLOOD_GROUP),
        (req, res, next) => validateParams(req, res, next, 'name,bgId'),
        (req, res) => bgEdit(req, res)
    ]);

    router.post('/add', [
        validateWithToken,
        (req, res, next) => validatePermissions(req, res, next, CAN_ADD_BLOOD_GROUP),
        (req, res, next) => validateParams(req, res, next, 'name'),
        (req, res) => bgAdd(req, res)
    ]);

    if (process.env.DB_FILL_MODE === 'ON') {
        router.get('/tempAll', (req, res) => tempAll(req, res));
    }
    return router;
};