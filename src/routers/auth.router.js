import { Router } from 'express';

import { AuthController } from '../controllers/auth.controller';
import { validateToken, validateCredentials, validateParams } from '../middlewares/routes';

const { login, logout, userPin, hasAccount } = new AuthController(),
    router = Router();

// Middleware that is specific to this router
router.use((req, res, next) => {
    // Log for all requests
    console.log('Router: Auth: Index: Request made', req.isAuthenticated());
    next();
});

export const getAuthRouter = (passport) => {

    const validateWithToken = (req, res, next) => validateToken(req, res, next, passport);
    const validateWithCred = (req, res, next) => validateCredentials(req, res, next, passport);
    const validateAuthParams = (req, res, next) => validateParams(req, res, next, 'email,userPin');

    // Check if user has account
    router.post('/hasAccount',
        (req, res, next) => validateParams(req, res, next, 'email'),
        (req, res, next) => hasAccount(req, res, next, passport));

    // Sign Up
    router.post('/userPin',
        validateAuthParams,
        (req, res, next) => userPin(req, res, next, passport));

    // Login
    router.post('/login',
        validateAuthParams,
        validateWithCred,
        (req, res, next) => login(req, res, next, passport));

    // Logout
    router.post('/logout',
        validateWithToken,
        (req, res, next) => logout(req, res, next, passport)
    );

    return router;
};