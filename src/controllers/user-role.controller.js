import { BaseController } from './BaseController';
import { UserRoleModel } from '../models/user-role.model';
import { IncrementModel } from '../models/increment.model';
import { handleModelRes, getReqMetadata, sendResponse } from '../utils/handlers';

const FIELDS_USER_ROLE = 'name,permIds';

const urAddErr = (res, err = 'Server error') => {
    return sendResponse(res, {
        error: err,
        message: 'Something went wrong while creating new User Role. Try again later.',
        type: 'INTERNAL_SERVER_ERROR'
    });
};

export class UserRoleController extends BaseController {

    isExist(req, res) {
        handleModelRes(UserRoleModel.isExist(req.params.name), res);
    }

    urList(req, res) {
        handleModelRes(UserRoleModel.list(), res, {
            onSuccess: data => parseResponseData(req, data)
        });
    }

    urAdd(req, res, isRequest) {
        const { name } = req.body;

        UserRoleModel.isExist(req.body).then(async $userRole => {
            if (!!$userRole) {
                return sendResponse(res, {
                    error: 'Cannot create new User Role',
                    message: `User Role already exist with Name "${name}".`,
                    type: 'CONFLICT'
                });
            }

            const { body } = req;
            let newUserRole = new UserRoleModel();

            (FIELDS_USER_ROLE).split(',').map(field => {
                if (body[field] !== undefined) {
                    newUserRole[field] = body[field];
                }
            });

            if (process.env.DB_FILL_MODE !== 'ON') {
                newUserRole.vAuthUser = getReqMetadata(req).userId;
            }

            const srNoRes = await IncrementModel.getSrNo(88);
            newUserRole.urId = srNoRes.srNo;

            handleModelRes(
                newUserRole.save(),
                res, {
                success: 'User Role created successfully.',
                error: 'Something went wrong while creating new User Role. Try again later.',
            });
        }, modelErr => {
            console.error(modelErr);
            return urAddErr(res, modelErr.message);
        }).catch(modelReason => {
            console.log(modelReason);
            return urAddErr(res, modelReason.message);
        });
    }

    urEdit(req, res) {
        const { body } = req;

        let tempData = {};

        (FIELDS_USER_ROLE).split(',').map(field => {
            if (body[field] !== undefined) {
                tempData[field] = body[field];
            }
        });

        handleModelRes(
            UserRoleModel.urEdit(getReqMetadata(req).userId, body.urId, tempData),
            res, {
            success: 'User Role updated successfully.',
            error: 'Something went wrong while updating the User Role. Try again later.',
        });
    }

    tempAll(req, res) {
        handleModelRes(UserRoleModel.tempAll(), res);
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
        // delete item.permIds;

        return item;
    });

    data = toObject && Array.isArray(data) ? data[0] : data;

    return data;
};
