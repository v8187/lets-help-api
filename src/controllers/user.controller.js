import { BaseController } from './BaseController';
import { UserModel } from '../models/user.model';
import { handleModelRes, getReqMetadata, sendResponse } from '../utils/handlers';
import { FIELDS_PUT_USER_PROFILE, FIELDS_PUT_OWN_PROFILE } from '../configs/query-fields';

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
                if (body[field]) {
                    tempData[field] = body[field];
                }
            });
        }

        if (isMyProfile) {
            FIELDS_PUT_OWN_PROFILE.split(',').map(field => {
                if (body[field]) {
                    tempData[field] = body[field];
                }
            });
        }

        handleModelRes(
            UserModel.editProfile(body.userId, tempData),
            res, {
            success: 'Profile updated successfully.',
            error: 'Something went wrong while updating the Profile. Try again later.'
        }
        );
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
