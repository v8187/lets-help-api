import { Router } from 'express';

import { RelationshipController } from '../controllers/relationship.controller';
import {
    validateParams,
    validateToken, validateRoles
} from '../middlewares/routes';

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
        (req, res, next) => validateRoles(req, res, next, 'admin'),
        (req, res, next) => validateParams(req, res, next, 'name,relationshipId'),
        (req, res) => editRelationship(req, res)
    ]);

    router.post('/createRelationship', [
        validateWithToken,
        (req, res, next) => validateRoles(req, res, next, 'admin'),
        (req, res, next) => validateParams(req, res, next, 'name'),
        (req, res) => createRelationship(req, res)
    ]);

    // Temporary Routes
    router.get('/tempAll', (req, res) => relationshipTempAll(req, res));

    return router;
};