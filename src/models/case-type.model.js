import { model } from 'mongoose';

import {
    BaseSchema, commonShemaOptions, defineCommonVirtuals
} from './BaseSchema';
import { USER_KEY_FIELDS } from '../configs/query-fields';

const CaseTypeSchema = new BaseSchema({
    caseTypeId: { type: String, },
    name: { type: String, required: true, trim: true },
    label: { type: String, trim: true }
},
    {
        collection: 'CaseType',
        ...commonShemaOptions((doc, ret, options) => {
            return ret;
        })
    }
);

defineCommonVirtuals(CaseTypeSchema);

// CaseType Schema's save pre hook
CaseTypeSchema.pre('save', async function (next) {
    let $caseType = this;

    $caseType.caseTypeId = $caseType._id;

    next();
});

CaseTypeSchema.post('save', async function ($caseType, next) {

    const populatedCaseType = await $caseType.execPopulate();

    next();
});

/*
 * Add Custom static methods
 * =========================
 * 
 * Do not declare methods using ES6 arrow functions (=>). 
 * Arrow functions explicitly prevent binding this
 */
CaseTypeSchema.statics.list = function () {
    return this
        .aggregate([{ $match: {} }])
        .project({ caseTypeId: 1, name: 1, label: 1, _id: 0 })
        .sort('label')
        .exec();
};

CaseTypeSchema.statics.tempAll = function () {
    return this.find()
        .populate('createdBy', USER_KEY_FIELDS)
        .populate('updatedBy', USER_KEY_FIELDS)
        .select().exec();
};

CaseTypeSchema.statics.count = function () {
    return this.countDocuments();
};

CaseTypeSchema.statics.caseTypeExists = function ({ name }) {
    return this
        .findOne({ name })
        .exec();
};

CaseTypeSchema.statics.editCaseType = function (vAuthUser, caseTypeId, data) {
    return this.findOneAndUpdate(
        { caseTypeId },
        { $set: { ...data, vAuthUser } },
        { upsert: false, new: true }
    )
        .select('name label caseTypeId -_id').exec();
};

CaseTypeSchema.statics.saveCaseType = function ($caseType) {
    return $caseType.save();
};

export const CaseTypeModel = model('CaseType', CaseTypeSchema);