import { BaseController } from './BaseController';
import { TransactionModel } from '../models/transaction.model';
import { handleModelRes, getReqMetadata, sendResponse } from '../utils/handlers';
import { sendNotification } from '../firebase-sdk';
import { userRoles } from '../configs/enum-constants';

const FIELDS_TRANSACTION_AD_SEARCH = 'transType,minAmount,maxAmount,fromDate,toDate,forCase,fromUser,transMode,spentBy';
export const FIELDS_TRANSACTION_REQUIRED = 'transType,amount,forMonth,forYear,transDate,remarks';
export const FIELDS_TRANSACTION_ADD_UPDATE = FIELDS_TRANSACTION_REQUIRED + ',forCaseId,spentById,fromUserId,transMode,bankDetails,upiDetails,ewalletDetails';

const addTransErr = (res, err = 'Server error') => {
    return sendResponse(res, {
        error: err,
        message: 'Something went wrong while adding a new Transaction. Try again later.',
        type: 'INTERNAL_SERVER_ERROR'
    });
};

export class TransactionController extends BaseController {

    findTransaction(req, res) {
        const user = getReqMetadata(req, 'user');
        const { body } = req;

        let tempData = {};

        FIELDS_TRANSACTION_AD_SEARCH.split(',').map(field => {
            if (body[field] !== undefined) {
                tempData[field] = body[field];
            }
        });

        handleModelRes(
            TransactionModel.advanceSearch(tempData),
            res, {
            success: 'Transaction Search successfully done.',
            error: 'Something went wrong while searching Transactions. Try again later.',
            onSuccess: data => parseResponseData(req, data)
        });
    }

    transStats(req, res) {
        const { body } = req;

        let tempData = {};

        handleModelRes(
            TransactionModel.statistics(tempData),
            res, {
            success: 'Transaction Stats fetched successfully.',
            error: 'Something went wrong while getting Transactions\'s stats. Try again later.',
            onSuccess: data => parseTransStats(req, data)
        });
    }

    transactionsList(req, res) {
        handleModelRes(TransactionModel.list(), res, {
            onSuccess: data => parseResponseData(req, data)
        });
    }

    transDetails(req, res) {
        handleModelRes(TransactionModel.transDetails(req.params.transId), res, {
            onSuccess: data => parseResponseData(req, data, true)
        });
    }

    createTransaction(req, res) {
        const user = getReqMetadata(req, 'user');

        const { body } = req;
        let newTrans = new TransactionModel();

        FIELDS_TRANSACTION_ADD_UPDATE.split(',').map(field => {
            const data = body[field];
            if (data !== undefined) {
                newTrans[field] = Array.isArray(data) ? data.length ? data : newTrans[field] : data;
            }
        });

        newTrans.vAuthUser = user.userId;

        handleModelRes(
            TransactionModel.saveTransaction(newTrans),
            res, {
            success: 'Transaction added successfully.',
            error: 'Something went wrong while adding a new Transaction. Try again later.',
            onSuccess: data => {
                parseResponseData(req, data, true);
                data.transType === 'd' && sendNotification({
                    data: {
                        transId: data.transId,
                    },
                    notification: {
                        title: 'New Transaction',
                        body: `${data.amount} spent for Case Id ${data.forCaseId}. Click for details.`
                    }
                }, [...userRoles]);
            }
        });
    }

    editTransaction(req, res) {
        const user = getReqMetadata(req, 'user');
        const { body } = req;

        let tempData = {};

        FIELDS_TRANSACTION_ADD_UPDATE.split(',').map(field => {
            if (body[field] !== undefined) {
                tempData[field] = body[field];
            }
        });

        handleModelRes(
            TransactionModel.editTransaction(user.userId, body.transId, tempData),
            res, {
            success: 'Transaction updated successfully.',
            error: 'Something went wrong while updating the Transaction. Try again later.',
            onSuccess: data => parseResponseData(req, data, true)
        });
    }

    tempAll(req, res) {
        handleModelRes(TransactionModel.tempAll(), res);
    }
}

const parseResponseData = (req, data, toObject = false) => {
    const user = getReqMetadata(req, 'user'),
        isAdmin = user.roles.indexOf('admin') !== -1;

    !Array.isArray(data) && (data = [data]);

    data = data.map(item => {
        item.toObject && (item = item.toObject());

        if (!isAdmin) {
            delete item.createdOn;
            delete item.createdBy;
            delete item.updatedOn;
            delete item.createdBy;
        }

        delete item.createdById;
        delete item.updatedById;
        delete item.forCaseId;
        delete item.fromUserId;
        delete item.spentById;
        delete item._id;
        delete item.__v;

        return item;
    });

    data = toObject && Array.isArray(data) ? data[0] : data;

    return data;
};

const parseTransStats = (req, data) => {
    let monthWise = { c: {}, d: {} },
        yearWise = { c: {}, d: {} },
        tillDate = { c: 0, d: 0 };

    data.map(item => {
        monthWise[item.transType][`${item.year}-${item.month}`] = item.totalAmount;
        yearWise[item.transType][`${item.year}`] = yearWise[item.transType][`${item.year}`] ? yearWise[item.transType][`${item.year}`] + item.totalAmount : item.totalAmount;
        tillDate[item.transType] += item.totalAmount;
    });

    return { monthWise, yearWise, tillDate };
}