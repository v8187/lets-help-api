import { BaseController } from './BaseController';
import { UserModel } from '../models/user.model';
import { handleModelRes, getReqMetadata, sendResponse } from '../utils/handlers';
import { CAN_VIEW_MEMBER_HIDDEN_DETAILS } from '../configs/permissions';
import { UserRoleModel } from '../models/user-role.model';

const FIELDS_PUT_DEVICE_INFO = 'deviceToken,deviceOS';
const FIELDS_PERSONAL = 'name,gender,dob,referredById,bgId,address,contactNo,alternateNo1,alternateNo2,city,state,country';
// const FIELDS_ACCOUNT = 'isVerified,roleIds,joinedOn';
const FIELDS_ACCOUNT = ',joinedOn,email';
// const FIELDS_OTHER_USER_EDIT = 'contactNo,alternateNo1,alternateNo2' + FIELDS_ACCOUNT;
// const FIELDS_MY_PROFILE_EDIT = FIELDS_PERSONAL + ',showEmail,showContactNos,showBloodGroup,showAddress,showContributions,showBirthday';
const FIELDS_USER = FIELDS_PERSONAL + FIELDS_ACCOUNT;

const addUserErr = (res, err = 'Server error') => {
    return sendResponse(res, {
        error: err,
        message: 'Something went wrong while creating new Profile. Try again later.',
        type: 'INTERNAL_SERVER_ERROR'
    });
};

const edit = (req, res, id) => {
    const { body } = req;

    const keys = Object.keys(body);
    const fields = FIELDS_USER.split(',');

    if (!keys.length || !keys.some(paramName => fields.indexOf(paramName) !== -1)) {
        return sendResponse(res, {
            error: 'Parameters missing/invalid',
            message: `Valid data is missing. Please provide at least one valid parameter to edit.`,
            type: 'BAD_REQUEST'
        });
    }

    const { userId } = getReqMetadata(req);

    let tempData = {};

    fields.map(field => {
        if (body[field] !== undefined) {
            tempData[field] = body[field];
        }
    });

    handleModelRes(
        UserModel.editUser(userId, id || userId, tempData),
        res, {
        success: 'User updated successfully.',
        ifNull: 'User does not exist with given userId.',
        error: 'Something went wrong while updating the User. Try again later.',
        onSuccess: data => parseResponseData(req, data, true)
    });
};

const mapRolesError = (res) => sendResponse(res, {
    error: 'Parameters missing/invalid',
    message: `Invalid Roles, it should be Array of integers`,
    type: 'BAD_REQUEST'
});

export class UserController extends BaseController {

    addUser(req, res) {
        const { email } = req.body;

        UserModel.hasAccount(req.body.email).then(user => {
            if (user) {
                return sendResponse(res, {
                    error: 'Cannot create new Profile',
                    message: `User already exist with "${email}".`,
                    type: 'CONFLICT'
                });
            }
            const { body } = req;
            let newUser = new UserModel();

            FIELDS_USER.split(',').map(field => {
                const data = body[field];
                if (data !== undefined) {
                    newUser[field] = Array.isArray(data) ? data.length ? data : newUser[field] : data;
                }
            });

            newUser.vAuthUser = getReqMetadata(req).userId;

            handleModelRes(
                newUser.save(),
                res, {
                success: 'Profile created successfully.',
                error: 'Something went wrong while creating new Profile. Try again later.',
                onSuccess: data => parseResponseData(req, data, true)
            });
        }, modelErr => {
            console.error(modelErr);
            return addUserErr(res, modelErr.message);
        }).catch(modelReason => {
            console.log(modelReason);
            return addUserErr(res, modelReason.message);
        });
    }

    editUser(req, res) {
        const { body } = req;

        const userId = body.userId;

        delete body.userId;

        if (!userId) {
            return sendResponse(res, {
                error: 'Parameters missing/invalid',
                message: `${'userId'} is missing.`,
                type: 'BAD_REQUEST'
            });
        }

        edit(req, res, userId);
    }

    userProfile(req, res) {
        handleModelRes(UserModel.userProfile(req.params.userId), res, {
            ifNull: 'User does not exist with given userId.',
            onSuccess: data => parseResponseData(req, data, true)
        });
    }

    usersList(req, res) {
        handleModelRes(UserModel.list(), res, {
            onSuccess: data => parseResponseData(req, data)
        });
    }

    mapRoles(req, res) {
        let roleIds;

        try {
            roleIds = JSON.parse(req.body.roles);
            if (!Array.isArray(roleIds) || !UserRoleModel.areValidIds(roleIds)) {
                return mapRolesError(res);
            }
        } catch (err) {
            return mapRolesError(res);
        }

        handleModelRes(
            UserModel.editUser(getReqMetadata(req).userId, req.body.userId, { roleIds }),
            res, {
            success: 'Roles mapped to User successfully.',
            ifNull: 'User does not exist with given userId.',
            error: 'Something went wrong while updating the User. Try again later.',
            onSuccess: data => parseResponseData(req, data, true)
        });
    }

    markVerified(req, res) {
        handleModelRes(
            UserModel.editUser(getReqMetadata(req).userId, req.body.userId, { isVerified: true }),
            res, {
            success: 'User is marked Verified successfully.',
            ifNull: 'User does not exist with given userId.',
            error: 'Something went wrong while updating the User. Try again later.',
            onSuccess: data => parseResponseData(req, data, true)
        });
    }

    editMyProfile(req, res) {
        edit(req, res);
    }

    hasAccount(req, res) {
        handleModelRes(UserModel.hasAccount(req.params.userInfo), res);
    }

    count(req, res) {
        handleModelRes(UserModel.count(), res);
    }

    ids(req, res) {
        handleModelRes(UserModel.keyProps(), res);
    }

    myProfile(req, res) {
        handleModelRes(UserModel.byUserId(getReqMetadata(req).userId), res, {
            onSuccess: data => parseResponseData(req, data, true)
        });
    }

    // editUserOld(req, res) {
    //     const { user } = getReqMetadata(req),
    //         isAdmin = user.roles.indexOf('admin') !== -1,
    //         isMyProfile = user.userId === req.body.userId;
    //     /**
    //      * If non-admin user try to update someone else's profile
    //      */
    //     if (!isAdmin && !isMyProfile) {
    //         return sendResponse(res, {
    //             error: 'Not Allowed',
    //             message: `You are not allowed to update someone else's profile.`,
    //             type: 'FORBIDDEN'
    //         });
    //     }

    //     const { body } = req;

    //     let tempData = {};

    //     if (isAdmin) {
    //         FIELDS_OTHER_USER_EDIT.split(',').map(field => {
    //             if (body[field] !== undefined) {
    //                 tempData[field] = body[field];
    //             }
    //         });
    //     }

    //     if (isMyProfile) {
    //         FIELDS_MY_PROFILE_EDIT.split(',').map(field => {
    //             if (body[field] !== undefined) {
    //                 tempData[field] = body[field];
    //             }
    //         });
    //     }

    //     handleModelRes(
    //         UserModel.editUser(user.userId, body.userId, tempData),
    //         res, {
    //         success: 'Profile updated successfully.',
    //         error: 'Something went wrong while updating the Profile. Try again later.',
    //         onSuccess: data => parseResponseData(req, data, true)
    //     });
    // }

    editDevice(req, res) {
        const { body } = req;

        let tempData = {};

        FIELDS_PUT_DEVICE_INFO.split(',').map(field => {
            if (body[field] !== undefined) {
                tempData[field] = body[field];
            }
        });

        handleModelRes(
            UserModel.setDevice(getReqMetadata(req).userId, tempData),
            res, {
            success: 'Device updated successfully.',
            error: 'Something went wrong while updating the User device. Try again later.',
            onSuccess: data => parseResponseData(req, data, true)
        });
    }

    byUserId(req, res) {
        handleModelRes(UserModel.byUserId(req.params.userId), res, {
            onSuccess: data => parseResponseData(req, data, true)
        });
    }

    deleteProfile(req, res) {
        // handleModelRes(UserModel.byUserId(req.params.userId), res);
    }

    tempAll(req, res) {
        handleModelRes(UserModel.tempAll(), res);
    }
}

const parseResponseData = (req, data, toObject = false) => {
    const { userId, permissionNames } = getReqMetadata(req),
        canViewPI = !!permissionNames && permissionNames.indexOf(CAN_VIEW_MEMBER_HIDDEN_DETAILS) !== -1;

    !Array.isArray(data) && (data = [data]);

    data = data.map(item => {
        item.toObject && (item = item.toObject());
        const isOwnProfile = userId === item.userId;

        if (!canViewPI && !isOwnProfile) {
            if (!item.showContactNos) {
                delete item.contactNo;
                delete item.alternateNo1;
                delete item.alternateNo2;
            }
            if (!item.showEmail) {
                delete item.email;
            }
            if (!item.showBloodGroup) {
                delete item.bloodGroup;
            }
            if (!item.showContributions) {
                delete item.contributions;
            }
            if (!item.showBirthday) {
                delete item.dob;
            }

            delete item.isVerified;

            delete item.createdOn;
            delete item.createdBy;
            delete item.updatedOn;
            delete item.createdBy;
        }
        if (!isOwnProfile) {
            delete item.showEmail;
            delete item.showContactNos;
            delete item.showBloodGroup;
            delete item.showAddress;
            delete item.showContributions;
            delete item.showBirthday;
        }

        delete item.createdById;
        delete item.updatedById;
        delete item.referredById;
        delete item._id;
        delete item.__v;
        delete item.userPin;
        delete item.roleIds;
        delete item.bgId;

        return item;
    });

    data = toObject && Array.isArray(data) ? data[0] : data;

    return data;
};