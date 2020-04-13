import { Schema, model } from 'mongoose';

import {
    BaseSchema, commonShemaOptions,
    conditionalField, defineCommonVirtuals, lookupUserFields
} from './BaseSchema';
import {
    CASE_KEY_FIELDS, FIELDS_GET_CASE_ALL, USER_KEY_FIELDS
} from '../configs/query-fields';
import { caseTypes, relationTypes, genders } from '../configs/enum-constants';
import { UserModel } from './user.model';

const CaseSchema = new BaseSchema({
    caseId: String,
    title: { type: String, required: true },
    description: { type: String },
    name: { type: String, required: true },
    caseTypes: { type: Schema.Types.EnumArray, default: [caseTypes[0]], enum: caseTypes, required: true },
    contactRelation: { type: String, default: relationTypes[0], enum: relationTypes, required: true },
    contactPerson: { type: String, required: true },
    contactNo: String,
    alternateNo1: String,
    alternateNo2: String,
    gender: { type: String, enum: genders, lowercase: true },
    age: Number,
    isApproved: { type: Boolean, default: false, enum: [true, false] },
    approvedOn: { type: Date, default: new Date() },
    referredById: String,
    referredOn: { type: Date, default: new Date() },
    address: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    isClosed: { type: Boolean, default: false, enum: [true, false] },
    closedOn: { type: Date, default: null },
    closingReason: { type: String, default: null },
    showContactNos: Boolean,
    showAddress: Boolean,
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
CaseSchema.virtual('referredBy', {
    ref: 'User',
    localField: 'referredById',
    foreignField: 'userId',
    justOne: true
});

// Case Schema's save pre hook
CaseSchema.pre('save', async function (next) {
    let $case = this;

    $case.caseId = $case._id;

    $case.createdById = $case.updatedById = $case.vAuthUser;
    delete $case.vAuthUser;

    if (!$case.referredById) {
        const defaultReferrer = await UserModel.findOne({ email: 'gurinder1god@gmail.com' }).select('userId').exec();
        $case.referredById = defaultReferrer ? defaultReferrer.userId : '';
    }

    next();
});

CaseSchema.pre('updateOne', function (next) {
    next();
});

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
        .project({ caseId: 1, title: 1, isApproved: 1, isClosed: 1, upVoters: 1, downVoters: 1, _id: 0 })
        .sort('title')
        .exec();
};

CaseSchema.statics.listForAdmin = function () {
    return this
        .aggregate([{ $match: {} }])
        .project({ caseId: 1, name: 1, title: 1, isClosed: 1, isApproved: 1, contactNo: 1, alternateNo1: 1, alternateNo2: 1, upVoters: 1, downVoters: 1, _id: 0 })
        .sort('title')
        .exec();
};

CaseSchema.statics.caseDetails = function (caseId) {
    return this
        .aggregate([
            { $match: { caseId } },
            { $limit: 1 },
            ...lookupUserFields('referredById', 'referredBy'),
        ])
        .project({
            caseId: 1, title: 1, description: 1, name: 1, caseTypes: 1,
            contactRelation: 1, contactPerson: 1, gender: 1, age: 1,
            isApproved: 1, approvedOn: 1, referredOn: 1, city: 1, referredBy: 1,
            state: 1, country: 1, isClosed: 1, upVoters: 1, downVoters: 1,
            ...conditionalField('contactNo', 'showContactNos'),
            ...conditionalField('alternateNo1', 'showContactNos'),
            ...conditionalField('alternateNo2', 'showContactNos'),
            ...conditionalField('address', 'showAddress'),
            ...conditionalField('closedOn', 'isClosed'),
            ...conditionalField('closingReason', 'isClosed'),
            ...conditionalField('approvedOn', 'isApproved'),
            _id: 0
        })
        .exec();
};

CaseSchema.statics.caseDetailsForAdmin = function (caseId) {
    return this
        .findOne({ caseId })
        .populate('createdBy', USER_KEY_FIELDS)
        .populate('updatedBy', USER_KEY_FIELDS)
        .populate('referredBy', USER_KEY_FIELDS)
        .select(FIELDS_GET_CASE_ALL)
        .exec();
};

CaseSchema.statics.byCaseId = function (caseId) {
    return this
        .findOne({ caseId })
        .populate('createdBy', USER_KEY_FIELDS)
        .populate('updatedBy', USER_KEY_FIELDS)
        .populate('referredBy', USER_KEY_FIELDS)
        .select(FIELDS_GET_CASE_ALL)
        .exec();
};

CaseSchema.statics.tempAll = function () {
    return this.find()
        .populate('createdBy', USER_KEY_FIELDS)
        .populate('updatedBy', USER_KEY_FIELDS)
        .populate('referredBy', USER_KEY_FIELDS)
        .select().exec();
};

CaseSchema.statics.keyProps = function () {
    return this.find().select(CASE_KEY_FIELDS).sort('title').exec();
};

CaseSchema.statics.editCase = function (vAuthUser, caseId, data) {
    return this.updateOne(
        { caseId },
        { $set: { ...data, vAuthUser } },
        { upsert: false }
    ).exec();
};

CaseSchema.statics.saveCase = function ($case) {
    // console.log('saveCase', $case);
    return $case.save();
};

/**
 * Add Custom instance methods
 * =========================
 * Do not declare methods using ES6 arrow functions (=>)
 * rrow functions explicitly prevent binding this
 */
// CaseSchema.methods.validateCasePin = function (pwd) {
//     return compareSync(pwd, this.casePin);
// };

// CaseSchema.methods.tokenFields = function () {
//     return {
//         caseId: this.caseId,
//         email: this.email,
//         // groups: [...this.groups],
//         roles: [...this.roles]
//     };
// };

export const CaseModel = model('Case', CaseSchema);
