import { BaseController } from './BaseController';
import { TransactionModel } from '../models/transaction.model';
import { handleModelRes, getReqMetadata, sendResponse } from '../utils/handlers';
import { FIELDS_TRANSACTION_ADD_UPDATE } from '../configs/query-fields';

const addTransErr = (res, err = 'Server error') => {
    return sendResponse(res, {
        error: err,
        message: 'Something went wrong while adding a new Transaction. Try again later.',
        type: 'INTERNAL_SERVER_ERROR'
    });
};

export class TransactionController extends BaseController {

    // transExists(req, res) {
    //     handleModelRes(TransactionModel.transExists(req.params.userInfo), res);
    // }

    // count(req, res) {
    //     handleModelRes(TransactionModel.count(), res);
    // }

    // ids(req, res) {
    //     handleModelRes(TransactionModel.keyProps(), res);
    // }

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
            onSuccess: data => parseResponseData(req, data, true)
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