import { BaseController } from './BaseController';
import { UserRoleModel } from '../models/user-role.model';
import { handleModelRes, getReqMetadata, sendResponse } from '../utils/handlers';
import { FIELDS_USER_ROLE } from '../configs/query-fields';
import { sendNotification } from '../firebase-sdk';
import { userRoles } from '../configs/enum-constants';

const createUserRoleErr = (res, err = 'Server error') => {
    return sendResponse(res, {
        error: err,
        message: 'Something went wrong while creating new User Role. Try again later.',
        type: 'INTERNAL_SERVER_ERROR'
    });
};

const reactUserRoleErr = (res, err = 'Server error') => {
    return sendResponse(res, {
        error: err,
        message: 'Something went wrong while saving your reaction for User Role. Try again later.',
        type: 'INTERNAL_SERVER_ERROR'
    });
};

export class UserRoleController extends BaseController {

    userRoleExists(req, res) {
        handleModelRes(UserRoleModel.userRoleExists(req.params.userInfo), res);
    }

    count(req, res) {
        handleModelRes(UserRoleModel.count(), res);
    }

    ids(req, res) {
        handleModelRes(UserRoleModel.keyProps(), res);
    }

    userRolesList(req, res) {
        handleModelRes(UserRoleModel.list(), res, {
            onSuccess: data => parseResponseData(req, data)
        });
    }

    createUserRole(req, res, isRequest) {
        const { name } = req.body;

        UserRoleModel.userRoleExists(req.body).then($userRole => {
            if (!!$userRole) {
                return sendResponse(res, {
                    error: 'Cannot create new User Role',
                    message: `User Role already exist with Name "${name}".`,
                    type: 'CONFLICT'
                });
            }
            const user = getReqMetadata(req, 'user');

            const { body } = req;
            let newUserRole = new UserRoleModel();

            (FIELDS_USER_ROLE).split(',').map(field => {
                const data = body[field];
                if (data !== undefined) {
                    newUserRole[field] = data;
                }
            });

            newUserRole.vAuthUser = user.userId;

            handleModelRes(
                UserRoleModel.saveUserRole(newUserRole),
                res, {
                success: 'User Role created successfully.',
                error: 'Something went wrong while creating new User Role. Try again later.',
                onSuccess: data => {
                    parseResponseData(req, data, true);
                }
            });
        }, modelErr => {
            console.error(modelErr);
            return createUserRoleErr(res, modelErr.message);
        }).catch(modelReason => {
            console.log(modelReason);
            return createUserRoleErr(res, modelReason.message);
        });
    }

    editUserRole(req, res) {
        const user = getReqMetadata(req, 'user');
        const { body } = req;

        let tempData = {};

        (FIELDS_USER_ROLE).split(',').map(field => {
            if (body[field] !== undefined) {
                tempData[field] = body[field];
            }
        });

        handleModelRes(
            UserRoleModel.editUserRole(user.userId, body.userRoleId, tempData),
            res, {
            success: 'User Role updated successfully.',
            error: 'Something went wrong while updating the User Role. Try again later.',
            onSuccess: data => parseResponseData(req, data, true)
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
        delete item.referredById;
        delete item._id;
        delete item.__v;

        return item;
    });

    data = toObject && Array.isArray(data) ? data[0] : data;

    return data;
};