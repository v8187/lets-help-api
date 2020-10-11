import { Router } from 'express';

import { BloodGroupController } from '../controllers/blood-group.controller';
import {
    validateParams,
    validateToken, validateRoles
} from '../middlewares/routes';

const {
    ids, bloodGroupsList, editBloodGroup, createBloodGroup,
    tempAll: bloodGroupTempAll
} = new BloodGroupController();

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
        (req, res) => bloodGroupsList(req, res)
    ]);

    router.put('/updateBloodGroup', [
        validateWithToken,
        (req, res, next) => validateRoles(req, res, next, 'admin'),
        (req, res, next) => validateParams(req, res, next, 'name,bgId'),
        (req, res) => editBloodGroup(req, res)
    ]);

    router.post('/createBloodGroup', [
        validateWithToken,
        (req, res, next) => validateRoles(req, res, next, 'admin'),
        (req, res, next) => validateParams(req, res, next, 'name'),
        (req, res) => createBloodGroup(req, res)
    ]);

    // Temporary Routes
    router.get('/tempAll', (req, res) => bloodGroupTempAll(req, res));

    return router;
};