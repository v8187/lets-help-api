import { BaseController } from './BaseController';
import { UserModel } from '../models/user.model';
import { handleModelRes, getReqMetadata, sendResponse } from '../utils/handlers';
import { FIELDS_PUT_USER_PROFILE, FIELDS_PUT_OWN_PROFILE, FIELDS_POST_USER_PROFILE } from '../configs/query-fields';

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

    ids(req, res) {
        handleModelRes(UserModel.keyProps(), res);
    }

    usersList(req, res) {
        // console.log('getReqMetadata = %o', getReqMetadata(req, 'user'));
        const isAdmin = getReqMetadata(req, 'user').roles.indexOf('admin') !== -1;
        handleModelRes(isAdmin ? UserModel.listForAdmin() : UserModel.list(), res);
    }

    userProfile(req, res) {
        const user = getReqMetadata(req, 'user'),
            isAdmin = user.roles.indexOf('admin') !== -1;

        handleModelRes(isAdmin ?
            UserModel.userProfileForAdmin(req.params.userId) :
            UserModel.userProfile(req.params.userId), res);
    }

    myProfile(req, res) {
        handleModelRes(UserModel.byUserId(getReqMetadata(req, 'user').userId), res);
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
                error: 'Something went wrong while creating new Profile. Try again later.'
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
            error: 'Something went wrong while updating the Profile. Try again later.'
        });
    }

    byUserId(req, res) {
        handleModelRes(UserModel.byUserId(req.params.userId), res);
    }

    editRoles(req, res) {
        handleModelRes(
            UserModel.editRoles(req.body.userId, req.body.newRoles, getReqMetadata(req, 'user').userId),
            res, {
            success: 'Roles updated successfully.',
            error: 'Something went wrong while updating the Roles. Try again later.'
        }
        );
    }

    editGroups(req, res) {
        handleModelRes(
            UserModel.editGroups(req.body.userId, req.body.newGroups, getReqMetadata(req, 'user').userId),
            res, {
            success: 'Groups updated successfully.',
            error: 'Something went wrong while updating the Groups. Try again later.'
        }
        );
    }

    deleteProfile(req, res) {
        // handleModelRes(UserModel.byUserId(req.params.userId), res);
    }

    tempAll(req, res) {
        handleModelRes(UserModel.tempAll(), res);
    }
}
