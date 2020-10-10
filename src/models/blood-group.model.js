import { model } from 'mongoose';

import {
    BaseSchema, commonShemaOptions, defineCommonVirtuals
} from './BaseSchema';
import { USER_KEY_FIELDS } from '../configs/query-fields';

const BloodGroupSchema = new BaseSchema({
    bgId: { type: String, },
    name: { type: String, required: true, trim: true, lowercase: true },
    // label: { type: String, trim: true }
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
    let $bloodGroup = this;

    // $bloodGroup.bgId = $bloodGroup._id;

    next();
});

BloodGroupSchema.post('save', async function ($bloodGroup, next) {

    const populatedBloodGroup = await $bloodGroup.execPopulate();

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
        .project({ bgId: 1, name: 1, label: 1, _id: 0 })
        .sort('label')
        .exec();
};

BloodGroupSchema.statics.tempAll = function () {
    return this.find()
        .populate('createdBy', USER_KEY_FIELDS)
        .populate('updatedBy', USER_KEY_FIELDS)
        .select().exec();
};

BloodGroupSchema.statics.count = function () {
    return this.countDocuments();
};

BloodGroupSchema.statics.bloodGroupExists = function ({ name }) {
    return this
        .findOne({ name })
        .exec();
};

BloodGroupSchema.statics.editBloodGroup = function (vAuthUser, bgId, data) {
    return this.findOneAndUpdate(
        { bgId },
        { $set: { ...data, vAuthUser } },
        { upsert: false, new: true }
    )
        .select('name label bgId -_id').exec();
};

BloodGroupSchema.statics.saveBloodGroup = function ($bloodGroup) {
    return $bloodGroup.save();
};

export const BloodGroupModel = model('BloodGroup', BloodGroupSchema);