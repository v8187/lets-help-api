import { model } from 'mongoose';

import {
    BaseSchema, commonShemaOptions, defineCommonVirtuals, IBaseDocument, IBaseModel
} from './BaseSchema';
import { USER_KEY_FIELDS } from '../configs/query-fields';

interface ICaseTypeDoc extends ICaseType, IBaseDocument { };

interface ICaseTypeModel extends IBaseModel<ICaseTypeDoc> {
    ctEdit(vAuthUser: string, ctId: string, data: ICaseType): any;
    countDocs(): any;
};

const CaseTypeSchema = new BaseSchema({
    ctId: { type: Number, unique: true },
    name: { type: String, required: true, trim: true, lowercase: true, unique: true },
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
    // let $caseType = this;

    // $caseType.ctId = $caseType._id;

    next();
});

CaseTypeSchema.post('save', async function ($caseType, next) {

    await $caseType.execPopulate();

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
        .project({ ctId: 1, name: 1, _id: 0 })
        .sort('name')
        .exec();
};

CaseTypeSchema.statics.tempAll = function () {
    return this.find()
        .populate('createdBy', USER_KEY_FIELDS)
        .populate('updatedBy', USER_KEY_FIELDS)
        .select().exec();
};

CaseTypeSchema.statics.countDocs = function () {
    return this.countDocuments();
};

CaseTypeSchema.statics.ctEdit = function (vAuthUser: string, ctId: string, data: ICaseType) {
    return this.findOneAndUpdate(
        { ctId },
        { $set: { ...data, vAuthUser } },
        { upsert: false, new: true }
    )
        .select('name ctId -_id').exec();
};

export const CaseTypeModel = model<ICaseTypeDoc, ICaseTypeModel>('CaseType', CaseTypeSchema);