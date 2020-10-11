import { BaseController } from './BaseController';
import { BloodGroupModel } from '../models/blood-group.model';
import { IncrementModel } from '../models/increment.model';
import { handleModelRes, getReqMetadata, sendResponse } from '../utils/handlers';
import { FIELDS_BLOOD_GROUP } from '../configs/query-fields';

const createBloodGroupErr = (res, err = 'Server error') => {
    return sendResponse(res, {
        error: err,
        message: 'Something went wrong while creating new Blood Group. Try again later.',
        type: 'INTERNAL_SERVER_ERROR'
    });
};

export class BloodGroupController extends BaseController {

    bloodGroupExists(req, res) {
        handleModelRes(BloodGroupModel.bloodGroupExists(req.params.name), res);
    }

    bloodGroupsList(req, res) {
        handleModelRes(BloodGroupModel.list(), res);
    }

    createBloodGroup(req, res, isRequest) {
        const { name } = req.body;

        BloodGroupModel.bloodGroupExists(req.body).then(async $bloodGroup => {
            if (!!$bloodGroup) {
                return sendResponse(res, {
                    error: 'Cannot create new Blood Group',
                    message: `Blood Group already exist with Name "${name}".`,
                    type: 'CONFLICT'
                });
            }

            const { body } = req;
            let newBloodGroup = new BloodGroupModel();

            (FIELDS_BLOOD_GROUP).split(',').map(field => {
                const data = body[field];
                if (data !== undefined) {
                    newBloodGroup[field] = data;
                }
            });

            if (process.env.DB_MODE !== 'ON') {
                const user = getReqMetadata(req, 'user');
                newBloodGroup.vAuthUser = user.userId;
            }

            const srNoRes = await IncrementModel.getSrNo(88);
            newBloodGroup.bgId = srNoRes.srNo;

            handleModelRes(
                BloodGroupModel.saveBloodGroup(newBloodGroup),
                res, {
                success: 'Blood Group created successfully.',
                error: 'Something went wrong while creating new Blood Group. Try again later.',
            });
        }, modelErr => {
            console.error(modelErr);
            return createBloodGroupErr(res, modelErr.message);
        }).catch(modelReason => {
            console.log(modelReason);
            return createBloodGroupErr(res, modelReason.message);
        });
    }

    editBloodGroup(req, res) {
        const user = getReqMetadata(req, 'user');
        const { body } = req;

        let tempData = {};

        (FIELDS_BLOOD_GROUP).split(',').map(field => {
            if (body[field] !== undefined) {
                tempData[field] = body[field];
            }
        });

        handleModelRes(
            BloodGroupModel.editBloodGroup(user.userId, body.bgId, tempData),
            res, {
            success: 'BloodGroup updated successfully.',
            error: 'Something went wrong while updating the Blood Group. Try again later.',
        });
    }

    tempAll(req, res) {
        handleModelRes(BloodGroupModel.tempAll(), res);
    }
}
