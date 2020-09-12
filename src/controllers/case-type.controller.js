import { BaseController } from './BaseController';
import { CaseTypeModel } from '../models/case-type.model';
import { handleModelRes, getReqMetadata, sendResponse } from '../utils/handlers';
import { FIELDS_CASE_TYPE } from '../configs/query-fields';

const createCaseTypeErr = (res, err = 'Server error') => {
    return sendResponse(res, {
        error: err,
        message: 'Something went wrong while creating new Case Type. Try again later.',
        type: 'INTERNAL_SERVER_ERROR'
    });
};

const reactCaseTypeErr = (res, err = 'Server error') => {
    return sendResponse(res, {
        error: err,
        message: 'Something went wrong while saving your reaction for Case Type. Try again later.',
        type: 'INTERNAL_SERVER_ERROR'
    });
};

export class CaseTypeController extends BaseController {

    caseTypeExists(req, res) {
        handleModelRes(CaseTypeModel.caseTypeExists(req.params.name), res);
    }

    caseTypesList(req, res) {
        handleModelRes(CaseTypeModel.list(), res, {
            onSuccess: data => parseResponseData(req, data)
        });
    }

    createCaseType(req, res, isRequest) {
        const { name } = req.body;

        CaseTypeModel.caseTypeExists(req.body).then($caseType => {
            if (!!$caseType) {
                return sendResponse(res, {
                    error: 'Cannot create new Case Type',
                    message: `Case Type already exist with Name "${name}".`,
                    type: 'CONFLICT'
                });
            }
            const user = getReqMetadata(req, 'user');

            const { body } = req;
            let newCaseType = new CaseTypeModel();

            (FIELDS_CASE_TYPE).split(',').map(field => {
                const data = body[field];
                if (data !== undefined) {
                    newCaseType[field] = data;
                }
            });

            newCaseType.vAuthUser = user.userId;

            handleModelRes(
                CaseTypeModel.saveCaseType(newCaseType),
                res, {
                success: 'Case Type created successfully.',
                error: 'Something went wrong while creating new Case Type. Try again later.',
                // onSuccess: data => {
                //     parseResponseData(req, data, true);
                // }
            });
        }, modelErr => {
            console.error(modelErr);
            return createCaseTypeErr(res, modelErr.message);
        }).catch(modelReason => {
            console.log(modelReason);
            return createCaseTypeErr(res, modelReason.message);
        });
    }

    editCaseType(req, res) {
        const user = getReqMetadata(req, 'user');
        const { body } = req;

        let tempData = {};

        (FIELDS_CASE_TYPE).split(',').map(field => {
            if (body[field] !== undefined) {
                tempData[field] = body[field];
            }
        });

        handleModelRes(
            CaseTypeModel.editCaseType(user.userId, body.caseTypeId, tempData),
            res, {
            success: 'Case Type updated successfully.',
            error: 'Something went wrong while updating the Case Type. Try again later.',
            // onSuccess: data => parseResponseData(req, data, true)
        });
    }

    tempAll(req, res) {
        handleModelRes(CaseTypeModel.tempAll(), res);
    }
}

const parseResponseData = (req, data, toObject = false) => {
    !Array.isArray(data) && (data = [data]);

    data = data.map(item => {
        item.toObject && (item = item.toObject());

        delete item.createdOn;
        delete item.createdBy;
        delete item.updatedOn;
        delete item.createdBy;
        delete item.createdById;
        delete item.updatedById;
        delete item._id;
        delete item.__v;

        return item;
    });

    data = toObject && Array.isArray(data) ? data[0] : data;

    return data;
};