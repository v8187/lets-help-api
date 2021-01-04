import { Request, Response } from 'express';

import { BaseController } from './BaseController';
import { NotificationModel } from '../models/notification.model';
import { handleModelRes, getReqMetadata } from '../utils/handlers';

const FIELDS_RELATIONSHIP = 'name';

export class NotificationController extends BaseController {

    notificationsList(req: Request, res: Response) {
        handleModelRes(NotificationModel.list(getReqMetadata(req).userId), res, {
            // onSuccess: data => parseResponseData(req, data)
        });
    }

    createNotification(req: Request, res: Response) {
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
            name: 'Notification'
            // onSuccess: data => {
            //     parseResponseData(req, data, true);
            // }
        });
    }

    readIt(req: Request, res: Response) {
        const { body } = req;

        handleModelRes(
            NotificationModel.markRead(getReqMetadata(req).userId, body.notiId),
            res, {
            success: 'Notification marked as Read successfully.',
            error: 'Something went wrong while updating the Notification. Try again later.'
        });
    }

    readAll(req: Request, res: Response) {
        handleModelRes(
            NotificationModel.markAllRead(getReqMetadata(req).userId),
            res, {
            success: 'All Notifications marked as Read successfully.',
            error: 'Something went wrong while updating the Notification. Try again later.'
        });
    }

    removeIt(req: Request, res: Response) {
        const { body } = req;

        handleModelRes(
            NotificationModel.markDeleted(getReqMetadata(req).userId, body.notiId),
            res, {
            success: 'Notification removed successfully.',
            error: 'Something went wrong while removing the Notification. Try again later.'
        });
    }

    tempAll(req: Request, res: Response) {
        handleModelRes(NotificationModel.tempAll(), res);
    }
}
