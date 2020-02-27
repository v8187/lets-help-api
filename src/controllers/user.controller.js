import { BaseController } from './BaseController';
import { UserModel } from '../models/user.model';
import { handleModelRes, getReqMetadata } from '../utils/handlers';

export class UserController extends BaseController {

    hasAccount(req, res) {
        handleModelRes(UserModel.hasAccount(req.params.userInfo), res);
    }

    usersList(req, res) {
        handleModelRes(UserModel.list(), res);
    }

    byUserId(req, res) {
        handleModelRes(UserModel.byUserId(req.params.userId), res);
    }

    editRoles(req, res) {
        handleModelRes(
            UserModel.editRoles(req.body.userId, req.body.newRoles, getReqMetadata(req, 'userId')),
            res, {
                success: 'Roles updated successfully.',
                error: 'Something went wrong while updating the Roles. Try again later.'
            }
        );
    }

    editGroups(req, res) {
        handleModelRes(
            UserModel.editGroups(req.body.userId, req.body.newGroups, getReqMetadata(req, 'userId')),
            res, {
                success: 'Groups updated successfully.',
                error: 'Something went wrong while updating the Groups. Try again later.'
            }
        );
    }

    getProfile(req, res) {
        handleModelRes(UserModel.byUserId(getReqMetadata(req, 'userId')), res);
    }

    editProfile(req, res) {
        handleModelRes(
            UserModel.editProfile(getReqMetadata(req, 'userId'), req.body.data),
            res, {
                success: 'Profile updated successfully.',
                error: 'Something went wrong while updating the Profile. Try again later.'
            }
        );
    }

    deleteProfile(req, res) {
        // handleModelRes(UserModel.byUserId(req.params.userId), res);
    }

    changeUserPin(req, res) {
        handleModelRes(
            UserModel.changeUserPin(req.body.email, req.body.newUserPin),
            res, {
                success: 'UserPin changed successfully.',
                error: 'Something went wrong while changing the UserPin. Try again later.'
            }
        );
    }

    tempAll(req, res) {
        handleModelRes(UserModel.tempAll(), res);
    }
}