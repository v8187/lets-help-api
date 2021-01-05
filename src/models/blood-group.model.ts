import { model } from 'mongoose';

import {
    BaseSchema, commonShemaOptions, defineCommonVirtuals, IBaseDocument, IBaseModel
} from './BaseSchema';
import { USER_KEY_FIELDS } from '../configs/query-fields';

interface IBloodGroupDoc extends IBloodGroup, IBaseDocument { };

interface IBloodGroupModel extends IBaseModel<IBloodGroupDoc> {
    bgEdit(vAuthUser: string, bgId: string, data: IBloodGroup): any;
    countDocs(): any;
};

const BloodGroupSchema = new BaseSchema({
    bgId: { type: Number, unique: true },
    name: { type: String, required: true, trim: true, lowercase: true, unique: true },
},
    {
        collection: 'BloodGroup',
        ...commonShemaOptions((doc, ret, options) => {
            return ret;
        })
    }
);

defineCommonVirtuals(BloodGroupSchema);

// BloodGroup Schema's save pre hook
BloodGroupSchema.pre('save', async function (next) {
    // let $bloodGroup = this;

    // $bloodGroup.bgId = $bloodGroup._id;

    next();
});

BloodGroupSchema.post('save', async function ($bloodGroup, next) {

    await $bloodGroup.execPopulate();

    next();
});

/*
 * Add Custom static methods
 * =========================
 * 
 * Do not declare methods using ES6 arrow functions (=>). 
 * Arrow functions explicitly prevent binding this
 */
BloodGroupSchema.statics.list = function () {
    return this
        .aggregate([{ $match: {} }])
        .project({ bgId: 1, name: 1, _id: 0 })
        .sort('name')
        .exec();
};

BloodGroupSchema.statics.tempAll = function () {
    return this.find()
        .populate('createdBy', USER_KEY_FIELDS)
        .populate('updatedBy', USER_KEY_FIELDS)
        .select().exec();
};

BloodGroupSchema.statics.countDocs = function () {
    return this.countDocuments();
};

BloodGroupSchema.statics.bgEdit = function (vAuthUser: string, bgId: string, data: IBloodGroup) {
    return this.findOneAndUpdate(
        { bgId },
        { $set: { ...data, vAuthUser } },
        { upsert: false, new: true }
    )
        .select('name bgId -_id').exec();
};

export const BloodGroupModel = model<IBloodGroupDoc, IBloodGroupModel>('BloodGroup', BloodGroupSchema);