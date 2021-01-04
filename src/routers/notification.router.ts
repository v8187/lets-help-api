import { NextFunction, Request, Response, Router } from 'express';

import { NotificationController } from '../controllers/notification.controller';
import { validateParams, validateToken } from '../middlewares/routes';
import { } from '../configs/permissions';

const {
    ids, notificationsList, readIt, readAll, removeIt,
    tempAll: notificationTempAll
} = new NotificationController();

const router = Router();

// Middleware that is specific to this router
router.use((req: Request, res: Response, next: NextFunction) => {
    // Log for all requests
    console.log('Router: API: Notification: Request made');
    next();
});

export const getNotificationRouter = (passport) => {

    const validateWithToken = (req: Request, res: Response, next: NextFunction) => validateToken(req, res, next, passport);

    router.get('/list', [
        validateWithToken,
        (req: Request, res: Response) => notificationsList(req, res)
    ]);

    // router.get('/notificationInfo/:notiId', [
    //     validateWithToken,
    //     (req: Request, res: Response, next: NextFunction) => validateParams(req, res, next, 'notiId'),
    //     (req: Request, res: Response) => notificationDetails(req, res)
    // ]);

    router.put('/read', [
        validateWithToken,
        (req: Request, res: Response, next: NextFunction) => validateParams(req, res, next, 'notiId'),
        (req: Request, res: Response) => readIt(req, res)
    ]);

    router.put('/readAll', [
        validateWithToken,
        (req: Request, res: Response) => readAll(req, res)
    ]);

    router.delete('/remove', [
        validateWithToken,
        (req: Request, res: Response, next: NextFunction) => validateParams(req, res, next, 'notiId'),
        (req: Request, res: Response) => removeIt(req, res)
    ]);

    if (process.env.DB_FILL_MODE === 'ON') {
        router.get('/tempAll', (req: Request, res: Response) => notificationTempAll(req, res));
    }

    return router;
};