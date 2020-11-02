import { BaseController } from './BaseController';
import { UserModel } from '../models/user.model';
import { handleModelRes, getReqMetadata, sendResponse } from '../utils/handlers';

const FIELDS_PUT_DEVICE_INFO = 'deviceToken,deviceOS';
const FIELDS_PERSONAL = 'name,gender,dob,bgId,address,contactNo,alternateNo1,alternateNo2,city,state,country';
const FIELDS_ACCOUNT = 'isVerified,roleIds,referredById,joinedOn';
const FIELDS_OTHER_USER_EDIT = FIELDS_ACCOUNT + ',contactNo,alternateNo1,alternateNo2';
const FIELDS_MY_PROFILE_EDIT = FIELDS_PERSONAL + ',showEmail,showContactNos,showBloodGroup,showAddress,showContributions,showBirthday';
const FIELDS_PROFILE_CREATE = FIELDS_PERSONAL + FIELDS_ACCOUNT + ',email';

const createProfileErr = (res, err = 'Server error') => {
    return sendResponse(res, {
        error: err,
        message: 'Something went wrong while creating new Profile. Try again later.',
        type: 'INTERNAL_SERVER_ERROR'
    });
};

export class UserController extends BaseController {

    hasAccount(req, res) {
        handleModelRes(UserModel.hasAccount(req.params.userInfo), res);
    }

    count(req, res) {
        handleModelRes(UserModel.count(), res);
    }

    ids(req, res) {
        handleModelRes(UserModel.keyProps(), res);
    }

    usersList(req, res) {
        handleModelRes(UserModel.list(), res, {
            onSuccess: data => parseResponseData(req, data)
        });
    }

    userProfile(req, res) {
        handleModelRes(UserModel.userProfile(req.params.userId), res, {
            onSuccess: data => parseResponseData(req, data, true)
        });
    }

    myProfile(req, res) {
        handleModelRes(UserModel.byUserId(getReqMetadata(req, 'user').userId), res, {
            onSuccess: data => parseResponseData(req, data, true)
        });
    }

    createProfile(req, res) {
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

            FIELDS_PROFILE_CREATE.split(',').map(field => {
                const data = body[field];
                if (data !== undefined) {
                    newUser[field] = Array.isArray(data) ? data.length ? data : newUser[field] : data;
                }
            });

            newUser.vAuthUser = getReqMetadata(req, 'user').userId;

            handleModelRes(
                newUser.save(),
                res, {
                success: 'Profile created successfully.',
                error: 'Something went wrong while creating new Profile. Try again later.',
                onSuccess: data => parseResponseData(req, data, true)
            });
        }, modelErr => {
            console.error(modelErr);
            return createProfileErr(res, modelErr.message);
        }).catch(modelReason => {
            console.log(modelReason);
            return createProfileErr(res, modelReason.message);
        });
    }

    editProfile(req, res) {
        const user = getReqMetadata(req, 'user'),
            isAdmin = user.roles.indexOf('admin') !== -1,
            isMyProfile = user.userId === req.body.userId;
        /**
         * If non-admin user try to update someone else's profile
         */
        if (!isAdmin && !isMyProfile) {
            return sendResponse(res, {
                error: 'Not Allowed',
                message: `You are not allowed to update someone else's profile.`,
                type: 'FORBIDDEN'
            });
        }

        const { body } = req;

        let tempData = {};

        if (isAdmin) {
            FIELDS_OTHER_USER_EDIT.split(',').map(field => {
                if (body[field] !== undefined) {
                    tempData[field] = body[field];
                }
            });
        }

        if (isMyProfile) {
            FIELDS_MY_PROFILE_EDIT.split(',').map(field => {
                if (body[field] !== undefined) {
                    tempData[field] = body[field];
                }
            });
        }

        handleModelRes(
            UserModel.editProfile(user.userId, body.userId, tempData),
            res, {
            success: 'Profile updated successfully.',
            error: 'Something went wrong while updating the Profile. Try again later.',
            onSuccess: data => parseResponseData(req, data, true)
        });
    }

    editDevice(req, res) {
        const user = getReqMetadata(req, 'user');
        const { body } = req;

        let tempData = {};

        FIELDS_PUT_DEVICE_INFO.split(',').map(field => {
            if (body[field] !== undefined) {
                tempData[field] = body[field];
            }
        });

        handleModelRes(
            UserModel.setDevice(user.userId, tempData),
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
    const user = getReqMetadata(req, 'user'),
        isAdmin = user.roles.indexOf('admin') !== -1;

    !Array.isArray(data) && (data = [data]);

    data = data.map(item => {
        item.toObject && (item = item.toObject());
        const isOwnProfile = user.userId === item.userId;

        if (!isAdmin && !isOwnProfile) {
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