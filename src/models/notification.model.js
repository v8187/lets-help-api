import { model } from 'mongoose';

import {
    BaseSchema, commonShemaOptions, defineCommonVirtuals
} from './BaseSchema';
import { USER_KEY_FIELDS } from '../configs/query-fields';

const NOTI_QUERY_FIELDS = 'notiId userId title body image data sentOn isRead readOn isDeleted -_id';

const NotificationSchema = new BaseSchema({
    notiId: { type: String, },
    userId: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    image: { type: String, trim: true },
    data: { type: Object },
    sentOn: { type: Date, required: true, default: new Date() },
    isRead: { type: Boolean, default: false },
    readOn: { type: Date, required: function () { return this.isRead; } },
    isDeleted: { type: Boolean, default: false },
    deletedOn: { type: Date, required: function () { return this.isDeleted; } },
},
    {
        collection: 'Notification',
        ...commonShemaOptions((doc, ret, options) => {
            return ret;
        })
    }
);

defineCommonVirtuals(NotificationSchema);

// Notification Schema's save pre hook
NotificationSchema.pre('save', async function (next) {
    let $notification = this;

    $notification.notiId = $notification._id;

    next();
});

NotificationSchema.post('save', async function ($notification, next) {

    const populatedNotification = await $notification.execPopulate();

    next();
});

/*
 * Add Custom static methods
 * =========================
 * 
 * Do not declare methods using ES6 arrow functions (=>). 
 * Arrow functions explicitly prevent binding this
 */
NotificationSchema.statics.list = function (userId) {
    return this.find({
        userId,
        isDeleted: false,
        status: 1
    }).select(NOTI_QUERY_FIELDS).exec();
};

NotificationSchema.statics.tempAll = function () {
    return this.find()
        .populate('createdBy', USER_KEY_FIELDS)
        .populate('updatedBy', USER_KEY_FIELDS)
        .select().exec();
};

NotificationSchema.statics.count = function () {
    return this.countDocuments();
};

NotificationSchema.statics.markRead = function (vAuthUser, notiId) {
    return this.updateOne(
        { notiId, userId: vAuthUser },
        { $set: { isRead: true, readOn: new Date(), vAuthUser } },
        { upsert: false, new: true }
    ).exec();
};

NotificationSchema.statics.markAllRead = function (vAuthUser) {
    return this.updateMany(
        { userId: vAuthUser },
        { $set: { isRead: true, readOn: new Date(), vAuthUser } },
        { upsert: false, new: true }
    ).exec();
};

NotificationSchema.statics.markDeleted = function (vAuthUser, notiId) {
    return this.updateOne(
        { notiId, userId: vAuthUser },
        { $set: { isDeleted: true, deletedOn: new Date(), vAuthUser } },
        { upsert: false, new: true }
    ).exec();
};

export const NotificationModel = model('Notification', NotificationSchema);