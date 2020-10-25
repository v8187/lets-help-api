import { model } from 'mongoose';

import {
    BaseSchema, commonShemaOptions, defineCommonVirtuals
} from './BaseSchema';
import { USER_KEY_FIELDS, FIELDS_PERMISSION_POPU } from '../configs/query-fields';

const UserRoleSchema = new BaseSchema({
    urId: { type: Number },
    name: { type: String, required: true, trim: true, lowercase: true },
    permIds: [{ type: Number, required: true }],
    // label: { type: String, trim: true }
},
    {
        collection: 'UserRole',
        ...commonShemaOptions((doc, ret, options) => {
            return ret;
        })
    }
);

defineCommonVirtuals(UserRoleSchema);

UserRoleSchema.virtual('permissions', {
    ref: 'Permission',
    localField: 'permIds',
    foreignField: 'permId'
});

// UserRole Schema's save pre hook
UserRoleSchema.pre('save', async function (next) {
    next();
});

UserRoleSchema.post('save', async function ($userRole, next) {

    await $userRole.execPopulate();

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
    return this.find()
        .populate('permissions', FIELDS_PERMISSION_POPU)
        .select('urId permIds name -_id').exec();
};

UserRoleSchema.statics.tempAll = function () {
    return this.find()
        .populate('permissions', FIELDS_PERMISSION_POPU)
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

UserRoleSchema.statics.editUserRole = function (vAuthUser, urId, data) {
    return this.findOneAndUpdate(
        { urId },
        { $set: { ...data, vAuthUser } },
        { upsert: false, new: true }
    )
        // .populate('createdBy', USER_KEY_FIELDS)
        // .populate('updatedBy', USER_KEY_FIELDS)
        .select('name urId -_id').exec();
};

UserRoleSchema.statics.saveUserRole = function ($userRole) {
    // console.log('saveUserRole', $userRole);
    return $userRole.save();
};

export const UserRoleModel = model('UserRole', UserRoleSchema);