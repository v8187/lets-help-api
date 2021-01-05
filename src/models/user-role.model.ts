import { model } from 'mongoose';

import {
    BaseSchema, commonShemaOptions, defineCommonVirtuals, IBaseDocument, IBaseModel
} from './BaseSchema';
import { USER_KEY_FIELDS } from '../configs/query-fields';

const FIELDS_PERMISSION_POPU = 'name permId -_id';

interface IUserRoleDoc extends IUserRole, IBaseDocument { };

interface IUserRoleModel extends IBaseModel<IUserRoleDoc> {
    byRoleIds(urIds: number[]): any;
    rolePermissions(urIds: number[]): any;
    countDocs(): any;
    areValidIds(urIds: number[]): any;
    urEdit(vAuthUser: string, urId: string, data: IUserRole): any;
};

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

UserRoleSchema.statics.byRoleIds = function (urIds: number[]) {
    return this.find({
        urId: { $in: urIds }
    })
        .populate('permissions', FIELDS_PERMISSION_POPU)
        .select('urId permIds -_id').exec();
};

UserRoleSchema.statics.rolePermissions = async function (urIds: number[]) {
    const userPermsRes: any = await (UserRoleModel as any).byRoleIds(urIds);
    const permissionNames: string[] = [];

    userPermsRes.map(($grpPer: any) => {
        $grpPer.toObject().permissions.map(($per: { name: string }) => {
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

UserRoleSchema.statics.countDocs = function () {
    return this.countDocuments();
};

UserRoleSchema.statics.areValidIds = async function (urIds: number[]) {
    const ids = await this.where({ urId: { $in: urIds } })
        .countDocuments().exec();

    return ids.length === urIds.length;
};

UserRoleSchema.statics.urEdit = function (vAuthUser: string, urId: string, data: IUserRole) {
    return this.findOneAndUpdate(
        { urId },
        { $set: { ...data, vAuthUser } },
        { upsert: false, new: true }
    )
        // .populate('createdBy', USER_KEY_FIELDS)
        // .populate('updatedBy', USER_KEY_FIELDS)
        .select('name urId -_id').exec();
};

export const UserRoleModel = model<IUserRoleDoc, IUserRoleModel>('UserRole', UserRoleSchema);