import { BaseController } from './BaseController';
import { NotificationModel } from '../models/notification.model';
import { handleModelRes, getReqMetadata, sendResponse } from '../utils/handlers';
import { FIELDS_RELATIONSHIP } from '../configs/query-fields';

const createNotificationErr = (res, err = 'Server error') => {
    return sendResponse(res, {
        error: err,
        message: 'Something went wrong while creating new Notification. Try again later.',
        type: 'INTERNAL_SERVER_ERROR'
    });
};

export class NotificationController extends BaseController {

    notificationsList(req, res) {
        const user = getReqMetadata(req, 'user');

        handleModelRes(NotificationModel.list(user.userId), res, {
            // onSuccess: data => parseResponseData(req, data)
        });
    }

    createNotification(req, res, isRequest) {
        const { name } = req.body;

        NotificationModel.notificationExists(req.body).then($notification => {
            if (!!$notification) {
                return sendResponse(res, {
                    error: 'Cannot create new Notification',
                    message: `Notification already exist with Name "${name}".`,
                    type: 'CONFLICT'
                });
            }
            const user = getReqMetadata(req, 'user');

            const { body } = req;
            let newNotification = new NotificationModel();

            (FIELDS_RELATIONSHIP).split(',').map(field => {
                const data = body[field];
                if (data !== undefined) {
                    newNotification[field] = data;
                }
            });

            newNotification.vAuthUser = user.userId;

            handleModelRes(
                NotificationModel.saveNotification(newNotification),
                res, {
                success: 'Notification created successfully.',
                error: 'Something went wrong while creating new Notification. Try again later.',
                // onSuccess: data => {
                //     parseResponseData(req, data, true);
                // }
            });
        }, modelErr => {
            console.error(modelErr);
            return createNotificationErr(res, modelErr.message);
        }).catch(modelReason => {
            console.log(modelReason);
            return createNotificationErr(res, modelReason.message);
        });
    }

    readIt(req, res) {
        const user = getReqMetadata(req, 'user');
        const { body } = req;

        handleModelRes(
            NotificationModel.markRead(user.userId, body.notificationId),
            res, {
            success: 'Notification marked as Read successfully.',
            error: 'Something went wrong while updating the Notification. Try again later.'
        });
    }

    readAll(req, res) {
        const user = getReqMetadata(req, 'user');

        handleModelRes(
            NotificationModel.markAllRead(user.userId),
            res, {
            success: 'All Notifications marked as Read successfully.',
            error: 'Something went wrong while updating the Notification. Try again later.'
        });
    }

    removeIt(req, res) {
        const user = getReqMetadata(req, 'user');
        const { body } = req;

        handleModelRes(
            NotificationModel.markDeleted(user.userId, body.notificationId),
            res, {
            success: 'Notification removed successfully.',
            error: 'Something went wrong while removing the Notification. Try again later.'
        });
    }

    tempAll(req, res) {
        handleModelRes(NotificationModel.tempAll(), res);
    }
}
