import { BaseController } from './BaseController';
import { NotificationModel } from '../models/notification.model';
import { handleModelRes, getReqMetadata, sendResponse } from '../utils/handlers';

const FIELDS_RELATIONSHIP = 'name';

const createNotificationErr = (res, err = 'Server error') => {
    return sendResponse(res, {
        error: err,
        message: 'Something went wrong while creating new Notification. Try again later.',
        type: 'INTERNAL_SERVER_ERROR'
    });
};

export class NotificationController extends BaseController {

    notificationsList(req, res) {
        handleModelRes(NotificationModel.list(getReqMetadata(req).userId), res, {
            // onSuccess: data => parseResponseData(req, data)
        });
    }

    createNotification(req, res, isRequest) {
        const { name } = req.body;

        NotificationModel.isExist(req.body).then($notification => {
            if (!!$notification) {
                return sendResponse(res, {
                    error: 'Cannot create new Notification',
                    message: `Notification already exist with Name "${name}".`,
                    type: 'CONFLICT'
                });
            }

            const { body } = req;
            let newNotification = new NotificationModel();

            (FIELDS_RELATIONSHIP).split(',').map(field => {
                if (body[field] !== undefined) {
                    newNotification[field] = body[field];
                }
            });

            newNotification.vAuthUser = getReqMetadata(req).userId;

            handleModelRes(
                newNotification.save(),
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
        const { body } = req;

        handleModelRes(
            NotificationModel.markRead(getReqMetadata(req).userId, body.notiId),
            res, {
            success: 'Notification marked as Read successfully.',
            error: 'Something went wrong while updating the Notification. Try again later.'
        });
    }

    readAll(req, res) {
        handleModelRes(
            NotificationModel.markAllRead(getReqMetadata(req).userId),
            res, {
            success: 'All Notifications marked as Read successfully.',
            error: 'Something went wrong while updating the Notification. Try again later.'
        });
    }

    removeIt(req, res) {
        const { body } = req;

        handleModelRes(
            NotificationModel.markDeleted(getReqMetadata(req).userId, body.notiId),
            res, {
            success: 'Notification removed successfully.',
            error: 'Something went wrong while removing the Notification. Try again later.'
        });
    }

    tempAll(req, res) {
        handleModelRes(NotificationModel.tempAll(), res);
    }
}
