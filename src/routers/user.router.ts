import { NextFunction, Request, Response, Router } from 'express';

import { UserController } from '../controllers/user.controller';
import { validateParams, validateToken, validatePermissions } from '../middlewares/routes';
import {
    CAN_ADD_MEMBER, CAN_EDIT_MEMBER, CAN_EDIT_MEMBER_ROLES,
    CAN_VERIFY_MEMBER, CAN_VIEW_MEMBER_PROFILE
} from '../configs/permissions';

const {
    addUser, editUser, ids, usersList, userProfile, mapRoles, markVerified,
    editMyProfile, count,
    myProfile, editDevice,
    tempAll: userTempAll
} = new UserController();

const router = Router();

// Middleware that is specific to this router
router.use((req: Request, res: Response, next: NextFunction) => {
    // Log for all requests
    console.log('Router: API: User: Request made');
    next();
});

export const getUserRouter = (passport) => {

    const validateWithToken = (req: Request, res: Response, next: NextFunction) => validateToken(req, res, next, passport);

    router.post('/add', [
        validateWithToken,
        (req: Request, res: Response, next: NextFunction) => validatePermissions(req, res, next, CAN_ADD_MEMBER),
        (req: Request, res: Response, next: NextFunction) => validateParams(req, res, next, 'email,name'),
        (req: Request, res: Response) => addUser(req, res)
    ]);

    router.put('/update', [
        validateWithToken,
        (req: Request, res: Response, next: NextFunction) => validatePermissions(req, res, next, CAN_EDIT_MEMBER),
        (req: Request, res: Response) => editUser(req, res)
    ]);

    router.get('/profile/:userId', [
        validateWithToken,
        (req: Request, res: Response, next: NextFunction) => validatePermissions(req, res, next, CAN_VIEW_MEMBER_PROFILE),
        (req: Request, res: Response, next: NextFunction) => validateParams(req, res, next, 'userId'),
        (req: Request, res: Response) => userProfile(req, res)
    ]);

    router.get('/list', [
        validateWithToken,
        (req: Request, res: Response) => usersList(req, res)
    ]);

    router.put('/roles', [
        validateWithToken,
        (req: Request, res: Response, next: NextFunction) => validatePermissions(req, res, next, CAN_EDIT_MEMBER_ROLES),
        (req: Request, res: Response, next: NextFunction) => validateParams(req, res, next, 'userId,roles'),
        (req: Request, res: Response) => mapRoles(req, res)
    ]);

    router.put('/verify', [
        validateWithToken,
        (req: Request, res: Response, next: NextFunction) => validatePermissions(req, res, next, CAN_VERIFY_MEMBER),
        (req: Request, res: Response, next: NextFunction) => validateParams(req, res, next, 'userId'),
        (req: Request, res: Response) => markVerified(req, res)
    ]);

    router.get('/myProfile', [
        validateWithToken,
        (req: Request, res: Response) => myProfile(req, res)
    ]);

    router.put('/myProfile', [
        validateWithToken,
        (req: Request, res: Response) => editMyProfile(req, res)
    ]);

    router.get('/count', [
        validateWithToken,
        (req: Request, res: Response) => count(req, res)
    ]);

    router.get('/ids', [
        validateWithToken,
        (req: Request, res: Response) => ids(req, res)
    ]);

    router.put('/device', [
        validateWithToken,
        (req: Request, res: Response) => editDevice(req, res)
    ]);

    // router.delete('/profile', [
    //     validateWithToken,
    //     (req: Request, res: Response) => deleteProfile(req, res)
    // ]);

    if (process.env.DB_FILL_MODE === 'ON') {
        router.get('/tempAll', (req: Request, res: Response) => userTempAll(req, res));
    }

    return router;
};