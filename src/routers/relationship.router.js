import { Router } from 'express';

import { RelationshipController } from '../controllers/relationship.controller';
import { validateParams, validateToken, validatePermissions } from '../middlewares/routes';
import { CAN_ADD_RELATIONSHIP, CAN_EDIT_RELATIONSHIP } from '../configs/permissions';

const {
    ids, relationshipsList, editRelationship, createRelationship,
    tempAll: relationshipTempAll
} = new RelationshipController();

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
        (req, res) => relationshipsList(req, res)
    ]);

    router.put('/updateRelationship', [
        validateWithToken,
        (req, res, next) => validatePermissions(req, res, next, CAN_EDIT_RELATIONSHIP),
        (req, res, next) => validateParams(req, res, next, 'name,relationshipId'),
        (req, res) => editRelationship(req, res)
    ]);

    router.post('/createRelationship', [
        validateWithToken,
        (req, res, next) => validatePermissions(req, res, next, CAN_ADD_RELATIONSHIP),
        (req, res, next) => validateParams(req, res, next, 'name'),
        (req, res) => createRelationship(req, res)
    ]);

    if (process.env.DB_FILL_MODE === 'ON') {
        // Temporary Routes
        router.get('/tempAll', (req, res) => relationshipTempAll(req, res));
    }

    return router;
};