import { BaseController } from './BaseController';
import { UserModel } from '../models/user.model';
import { handleModelRes, getReqMetadata } from '../utils/handlers';

export class UserController extends BaseController {

    hasAccount(req, res) {
        handleModelRes(UserModel.hasAccount(req.params.userInfo), res);
    }

    usersList(req, res) {
        // console.log('getReqMetadata = %o', getReqMetadata(req, 'user'));
        const isAdmin = getReqMetadata(req, 'user').roles.indexOf('admin') !== -1;
        handleModelRes(isAdmin ? UserModel.listForAdmin() : UserModel.list(), res);
    }

    userProfile(req, res) {
        const user = getReqMetadata(req, 'user'),
            isAdmin = user.roles.indexOf('admin') !== -1;

        handleModelRes(isAdmin ? UserModel.userProfileForAdmin(req.params.userId) : UserModel.userProfile(req.params.userId), res);
    }

    myProfile(req, res) {
        handleModelRes(UserModel.byUserId(getReqMetadata(req, 'user').userId), res);
    }

    editProfile(req, res) {
        handleModelRes(
            UserModel.editProfile(getReqMetadata(req, 'user').userId, req.body.data),
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