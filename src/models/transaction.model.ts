import { Schema, model } from 'mongoose';

import {
    BaseSchema, commonShemaOptions, defineCommonVirtuals, IBaseDocument, IBaseModel
} from './BaseSchema';
import { CASE_KEY_FIELDS, USER_KEY_FIELDS } from '../configs/query-fields';
import { transTypes, transModes } from '../configs/enum-constants';
import { UserModel } from './user.model';

interface ITransactionDoc extends ITransaction, IBaseDocument { };

interface ITransactionModel extends IBaseModel<ITransactionDoc> {
    advanceSearch(filters: ITransactionSearch): any;
    statistics(): any;
    transDetails(transId: string): any;
    byId(transId: string): any;
    transEdit(vAuthUser: string, transId: string, data: ITransaction): any;
    countDocs(): any;
};

const BankDetailsSchema = new Schema({
    accountName: { type: String, required: true },
    accountNo: { type: String, required: true },
    bankName: { type: String, required: true }
});

const UPIDetailsSchema = new Schema({
    upiName: { type: String, required: true },
    upiId: { type: String, required: true }
});

const EWalletDetailsSchema = new Schema({
    ewalletName: { type: String, required: true },
    ewalletNo: { type: String, required: true }
});

const TransactionSchema = new BaseSchema({
    transId: { type: String, trim: true },
    transType: { type: String, enum: transTypes, required: true, lowercase: true },
    amount: { type: Number, required: true },
    forMonth: { type: Number, min: 1, max: 12, default: (new Date().getMonth() + 1) },
    forYear: { type: Number, min: 2012, max: 2100, default: (new Date().getFullYear()) },
    transDate: { type: Date, default: new Date() },
    forCaseId: { type: String, required: function () { return (this as ITransaction).transType === 'd'; } },
    fromUserId: { type: String, required: function () { return !(this as ITransaction).forCaseId || (this as ITransaction).transType === 'c'; } },
    transMode: { type: String, default: 'cash', enum: transModes },
    bankDetails: {
        required: function () { return (this as ITransaction).transType === 'd' && (this as ITransaction).transMode === 'bank-transfer'; },
        type: BankDetailsSchema
    },
    upiDetails: {
        required: function () { return (this as ITransaction).transType === 'd' && (this as ITransaction).transMode === 'upi'; },
        type: UPIDetailsSchema
    },
    ewalletDetails: {
        required: function () { return (this as ITransaction).transType === 'd' && (this as ITransaction).transMode === 'ewallet'; },
        type: EWalletDetailsSchema
    },
    spentById: { type: String, required: function () { return (this as ITransaction).transType === 'd'; } },
    remarks: { type: String, required: function () { return (this as ITransaction).transType === 'd'; }, trim: true },
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
TransactionSchema.virtual('spentBy', {
    ref: 'User',
    localField: 'spentById',
    foreignField: 'userId',
    justOne: true
});
TransactionSchema.virtual('forCase', {
    ref: 'Case',
    localField: 'forCaseId',
    foreignField: 'caseId',
    justOne: true
});
TransactionSchema.virtual('fromUser', {
    ref: 'User',
    localField: 'fromUserId',
    foreignField: 'userId',
    justOne: true
});

// Transaction Schema's save pre hook
TransactionSchema.pre('save', async function (next) {
    let $trans: any = this;

    $trans.transId = $trans._id;

    if (!$trans.spentById) {
        const defaultId: any = await UserModel.findOne({ email: 'gurinder1god@gmail.com' }).select('userId').exec();
        $trans.spentById = defaultId ? defaultId.userId : '';
    }

    next();
});

TransactionSchema.post('save', async function ($trans, next) {

    await $trans.
        populate('createdBy', USER_KEY_FIELDS)
        .populate('updatedBy', USER_KEY_FIELDS)
        .populate('spentBy', USER_KEY_FIELDS)
        .populate('forCase', CASE_KEY_FIELDS)
        .populate('fromUser', USER_KEY_FIELDS)
        .execPopulate();

    next();
});
/*
 * Add Custom static methods
 * =========================
 * 
 * Do not declare methods using ES6 arrow functions (=>). 
 * Arrow functions explicitly prevent binding this
 */
TransactionSchema.statics.advanceSearch = function (filters: ITransactionSearch) {
    let queries = [];
    filters.transType && filters.transType.length && queries.push({ transType: { $in: filters.transType } });
    filters.forCase && filters.forCase.length && queries.push({ forCaseId: { $in: filters.forCase } });
    filters.fromUser && filters.fromUser.length && queries.push({ fromUserId: { $in: filters.fromUser } });
    filters.transMode && filters.transMode.length && queries.push({ transMode: { $in: filters.transMode } });
    filters.spentBy && filters.spentBy.length && queries.push({ spentById: { $in: filters.spentBy } });
    if (filters.minAmount || filters.maxAmount) {
        let amount: any = filters.minAmount ? { $gte: parseFloat(filters.minAmount) } : {};
        amount = filters.maxAmount ? { ...amount, $lte: parseFloat(filters.maxAmount) } : amount;
        queries.push({ amount });
    }
    if (filters.fromDate || filters.toDate) {
        let transDate: any = filters.fromDate ? { $gte: new Date(filters.fromDate) } : {};
        transDate = filters.toDate ? { ...transDate, $lte: new Date(filters.toDate) } : transDate;
        queries.push({ transDate });
    }

    return this.find(queries.length ? { $and: queries } : {})
        .populate('forCase', CASE_KEY_FIELDS)
        .populate('fromUser', USER_KEY_FIELDS)
        .select('transId transType amount transDate forCaseId fromUserId -_id')
        .sort({ 'transDate': -1 }).exec();
};
// 
TransactionSchema.statics.statistics = function () {

    return this.aggregate([
        { $project: { transType: 1, amount: 1, transDate: 1, _id: 0 } },
        {
            $group: {
                _id: { transType: '$transType', year: { $year: '$transDate' }, month: { $month: '$transDate' } },
                totalAmount: { $sum: '$amount' }
            },
        },
        { $project: { transType: '$_id.transType', year: '$_id.year', month: '$_id.month', totalAmount: 1 } },
        { $sort: { year: -1, month: -1 } },
    ]).exec();
};

TransactionSchema.statics.list = function () {
    return this.find()
        .populate('forCase', CASE_KEY_FIELDS)
        .populate('fromUser', USER_KEY_FIELDS)
        .select('transId transType amount transDate forCaseId fromUserId -_id')
        .sort({ 'transDate': -1 }).exec();
};

TransactionSchema.statics.transDetails = function (transId: string) {
    return this
        .findOne({ transId })
        .populate('createdBy', USER_KEY_FIELDS)
        .populate('updatedBy', USER_KEY_FIELDS)
        .populate('spentBy', USER_KEY_FIELDS)
        .populate('forCase', CASE_KEY_FIELDS)
        .populate('fromUser', USER_KEY_FIELDS)
        .select('-_id -__v -status').exec();
};

TransactionSchema.statics.byId = function (transId: string) {
    return this
        .findOne({ transId })
        .select('-_id -__v -status')
        .exec();
};

TransactionSchema.statics.tempAll = function () {
    return this.find()
        .populate('createdBy', USER_KEY_FIELDS)
        .populate('updatedBy', USER_KEY_FIELDS)
        .populate('spentBy', USER_KEY_FIELDS)
        .populate('forCase', CASE_KEY_FIELDS)
        .populate('fromUser', USER_KEY_FIELDS)
        .select().exec();
};

TransactionSchema.statics.transEdit = function (vAuthUser: string, transId: string, data: ITransaction) {
    return this.findOneAndUpdate(
        { transId },
        { $set: { ...data, vAuthUser } },
        { upsert: false, new: true }
    )
        .populate('createdBy', USER_KEY_FIELDS)
        .populate('updatedBy', USER_KEY_FIELDS)
        .populate('spentBy', USER_KEY_FIELDS)
        .populate('forCase', CASE_KEY_FIELDS)
        .populate('fromUser', USER_KEY_FIELDS)
        .select('-_id -__v -status').exec();
};

export const TransactionModel = model<ITransactionDoc, ITransactionModel>('Transaction', TransactionSchema);