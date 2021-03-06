import { model } from 'mongoose';

import {
    BaseSchema, commonShemaOptions, defineCommonVirtuals, IBaseDocument, IBaseModel
} from './BaseSchema';
import { CASE_KEY_FIELDS, USER_KEY_FIELDS } from '../configs/query-fields';
import { genders } from '../configs/enum-constants';
import { UserModel } from './user.model';

const FIELDS_CASE_TYPE_POPU = 'name ctId -_id';
const FIELDS_RELATIONSHIP_POPU = 'name relId -_id';

interface ICaseDoc extends ICase, IBaseDocument { };

interface ICaseModel extends IBaseModel<ICaseDoc> {
    caseDetails(caseId: string): any;
    byId(caseId: string): any;
    countDocs(): any;
    keyProps(): any;
    isExist(caseInfo: ICase): any;
    editCase(vAuthUser: string, caseId: string, data: ICase): any;
    toggleReaction(caseId: string, data: ICase): any;
};

const CaseSchema = new BaseSchema({
    caseId: { type: String },
    title: { type: String, required: true, trim: true, unique: true },
    description: { type: String, trim: true },
    name: { type: String, required: true, trim: true },
    ctId: { type: Number },
    relId: { type: Number },
    contactPerson: { type: String, trim: true },
    contactNo: { type: String, required: true, trim: true, unique: true },
    alternateNo1: { type: String, trim: true },
    alternateNo2: { type: String, trim: true },
    gender: { type: String, enum: genders, lowercase: true },
    age: { type: Number, min: 0, max: 100 },
    isApproved: { type: Number, default: 0, enum: [1, 0] },
    approvedOn: { type: Date, default: new Date() },
    referredById: { type: String, trim: true },
    referredOn: { type: Date, default: new Date() },
    address: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true },
    isClosed: { type: Number, default: 0, enum: [1, 0] },
    closedOn: { type: Date, default: null },
    closingReason: { type: String, default: null },
    showContactNos: { type: Boolean },
    showAddress: { type: Boolean },
    upVoters: { type: [String], default: [] },
    downVoters: { type: [String], default: [] }
},
    {
        collection: 'Case',
        ...commonShemaOptions((doc, ret, options) => {
            return ret;
        })
    }
);

defineCommonVirtuals(CaseSchema);

// Case Schema's virtual fields
CaseSchema.virtual('caseType', {
    ref: 'CaseType',
    localField: 'ctId',
    foreignField: 'ctId',
    justOne: true
});

CaseSchema.virtual('relationship', {
    ref: 'Relationship',
    localField: 'relId',
    foreignField: 'relId',
    justOne: true
});

CaseSchema.virtual('referredBy', {
    ref: 'User',
    localField: 'referredById',
    foreignField: 'userId',
    justOne: true
});

// Case Schema's save pre hook
CaseSchema.pre('save', async function (next) {
    let $case: any = this;

    $case.caseId = $case._id;

    if (!$case.referredById) {
        const defaultReferrer: any = await UserModel.findOne({ email: 'gurinder1god@gmail.com' }).select('userId').exec();
        $case.referredById = defaultReferrer ? defaultReferrer.userId : '';
    }

    next();
});

CaseSchema.post('save', async function ($case, next) {

    await $case.
        populate('createdBy', USER_KEY_FIELDS)
        .populate('updatedBy', USER_KEY_FIELDS)
        .populate('referredBy', USER_KEY_FIELDS)
        .populate('caseType', FIELDS_CASE_TYPE_POPU)
        .populate('relationship', FIELDS_RELATIONSHIP_POPU)
        .execPopulate();

    next();
});

// CaseSchema.pre('updateOne', function (next) {
//     next();
// });

/*
 * Add Custom static methods
 * =========================
 * 
 * Do not declare methods using ES6 arrow functions (=>). 
 * Arrow functions explicitly prevent binding this
 */
CaseSchema.statics.list = function () {
    return this
        .aggregate([{ $match: {} }])
        .project({
            caseId: 1, name: 1, title: 1, isApproved: 1, isClosed: 1,
            upVoters: 1, downVoters: 1, contactNo: 1, alternateNo1: 1, alternateNo2: 1, _id: 0
        })
        .sort('title')
        .exec();
};

// CaseSchema.statics.caseDetails = function (caseId) {
//     return this
//         .aggregate([
//             { $match: { caseId } },
//             { $limit: 1 },
//             ...lookupUserFields('referredById', 'referredBy'),
//         ])
//         .project({
//             caseId: 1, title: 1, description: 1, name: 1, ctIds: 1,
//             relId: 1, contactPerson: 1, gender: 1, age: 1,
//             isApproved: 1, approvedOn: 1, referredOn: 1, city: 1, referredBy: 1,
//             state: 1, country: 1, isClosed: 1, upVoters: 1, downVoters: 1,
//             ...conditionalField('contactNo', 'showContactNos'),
//             ...conditionalField('alternateNo1', 'showContactNos'),
//             ...conditionalField('alternateNo2', 'showContactNos'),
//             ...conditionalField('address', 'showAddress'),
//             ...conditionalField('closedOn', 'isClosed'),
//             ...conditionalField('closingReason', 'isClosed'),
//             ...conditionalField('approvedOn', 'isApproved'),
//             _id: 0
//         })
//         .exec();
// };

CaseSchema.statics.caseDetails = function (caseId: string) {
    return this
        .findOne({ caseId })
        .populate('createdBy', USER_KEY_FIELDS)
        .populate('updatedBy', USER_KEY_FIELDS)
        .populate('referredBy', USER_KEY_FIELDS)
        .populate('caseType', FIELDS_CASE_TYPE_POPU)
        .populate('relationship', FIELDS_RELATIONSHIP_POPU)
        .select('-_id -__v -status').exec();
};

CaseSchema.statics.byId = function (caseId: string) {
    return this
        .findOne({ caseId })
        .select('-_id')
        .exec();
};

CaseSchema.statics.tempAll = function () {
    return this.find()
        .populate('createdBy', USER_KEY_FIELDS)
        .populate('updatedBy', USER_KEY_FIELDS)
        .populate('referredBy', USER_KEY_FIELDS)
        .populate('caseType', FIELDS_CASE_TYPE_POPU)
        .populate('relationship', FIELDS_RELATIONSHIP_POPU)
        .select().exec();
};

CaseSchema.statics.countDocs = function () {
    return this.countDocuments();
};

CaseSchema.statics.keyProps = function () {
    return this.find().select(CASE_KEY_FIELDS).sort('title').exec();
};

CaseSchema.statics.isExist = function (caseInfo: ICase) {
    return this
        .findOne({
            $and: [
                { contactNo: caseInfo.contactNo },
                { title: caseInfo.title }
            ]
        })
        .exec();
};

CaseSchema.statics.editCase = function (vAuthUser: string, caseId: string, data: ICase) {
    return this.findOneAndUpdate(
        { caseId },
        { $set: { ...data, vAuthUser } },
        { upsert: false, new: true }
    )
        .populate('createdBy', USER_KEY_FIELDS)
        .populate('updatedBy', USER_KEY_FIELDS)
        .populate('referredBy', USER_KEY_FIELDS)
        .populate('caseType', FIELDS_CASE_TYPE_POPU)
        .populate('relationship', FIELDS_RELATIONSHIP_POPU)
        .select('-_id -__v -status').exec();
};

CaseSchema.statics.toggleReaction = function (caseId: string, data: ICase) {
    return this.findOneAndUpdate(
        { caseId },
        { $set: { ...data } },
        {
            upsert: false,
            new: true,
            timestamps: false
        }
    )
        .populate('createdBy', USER_KEY_FIELDS)
        .populate('updatedBy', USER_KEY_FIELDS)
        .populate('referredBy', USER_KEY_FIELDS)
        .populate('caseType', FIELDS_CASE_TYPE_POPU)
        .populate('relationship', FIELDS_RELATIONSHIP_POPU)
        .select('-_id -__v -status').exec();
};

export const CaseModel = model<ICaseDoc, ICaseModel>('Case', CaseSchema);