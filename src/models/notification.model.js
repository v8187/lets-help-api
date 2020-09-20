import { model } from 'mongoose';

import {
    BaseSchema, commonShemaOptions, defineCommonVirtuals
} from './BaseSchema';
import { USER_KEY_FIELDS } from '../configs/query-fields';

const NotificationSchema = new BaseSchema({
    notificationId: { type: String, },
    userId: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    image: { type: String, trim: true },
    data: { type: Object },
    sentOn: { type: Date, required: true, default: new Date() },
    isRead: { type: Boolean, default: false },
    readOn: { type: Date, required: function () { return this.isRead; } },
    isDeleted: { type: Boolean, default: false },
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

    $notification.notificationId = $notification._id;

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
NotificationSchema.statics.list = function () {
    return this
        .aggregate([{ $match: {} }])
        .project({ notificationId: 1, name: 1, label: 1, _id: 0 })
        .sort('label')
        .exec();
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

NotificationSchema.statics.notificationExists = function ({ name }) {
    return this
        .findOne({ name })
        .exec();
};

NotificationSchema.statics.editNotification = function (vAuthUser, notificationId, data) {
    return this.findOneAndUpdate(
        { notificationId },
        { $set: { ...data, vAuthUser } },
        { upsert: false, new: true }
    )
        .select('name label notificationId -_id').exec();
};

NotificationSchema.statics.saveNotification = function ($notification) {
    return $notification.save();
};

export const NotificationModel = model('Notification', NotificationSchema);