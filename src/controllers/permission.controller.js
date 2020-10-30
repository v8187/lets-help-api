import { BaseController } from './BaseController';
import { PermissionModel } from '../models/permission.model';
import { IncrementModel } from '../models/increment.model';
import { handleModelRes, getReqMetadata, sendResponse } from '../utils/handlers';

const FIELDS_PERMISSION = 'name';

const createPermissionErr = (res, err = 'Server error') => {
    return sendResponse(res, {
        error: err,
        message: 'Something went wrong while creating new Permission. Try again later.',
        type: 'INTERNAL_SERVER_ERROR'
    });
};

export class PermissionController extends BaseController {

    permissionsList(req, res) {
        handleModelRes(PermissionModel.list(), res);
    }

    createPermission(req, res, isRequest) {
        const { name } = req.body;

        (async () => {
            const { body } = req;
            let newPermission = new PermissionModel();

            (FIELDS_PERMISSION).split(',').map(field => {
                const data = body[field];
                if (data !== undefined) {
                    newPermission[field] = data;
                }
            });

            if (process.env.DB_FILL_MODE !== 'ON') {
                const user = getReqMetadata(req, 'user');
                newPermission.vAuthUser = user.userId;
            }

            const srNoRes = await IncrementModel.getSrNo(88);
            newPermission.permId = srNoRes.srNo;

            handleModelRes(
                newPermission.save(),
                res, {
                success: 'Permission created successfully.',
                error: 'Something went wrong while creating new Permission. Try again later.',
            });
        })();
    }

    editPermission(req, res) {
        const user = getReqMetadata(req, 'user');
        const { body } = req;

        let tempData = {};

        (FIELDS_PERMISSION).split(',').map(field => {
            if (body[field] !== undefined) {
                tempData[field] = body[field];
            }
        });

        handleModelRes(
            PermissionModel.editPermission(user.userId, body.permId, tempData),
            res, {
            success: 'Permission updated successfully.',
            error: 'Something went wrong while updating the Permission. Try again later.',
        });
    }

    tempAll(req, res) {
        handleModelRes(PermissionModel.tempAll(), res);
    }
}
