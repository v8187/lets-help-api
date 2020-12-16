import { BaseController } from './BaseController';
import { BloodGroupModel } from '../models/blood-group.model';
import { IncrementModel } from '../models/increment.model';
import { handleModelRes, getReqMetadata, sendResponse } from '../utils/handlers';

const FIELDS_BLOOD_GROUP = 'name';

const bgAddErr = (res, err = 'Server error') => {
    return sendResponse(res, {
        error: err,
        message: 'Something went wrong while creating new Blood Group. Try again later.',
        type: 'INTERNAL_SERVER_ERROR'
    });
};

export class BloodGroupController extends BaseController {

    isExist(req, res) {
        handleModelRes(BloodGroupModel.isExist(req.params.name), res);
    }

    bgList(req, res) {
        handleModelRes(BloodGroupModel.list(), res);
    }

    async bgAdd(req, res, isRequest) {
        // const { name } = req.body;

        // BloodGroupModel.isExist(req.body).then(async $bloodGroup => {
        //     if (!!$bloodGroup) {
        //         return sendResponse(res, {
        //             error: 'Cannot create new Blood Group',
        //             message: `Blood Group already exist with Name "${name}".`,
        //             type: 'CONFLICT'
        //         });
        //     }

        const { body } = req;
        let newBloodGroup = new BloodGroupModel();

        (FIELDS_BLOOD_GROUP).split(',').map(field => {
            if (body[field] !== undefined) {
                newBloodGroup[field] = body[field];
            }
        });

        if (process.env.DB_FILL_MODE !== 'ON') {
            newBloodGroup.vAuthUser = getReqMetadata(req).userId;
        }

        const srNoRes = await IncrementModel.getSrNo(88);
        newBloodGroup.bgId = srNoRes.srNo;

        handleModelRes(
            newBloodGroup.save(),
            res, {
            success: 'Blood Group created successfully.',
            error: 'Something went wrong while creating new Blood Group. Try again later.',
            name: 'Blood Group'
        });
        // }, modelErr => {
        //     console.error(modelErr);
        //     return bgAddErr(res, modelErr.message);
        // }).catch(modelReason => {
        //     console.log(modelReason);
        //     return bgAddErr(res, modelReason.message);
        // });
    }

    bgEdit(req, res) {
        const { body } = req;

        let tempData = {};

        (FIELDS_BLOOD_GROUP).split(',').map(field => {
            if (body[field] !== undefined) {
                tempData[field] = body[field];
            }
        });

        handleModelRes(
            BloodGroupModel.bgEdit(getReqMetadata(req).userId, body.bgId, tempData),
            res, {
            success: 'BloodGroup updated successfully.',
            error: 'Something went wrong while updating the Blood Group. Try again later.',
            name: 'Blood Group'
        });
    }

    tempAll(req, res) {
        handleModelRes(BloodGroupModel.tempAll(), res);
    }
}
