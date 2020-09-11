import { model } from 'mongoose';

import {
    BaseSchema, commonShemaOptions, defineCommonVirtuals
} from './BaseSchema';
import { USER_KEY_FIELDS } from '../configs/query-fields';

const UserRoleSchema = new BaseSchema({
    userRoleId: { type: String, },
    name: { type: String, required: true, trim: true },
    label: { type: String, trim: true }
},
    {
        collection: 'UserRole',
        ...commonShemaOptions((doc, ret, options) => {
            return ret;
        })
    }
);

defineCommonVirtuals(UserRoleSchema);

// UserRole Schema's save pre hook
UserRoleSchema.pre('save', async function (next) {
    let $userRole = this;

    $userRole.userRoleId = $userRole._id;

    next();
});

UserRoleSchema.post('save', async function ($userRole, next) {

    const populatedUserRole = await $userRole.
        populate('createdBy', USER_KEY_FIELDS)
        .populate('updatedBy', USER_KEY_FIELDS)
        .populate('referredBy', USER_KEY_FIELDS)
        .execPopulate();

    next();
});

/*
 * Add Custom static methods
 * =========================
 * 
 * Do not declare methods using ES6 arrow functions (=>). 
 * Arrow functions explicitly prevent binding this
 */
UserRoleSchema.statics.list = function () {
    return this
        .aggregate([{ $match: {} }])
        .project({ userRoleId: 1, name: 1, label: 1, _id: 0 })
        .sort('label')
        .exec();
};

UserRoleSchema.statics.tempAll = function () {
    return this.find()
        .populate('createdBy', USER_KEY_FIELDS)
        .populate('updatedBy', USER_KEY_FIELDS)
        .select().exec();
};

UserRoleSchema.statics.count = function () {
    return this.countDocuments();
};

UserRoleSchema.statics.userRoleExists = function ({ name }) {
    return this
        .findOne({ name })
        .exec();
};

UserRoleSchema.statics.editUserRole = function (vAuthUser, userRoleId, data) {
    return this.findOneAndUpdate(
        { userRoleId },
        { $set: { ...data, vAuthUser } },
        { upsert: false, new: true }
    )
        .populate('createdBy', USER_KEY_FIELDS)
        .populate('updatedBy', USER_KEY_FIELDS)
        .select('-_id -__v').exec();
};

UserRoleSchema.statics.saveUserRole = function ($userRole) {
    // console.log('saveUserRole', $userRole);
    return $userRole.save();
};

export const UserRoleModel = model('UserRole', UserRoleSchema);