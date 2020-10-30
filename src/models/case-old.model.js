import { Schema, model, Document, DocumentQuery, Aggregate } from 'mongoose';
import { compareSync } from 'bcryptjs';

import {
    BaseSchema, IBaseDocument, IBaseModel,
    commonShemaOptions, defineCommonVirtuals, lookupUserFields, lookupCountryFields, lookupStateFields, lookupCityFields
} from './BaseSchema';
import {
    USER_KEY_FIELDS, CASE_PUBLIC_QUERY_FIELDS, CASE_ADMIN_QUERY_FIELDS,
    ADDRESS_QUERY_FIELDS, PHONE_QUERY_FIELDS
} from './query-fields';
import { caseCategories, frequencies, durations, genders } from '../configs/enum-constants';

const CASE_ADMIN_QUERY_FIELDS = '-_id -__v -status';
export const CASE_PUBLIC_QUERY_FIELDS = '-_id -__v -status -createdById -updatedById -createdOn -updatedOn';

const CaseSchema = new BaseSchema({
    // Account Fields
    caseId: { type: String },
    caseTitle: {
        type: String, lowercase: true, required: true
    },
    description: {
        type: String, require: true
    },
    caseCategories: {
        type: Schema.Types.EnumArray, enum: caseCategories, required: true
    },
    isVerified: { type: Boolean, default: false },
    frequency: { type: String, enum: frequencies, required: true },
    duration: { type: String, enum: durations, required: true },

    // Personal Fields
    name: { type: String },
    gender: { type: String, enum: genders, lowercase: true },
    dob: { type: Date, required: function () { return !this.age; } },
    age: { type: Number, required: function () { return !this.dob; } },
    pictures: { type: String, lowercase: true },

    // Communication Fields
    email: {
        type: String, lowercase: true
    },
    // addresses: [{ type: String, ref: 'address' }],
    // contactNo: { type: String, ref: 'phoneNo' },
    // location: { type: String },
    cityId: { type: Number },
    stateId: { type: Number },
    countryId: { type: String },

    // Misc Fields
    referredById: { type: String },
    registeredOn: { type: Date },
    confirmedOn: { type: Date },
    closedOn: { type: Date },
    closeReason: { type: String }
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

// CaseSchema.virtual('votes', {
//     ref: 'Vote',
//     localField: 'caseId',
//     foreignField: 'refId',
//     count: true
// });

// CaseSchema.virtual('addresses', {
//     ref: 'Address',
//     localField: 'caseId',
//     foreignField: 'refId'
// });

// CaseSchema.virtual('contactNo', {
//     ref: 'PhoneNo',
//     localField: 'caseId',
//     foreignField: 'refId'
// });

// CaseSchema.virtual('city', {
//     ref: 'City',
//     localField: 'cityId',
//     foreignField: 'cityId',
//     justOne: true
// });

// CaseSchema.virtual('state', {
//     ref: 'State',
//     localField: 'stateId',
//     foreignField: 'stateId',
//     justOne: true
// });

// CaseSchema.virtual('country', {
//     ref: 'Country',
//     localField: 'countryId',
//     foreignField: 'countryId',
//     justOne: true
// });

// Case Schema's save pre hook
CaseSchema.pre('save', function (next) {
    let tempCase = this;

    // console.log('tempCase', tempCase);

    tempCase.caseId = tempCase._id;

    next();
});

CaseSchema.pre('updateOne', function (next) {
    // let changes = <ICaseDoc>this.getUpdate().$set;
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
        .find()
        .select(CASE_PUBLIC_QUERY_FIELDS)
        .exec();
    // return this.aggregate([{
    //     $project: { caseId: 1, caseTitle: 1, description: 1, frequency: 1, isVerified: 1, name: 1, email: 1, mobile: 1, pictures: 1, _id: 0 }
    // }]);
};

CaseSchema.statics.tempAll = function () {
    return this.aggregate([
        ...lookupUserFields('createdById', 'createdBy'),
        ...lookupUserFields('updatedById', 'updatedBy'),
        ...lookupUserFields('referredById', 'referredBy'),
        // ...lookupCountryFields('countryId', 'country'),
        // ...lookupStateFields('stateId', 'state'),
        // ...lookupCityFields('cityId', 'city'),
        {
            $lookup: {
                from: 'Vote', as: 'votes', let: { caseId: '$caseId' },
                pipeline: [
                    { $match: { $expr: { $and: [{ $eq: ['$refId', '$$caseId'] }, { $eq: ['$refModel', 'Case'] }, { $ne: ['$voteType', -1] }] } } },
                    { $group: { _id: '$voteType', votes: { $sum: 1 } } },
                    { $group: { _id: '$$caseId', votes: { $push: { k: { $toString: '$_id' }, v: '$votes' } } } },
                    { $replaceRoot: { newRoot: { $arrayToObject: '$votes' } } },
                    { $addFields: { 'total': { $sum: ['$$ROOT.0', '$$ROOT.1'] } } }
                ]
            }
        }, { $unwind: '$votes' },
        {
            $lookup: {
                from: 'Comment', as: 'comments', let: { caseId: '$caseId' },
                pipeline: [
                    { $match: { $expr: { $and: [{ $eq: ['$refId', '$$caseId'] }, { $eq: ['$refModel', 'Case'] }] } } },
                    { $group: { _id: '$refId',/*  comments: { $push: { comment: '$comments', byId: '$commentById' } },  */total: { $sum: 1 } } },
                    { $project: { _id: 0 } }
                ]
            }
        }, { $unwind: '$comments' },
        // { $lookup: { from: 'Vote', localField: 'caseId', foreignField: 'refId', as: 'votes' } },
        // { $match: { 'votes.voteType': { $ne: -1 } } },
        // {
        //     $group: {
        //         _id: { caseId: '$caseId', voteType: '$votes.voteType' },
        //         case: { $first: '$$ROOT' },
        //         votes: { $push: { byId: '$votes.voteById', type: '$votes.voteType' } },
        //         typeCount: { $sum: 1 }
        //     }
        // },
        // { $replaceRoot: { newRoot: { $mergeObjects: ['$case', '$$ROOT'] } } },
        // {
        //     $group: {
        //         _id: '$_id.caseId',
        //         case: { $first: '$$ROOT' },
        //         countByType: { $push: { k: { $toString: '$_id.voteType' }, v: '$typeCount' } },
        //         'total': { $sum: '$typeCount' }
        //     }
        // },
        // { $addFields: { 'votes': { $mergeObjects: [{ $arrayToObject: '$countByType' }, { total: '$total' }] } } },
        // { $replaceRoot: { newRoot: { $mergeObjects: ['$case', '$$ROOT'] } } },
        // { $project: { typeCount: 0, total: 0, countByType: 0, case: 0, _id: 0 } }
    ]);
};

CaseSchema.statics.keyProps = function () {
    return this.find().select('caseId -_id').exec();
};

CaseSchema.statics.byCaseId = function (caseId) {
    // console.log('CASE_SELF_QUERY_FIELDS', CASE_ADMIN_QUERY_FIELDS);
    return this
        .findOne({ caseId })
        .populate('createdBy', USER_KEY_FIELDS)
        .populate('updatedBy', USER_KEY_FIELDS)
        .populate('referredBy', USER_KEY_FIELDS)
        // .populate('contactNo', PHONE_QUERY_FIELDS)
        // .populate('city', 'cityId name -_id')
        // .populate('state', 'stateId name -_id')
        // .populate('country', 'countryId name -_id')
        // .populate({
        //     path: 'addresses',
        //     model: AddressModel,
        //     select: '-_id -__v -status',
        //     populate: [{
        //         path: 'city',
        //         model: CityModel,
        //         select: 'cityId name -_id'
        //     }, {
        //         path: 'state',
        //         model: StateModel,
        //         select: 'stateId name -_id'
        //     }, {
        //         path: 'country',
        //         model: CountryModel,
        //         select: 'countryId name -_id'
        //     }]
        // })
        .select(CASE_ADMIN_QUERY_FIELDS)
        .exec();
};

CaseSchema.statics.byCaseCategories = function (caseCategories) {
    return this
        .find({ caseCategories })
        .select(CASE_PUBLIC_QUERY_FIELDS)
        .exec();
};

CaseSchema.statics.changeDescription = function (caseTitle, newDescription) {
    return this.updateOne(
        { caseTitle },
        { $set: { description: newDescription } },
        { upsert: false }
    ).exec();
};

CaseSchema.statics.editCategories = function (caseId, newCategories, vAuthUser) {
    return this.updateOne(
        { caseId },
        { $set: { caseCategories: newCategories, vAuthUser } },
        { upsert: false }
    ).exec();
};

CaseSchema.statics.saveCase = function (helpCase, vAuthUser) {
    // console.log('saveCase', helpCase);
    return Object.assign(helpCase, { vAuthUser }).save();
};

CaseSchema.statics.editCase = function (helpCase, vAuthUser) {
    return this.updateOne(
        {
            caseId: helpCase.caseId
        },
        { $set: { ...helpCase, vAuthUser } },
        { upsert: false }
    ).exec();
};

CaseSchema.statics.deleteCase = function (caseId, vAuthUser) {
    return this.updateOne(
        { caseId },
        { $set: { status: 0, vAuthUser } },
        { upsert: false }
    ).exec();
};

/**
 * Add Custom instance methods
 * =========================
 * Do not declare methods using ES6 arrow functions (=>)
 * rrow functions explicitly prevent binding this
 */

CaseSchema.methods.validateDescription = function (pwd) {
    return compareSync(pwd, this.description);
};

export const CaseModel = model('Case', CaseSchema);