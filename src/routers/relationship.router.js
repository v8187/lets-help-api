import { Router } from 'express';

import { RelationshipController } from '../controllers/relationship.controller';
import { validateParams, validateToken, validatePermissions } from '../middlewares/routes';
import { CAN_ADD_RELATIONSHIP, CAN_EDIT_RELATIONSHIP } from '../configs/permissions';

const { relList, relEdit, relAdd, tempAll } = new RelationshipController();

const router = Router();

// Middleware that is specific to this router
router.use((req, res, next) => {
    // Log for all requests
    console.log('Router: API: Relationship: Request made');
    next();
});

export const getRelationshipRouter = (passport) => {

    const validateWithToken = (req, res, next) => validateToken(req, res, next, passport);

    router.get('/list', [
        validateWithToken,
        (req, res) => relList(req, res)
    ]);

    router.put('/update', [
        validateWithToken,
        (req, res, next) => validatePermissions(req, res, next, CAN_EDIT_RELATIONSHIP),
        (req, res, next) => validateParams(req, res, next, 'name,relationshipId'),
        (req, res) => relEdit(req, res)
    ]);

    router.post('/add', [
        validateWithToken,
        (req, res, next) => validatePermissions(req, res, next, CAN_ADD_RELATIONSHIP),
        (req, res, next) => validateParams(req, res, next, 'name'),
        (req, res) => relAdd(req, res)
    ]);

    if (process.env.DB_FILL_MODE === 'ON') {
        router.get('/tempAll', (req, res) => tempAll(req, res));
    }

    return router;
};