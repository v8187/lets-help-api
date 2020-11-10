import { Router } from 'express';

import { NotificationController } from '../controllers/notification.controller';
import { validateParams, validateToken } from '../middlewares/routes';
import { } from '../configs/permissions';

const {
    ids, notificationsList, readIt, readAll, removeIt,
    tempAll: notificationTempAll
} = new NotificationController();

const router = Router();

// Middleware that is specific to this router
router.use((req, res, next) => {
    // Log for all requests
    console.log('Router: API: Notification: Request made');
    next();
});

export const getNotificationRouter = (passport) => {

    const validateWithToken = (req, res, next) => validateToken(req, res, next, passport);

    router.get('/list', [
        validateWithToken,
        (req, res) => notificationsList(req, res)
    ]);

    // router.get('/notificationInfo/:notiId', [
    //     validateWithToken,
    //     (req, res, next) => validateParams(req, res, next, 'notiId'),
    //     (req, res) => notificationDetails(req, res)
    // ]);

    router.put('/read', [
        validateWithToken,
        (req, res, next) => validateParams(req, res, next, 'notiId'),
        (req, res) => readIt(req, res)
    ]);

    router.put('/readAll', [
        validateWithToken,
        (req, res) => readAll(req, res)
    ]);

    router.delete('/remove', [
        validateWithToken,
        (req, res, next) => validateParams(req, res, next, 'notiId'),
        (req, res) => removeIt(req, res)
    ]);

    if (process.env.DB_FILL_MODE === 'ON') {
        router.get('/tempAll', (req, res) => notificationTempAll(req, res));
    }

    return router;
};