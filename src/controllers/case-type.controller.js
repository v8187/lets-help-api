import { BaseController } from './BaseController';
import { CaseTypeModel } from '../models/case-type.model';
import { IncrementModel } from '../models/increment.model';
import { handleModelRes, getReqMetadata, sendResponse } from '../utils/handlers';

const FIELDS_CASE_TYPE = 'name';

const ctAddErr = (res, err = 'Server error') => {
    return sendResponse(res, {
        error: err,
        message: 'Something went wrong while creating new Case Type. Try again later.',
        type: 'INTERNAL_SERVER_ERROR'
    });
};

export class CaseTypeController extends BaseController {

    isExist(req, res) {
        handleModelRes(CaseTypeModel.isExist(req.params.name), res);
    }

    ctList(req, res) {
        handleModelRes(CaseTypeModel.list(), res);
    }

    async ctAdd(req, res, isRequest) {
        // const { name } = req.body;

        // CaseTypeModel.isExist(req.body).then(async $caseType => {
        //     if (!!$caseType) {
        //         return sendResponse(res, {
        //             error: 'Cannot create new Case Type',
        //             message: `Case Type already exist with Name "${name}".`,
        //             type: 'CONFLICT'
        //         });
        //     }

        const { body } = req;
        let newCaseType = new CaseTypeModel();

        (FIELDS_CASE_TYPE).split(',').map(field => {
            if (body[field] !== undefined) {
                newCaseType[field] = body[field];
            }
        });

        if (process.env.DB_FILL_MODE !== 'ON') {
            newCaseType.vAuthUser = getReqMetadata(req).userId;
        }

        const srNoRes = await IncrementModel.getSrNo(88);
        newCaseType.ctId = srNoRes.srNo;

        handleModelRes(
            newCaseType.save(),
            res, {
            success: 'Case Type created successfully.',
            error: 'Something went wrong while creating new Case Type. Try again later.',
            name: 'Case Type'
        });
        // }, modelErr => {
        //     console.error(modelErr);
        //     return ctAddErr(res, modelErr.message);
        // }).catch(modelReason => {
        //     console.log(modelReason);
        //     return ctAddErr(res, modelReason.message);
        // });
    }

    ctEdit(req, res) {
        const { body } = req;

        let tempData = {};

        (FIELDS_CASE_TYPE).split(',').map(field => {
            if (body[field] !== undefined) {
                tempData[field] = body[field];
            }
        });

        handleModelRes(
            CaseTypeModel.ctEdit(getReqMetadata(req).userId, body.ctId, tempData),
            res, {
            success: 'Case Type updated successfully.',
            error: 'Something went wrong while updating the Case Type. Try again later.',
            name: 'Case Type'
        });
    }

    tempAll(req, res) {
        handleModelRes(CaseTypeModel.tempAll(), res);
    }
}
