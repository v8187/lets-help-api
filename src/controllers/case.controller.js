import { BaseController } from './BaseController';
import { CaseModel } from '../models/case.model';
import { handleModelRes, getReqMetadata, sendResponse } from '../utils/handlers';
import { FIELDS_PUT_USER_PROFILE, FIELDS_PUT_OWN_PROFILE, FIELDS_POST_USER_PROFILE } from '../configs/query-fields';

const createCaseErr = (res, err = 'Server error') => {
    return sendResponse(res, {
        error: err,
        message: 'Something went wrong while creating new Case. Try again later.',
        type: 'INTERNAL_SERVER_ERROR'
    });
};

export class CaseController extends BaseController {

    ids(req, res) {
        handleModelRes(CaseModel.keyProps(), res);
    }

    casesList(req, res) {
        const isAdmin = getReqMetadata(req, 'user').roles.indexOf('admin') !== -1;
        handleModelRes(isAdmin ? CaseModel.listForAdmin() : CaseModel.list(), res);
    }

    caseDetails(req, res) {
        const user = getReqMetadata(req, 'user'),
            isAdmin = user.roles.indexOf('admin') !== -1;

        handleModelRes(isAdmin ?
            CaseModel.caseDetailsForAdmin(req.params.caseId) :
            CaseModel.caseDetails(req.params.caseId), res);
    }

    requestCase(req, res) {
        const { email } = req.body;

        CaseModel.hasAccount(req.body.email).then($case => {
            if ($case) {
                return sendResponse(res, {
                    error: 'Cannot create new Profile',
                    message: `Case already exist with "${email}".`,
                    type: 'CONFLICT'
                });
            }
            const { body } = req;
            let newCase = new CaseModel();

            FIELDS_POST_USER_PROFILE.split(',').map(field => {
                const data = body[field];
                if (data !== undefined) {
                    newCase[field] = Array.isArray(data) ? data.length ? data : newCase[field] : data;
                }
            });

            newCase.vAuthCase = getReqMetadata(req, 'user').userId;

            handleModelRes(
                CaseModel.saveCase(newCase),
                res, {
                success: 'Profile created successfully.',
                error: 'Something went wrong while creating new Profile. Try again later.'
            });
        }, modelErr => {
            console.error(modelErr);
            return createCaseErr(res, modelErr.message);
        }).catch(modelReason => {
            console.log(modelReason);
            return createCaseErr(res, modelReason.message);
        });
    }

    createCase(req, res) {
        const { email } = req.body;

        CaseModel.hasAccount(req.body.email).then($case => {
            if ($case) {
                return sendResponse(res, {
                    error: 'Cannot create new Profile',
                    message: `Case already exist with "${email}".`,
                    type: 'CONFLICT'
                });
            }
            const { body } = req;
            let newCase = new CaseModel();

            FIELDS_POST_USER_PROFILE.split(',').map(field => {
                const data = body[field];
                if (data !== undefined) {
                    newCase[field] = Array.isArray(data) ? data.length ? data : newCase[field] : data;
                }
            });

            newCase.vAuthCase = getReqMetadata(req, 'user').userId;

            handleModelRes(
                CaseModel.saveCase(newCase),
                res, {
                success: 'Profile created successfully.',
                error: 'Something went wrong while creating new Profile. Try again later.'
            });
        }, modelErr => {
            console.error(modelErr);
            return createCaseErr(res, modelErr.message);
        }).catch(modelReason => {
            console.log(modelReason);
            return createCaseErr(res, modelReason.message);
        });
    }

    editCase(req, res) {
        const user = getReqMetadata(req, 'user'),
            isAdmin = user.roles.indexOf('admin') !== -1,
            isMyProfile = user.caseId === req.body.caseId;
        /**
         * If non-admin case try to update someone else's profile
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
            CaseModel.editProfile(user.caseId, body.caseId, tempData),
            res, {
            success: 'Profile updated successfully.',
            error: 'Something went wrong while updating the Profile. Try again later.'
        });
    }

    byCaseId(req, res) {
        handleModelRes(CaseModel.byCaseId(req.params.caseId), res);
    }

    tempAll(req, res) {
        handleModelRes(CaseModel.tempAll(), res);
    }
}
