import { BaseController } from './BaseController';
import { UserModel } from '../models/user.model';
import { handleModelRes, getReqMetadata, sendResponse } from '../utils/handlers';
import {
    FIELDS_PUT_USER_PROFILE, FIELDS_PUT_OWN_PROFILE,
    FIELDS_PUT_DEVICE_INFO, FIELDS_POST_USER_PROFILE
} from '../configs/query-fields';

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
        // console.log('getReqMetadata = %o', getReqMetadata(req, 'user'));
        // const isAdmin = getReqMetadata(req, 'user').roles.indexOf('admin') !== -1;
        handleModelRes(UserModel.listForAdmin()/* isAdmin ? UserModel.listForAdmin() : UserModel.list() */, res, {
            onSuccess: data => parseResponseData(req, data)
        });
    }

    userProfile(req, res) {
        // const user = getReqMetadata(req, 'user'),
        //     isAdmin = user.roles.indexOf('admin') !== -1;

        handleModelRes(UserModel.userProfileForAdmin(req.params.userId)/* isAdmin ?
            UserModel.userProfileForAdmin(req.params.userId) :
            UserModel.userProfile(req.params.userId) */, res, {
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

            FIELDS_POST_USER_PROFILE.split(',').map(field => {
                const data = body[field];
                if (data !== undefined) {
                    newUser[field] = Array.isArray(data) ? data.length ? data : newUser[field] : data;
                }
            });

            newUser.vAuthUser = getReqMetadata(req, 'user').userId;

            handleModelRes(
                UserModel.saveUser(newUser),
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
            FIELDS_PUT_USER_PROFILE.split(',').map(field => {
                if (body[field] !== undefined) {
                    tempData[field] = body[field];
                }
            });
        }

        if (isMyProfile) {
            FIELDS_PUT_OWN_PROFILE.split(',').map(field => {
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
        delete item.bloodGroupId;
        delete item.roleIds;

        return item;
    });

    data = toObject && Array.isArray(data) ? data[0] : data;

    return data;
};