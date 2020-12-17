import { model } from 'mongoose';

import {
    BaseSchema, commonShemaOptions, defineCommonVirtuals
} from './BaseSchema';
import { USER_KEY_FIELDS } from '../configs/query-fields';

const FIELDS_PERMISSION_POPU = 'name permId -_id';

const UserRoleSchema = new BaseSchema({
    urId: { type: Number, unique: true },
    name: { type: String, required: true, trim: true, lowercase: true, unique: true },
    permIds: [{ type: Number, required: true }],
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
        // .populate('permissions', FIELDS_PERMISSION_POPU)
        .select('urId permIds name -_id').exec();
};

UserRoleSchema.statics.byRoleIds = function (urIds) {
    return this.find({
        urId: { $in: urIds }
    })
        .populate('permissions', FIELDS_PERMISSION_POPU)
        .select('urId permIds -_id').exec();
};

UserRoleSchema.statics.rolePermissions = async function ($urIds) {
    const userPermsRes = await UserRoleModel.byRoleIds($urIds);
    const permissionNames = [];

    userPermsRes.map($grpPer => {
        $grpPer.toObject().permissions.map($per => {
            permissionNames.indexOf($per.name) === -1 && permissionNames.push($per.name);
        });
    });

    return permissionNames;
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

UserRoleSchema.statics.isExist = function ({ name }) {
    return this
        .findOne({ name })
        .exec();
};

UserRoleSchema.statics.areValidIds = async function (urIds) {
    const ids = await this.where({ urId: { $in: urIds } })
        .countDocuments().exec();

    return ids.length === urIds.length;
};

UserRoleSchema.statics.urEdit = function (vAuthUser, urId, data) {
    return this.findOneAndUpdate(
        { urId },
        { $set: { ...data, vAuthUser } },
        { upsert: false, new: true }
    )
        // .populate('createdBy', USER_KEY_FIELDS)
        // .populate('updatedBy', USER_KEY_FIELDS)
        .select('name urId -_id').exec();
};

export const UserRoleModel = model('UserRole', UserRoleSchema);