import { Schema, model } from 'mongoose';

import {
    BaseSchema, commonShemaOptions, defineCommonVirtuals
} from './BaseSchema';
import { CASE_KEY_FIELDS, USER_KEY_FIELDS } from '../configs/query-fields';
import { transTypes } from '../configs/enum-constants';
import { UserModel } from './user.model';

const TransactionSchema = new BaseSchema({
    transId: { type: String, trim: true },
    transType: { type: Schema.Types.EnumArray, enum: transTypes },
    amount: { type: Number, required: true },
    forMonth: { type: Number, min: 1, max: 12, required: true },
    forYear: { type: Number, min: 2012, max: 2100, required: true },
    transDate: { type: Date, default: new Date() },
    forCaseId: { type: String, required: true },
    fromUserId: { type: String, required: true },
    spentById: { type: String, required: true },
    remarks: { type: String, required: true },
},
    {
        collection: 'Transaction',
        ...commonShemaOptions((doc, ret, options) => {
            return ret;
        })
    }
);

defineCommonVirtuals(TransactionSchema);

// Transaction Schema's virtual fields
TransactionSchema.virtual('referredBy', {
    ref: 'User',
    localField: 'referredById',
    foreignField: 'userId',
    justOne: true
});

// Transaction Schema's save pre hook
TransactionSchema.pre('save', async function (next) {
    let $trans = this;

    $trans.transId = $trans._id;

    // $trans.createdById = $trans.updatedById = $trans.vAuthUser;
    // delete $trans.vAuthUser;

    if (!$trans.referredById) {
        const defaultReferrer = await UserModel.findOne({ email: 'gurinder1god@gmail.com' }).select('userId').exec();
        $trans.referredById = defaultReferrer ? defaultReferrer.userId : '';
    }

    next();
});

TransactionSchema.post('save', async function ($trans, next) {

    const populatedTransaction = await $trans.
        populate('createdBy', USER_KEY_FIELDS)
        .populate('updatedBy', USER_KEY_FIELDS)
        .populate('referredBy', USER_KEY_FIELDS)
        .execPopulate();

    next();
});

// TransactionSchema.pre('updateOne', function (next) {
//     next();
// });

/*
 * Add Custom static methods
 * =========================
 * 
 * Do not declare methods using ES6 arrow functions (=>). 
 * Arrow functions explicitly prevent binding this
 */
// TransactionSchema.statics.list = function () {
//     return this
//         .aggregate([{ $match: {} }])
//         .project({ transId: 1, name: 1, title: 1, isApproved: 1, isClosed: 1, upVoters: 1, downVoters: 1, _id: 0 })
//         .sort('title')
//         .exec();
// };

TransactionSchema.statics.listForAdmin = function () {
    return this
        .aggregate([{ $match: {} }])
        .project({
            transId: 1, name: 1, title: 1, isApproved: 1, isClosed: 1,
            upVoters: 1, downVoters: 1, contactNo: 1, alternateNo1: 1, alternateNo2: 1, _id: 0
        })
        .sort('title')
        .exec();
};

// TransactionSchema.statics.transDetails = function (transId) {
//     return this
//         .aggregate([
//             { $match: { transId } },
//             { $limit: 1 },
//             ...lookupUserFields('referredById', 'referredBy'),
//         ])
//         .project({
//             transId: 1, title: 1, description: 1, name: 1, transTypes: 1,
//             contactRelation: 1, contactPerson: 1, gender: 1, age: 1,
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

TransactionSchema.statics.transDetailsForAdmin = function (transId) {
    return this
        .findOne({ transId })
        .populate('createdBy', USER_KEY_FIELDS)
        .populate('updatedBy', USER_KEY_FIELDS)
        .populate('referredBy', USER_KEY_FIELDS)
        .select('-_id -__v').exec();
};

TransactionSchema.statics.byTransactionId = function (transId) {
    return this
        .findOne({ transId })
        .populate('createdBy', USER_KEY_FIELDS)
        .populate('updatedBy', USER_KEY_FIELDS)
        .populate('referredBy', USER_KEY_FIELDS)
        .select('-_id -__v').exec();
};

TransactionSchema.statics.byId = function (transId) {
    return this
        .findOne({ transId })
        .select('-_id')
        .exec();
};

TransactionSchema.statics.tempAll = function () {
    return this.find()
        .populate('createdBy', USER_KEY_FIELDS)
        .populate('updatedBy', USER_KEY_FIELDS)
        .populate('referredBy', USER_KEY_FIELDS)
        .select().exec();
};

TransactionSchema.statics.count = function () {
    return this.countDocuments();
};

TransactionSchema.statics.keyProps = function () {
    return this.find().select(CASE_KEY_FIELDS).sort('title').exec();
};

TransactionSchema.statics.transExists = function (transInfo) {
    return this
        .findOne({
            $and: [
                { contactNo: transInfo.contactNo },
                { title: transInfo.title }
            ]
        })
        .exec();
};

TransactionSchema.statics.editTransaction = function (vAuthUser, transId, data) {
    return this.findOneAndUpdate(
        { transId },
        { $set: { ...data, vAuthUser } },
        { upsert: false, new: true, }
    )
        .populate('createdBy', USER_KEY_FIELDS)
        .populate('updatedBy', USER_KEY_FIELDS)
        .populate('referredBy', USER_KEY_FIELDS)
        .select('-_id -__v').exec();
};

TransactionSchema.statics.toggleReaction = function (transId, data) {
    return this.findOneAndUpdate(
        { transId },
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
        .select('-_id -__v').exec();
};

TransactionSchema.statics.saveTransaction = function ($trans) {
    // console.log('saveTransaction', $trans);
    return $trans.save();
};

/**
 * Add Custom instance methods
 * =========================
 * Do not declare methods using ES6 arrow functions (=>)
 * rrow functions explicitly prevent binding this
 */
// TransactionSchema.methods.validateTransactionPin = function (pwd) {
//     return compareSync(pwd, this.transPin);
// };

// TransactionSchema.methods.tokenFields = function () {
//     return {
//         transId: this.transId,
//         email: this.email,
//         // groups: [...this.groups],
//         roles: [...this.roles]
//     };
// };

export const TransactionModel = model('Transaction', TransactionSchema);
