import { NextFunction, Request, Response, Router } from 'express';
import { PassportStatic } from 'passport';

import { AuthController } from '../controllers/auth.controller';
import { validateToken, validateCredentials, validateParams } from '../middlewares/routes';

const { hasAccount, signUp, login, logout, changeUserPin } = new AuthController(),
    router = Router();

// Middleware that is specific to this router
router.use((req: Request, res: Response, next: NextFunction) => {
    // Log for all requests
    console.log('Router: Auth: Index: Request made', req.isAuthenticated());
    next();
});

export const getAuthRouter = (passport: PassportStatic) => {

    const validateWithToken = (req: Request, res: Response, next: NextFunction) => validateToken(req, res, next, passport);
    const validateWithCred = (req: Request, res: Response, next: NextFunction) => validateCredentials(req, res, next, passport);

    // Check if user has account
    router.post('/hasAccount',
        (req: Request, res: Response, next: NextFunction) => validateParams(req, res, next, 'email'),
        (req: Request, res: Response, next: NextFunction) => hasAccount(req, res, next, passport));

    // Create Acocunt
    router.post('/register',
        (req: Request, res: Response, next: NextFunction) => validateParams(req, res, next, 'email,name,userPin'),
        (req: Request, res: Response, next: NextFunction) => signUp(req, res, next, passport));

    // Update/Change PIN
    router.put('/updatePin', [
        validateWithToken,
        (req: Request, res: Response, next: NextFunction) => validateParams(req, res, next, 'email,newUserPin'),
        (req: Request, res: Response) => changeUserPin(req, res)
    ]);

    // Login
    router.post('/login',
        (req: Request, res: Response, next: NextFunction) => validateParams(req, res, next, 'email,userPin'),
        validateWithCred,
        (req: Request, res: Response, next: NextFunction) => login(req, res, next, passport));

    // Logout
    router.post('/logout',
        validateWithToken,
        (req: Request, res: Response, next: NextFunction) => logout(req, res, next, passport)
    );

    return router;
};