import { BaseController } from './BaseController';
import { CaseModel } from '../models/case.model';
import { handleModelRes, getReqMetadata, sendResponse } from '../utils/handlers';
import { FIELDS_CREATE_CASE_ADMIN, FIELDS_CREATE_CASE } from '../configs/query-fields';

const createCaseErr = (res, err = 'Server error') => {
    return sendResponse(res, {
        error: err,
        message: 'Something went wrong while creating new Case. Try again later.',
        type: 'INTERNAL_SERVER_ERROR'
    });
};

const reactCaseErr = (res, err = 'Server error') => {
    return sendResponse(res, {
        error: err,
        message: 'Something went wrong while saving your reaction for Case. Try again later.',
        type: 'INTERNAL_SERVER_ERROR'
    });
};

export class CaseController extends BaseController {

    caseExists(req, res) {
        handleModelRes(CaseModel.caseExists(req.params.userInfo), res);
    }

    count(req, res) {
        handleModelRes(CaseModel.count(), res);
    }

    ids(req, res) {
        handleModelRes(CaseModel.keyProps(), res);
    }

    casesList(req, res) {
        const isAdmin = getReqMetadata(req, 'user').roles.indexOf('admin') !== -1;
        handleModelRes(isAdmin ? CaseModel.listForAdmin() : CaseModel.list(), res);
    }

    caseDetails(req, res) {
        const isAdmin = getReqMetadata(req, 'user').roles.indexOf('admin') !== -1;

        handleModelRes(isAdmin ?
            CaseModel.caseDetailsForAdmin(req.params.caseId) :
            CaseModel.caseDetails(req.params.caseId), res);
    }

    createCase(req, res) {
        const { contactNo, title } = req.body;

        CaseModel.caseExists(req.body).then($case => {
            if (!!$case) {
                return sendResponse(res, {
                    error: 'Cannot create new Case',
                    message: `Case already exist with Contact No ${contactNo} and Title "${title}".`,
                    type: 'CONFLICT'
                });
            }
            const user = getReqMetadata(req, 'user'),
                isAdmin = user.roles.indexOf('admin') !== -1;

            const { body } = req;
            let newCase = new CaseModel();

            (isAdmin ? FIELDS_CREATE_CASE_ADMIN : FIELDS_CREATE_CASE).split(',').map(field => {
                const data = body[field];
                if (data !== undefined) {
                    newCase[field] = Array.isArray(data) ? data.length ? data : newCase[field] : data;
                }
            });

            newCase.vAuthUser = user.userId;

            handleModelRes(
                CaseModel.saveCase(newCase),
                res, {
                success: 'Case created successfully.',
                error: 'Something went wrong while creating new Case. Try again later.'
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
            isAdmin = user.roles.indexOf('admin') !== -1;
        const { body } = req;

        let tempData = {};

        (isAdmin ? FIELDS_CREATE_CASE_ADMIN : FIELDS_CREATE_CASE).split(',').map(field => {
            if (body[field] !== undefined) {
                tempData[field] = body[field];
            }
        });

        handleModelRes(
            CaseModel.editCase(user.userId, body.caseId, tempData),
            res, {
            success: 'Case updated successfully.',
            error: 'Something went wrong while updating the Case. Try again later.'
        });
    }

    toggleReaction(req, res) {
        const { caseId, reactionType } = req.body;

        if (['UP', 'DOWN'].indexOf(reactionType) === -1) {
            return sendResponse(res, {
                error: 'Invalid Reaction',
                message: `Case reaction can be one of "UP, DOWN".`,
                type: 'BAD_REQUEST'
            });
        }

        CaseModel.byId(caseId).then($case => {
            if (!$case) {
                return sendResponse(res, {
                    error: 'Case not found',
                    message: `Case with given ID "${caseId}" does not exist.`,
                    type: 'BAD_REQUEST'
                });
            }
            const userId = getReqMetadata(req, 'user').userId;
            let tempData = {};

            if (reactionType === 'UP') {
                if ($case.upVoters.indexOf(userId) !== -1) {
                    tempData = {
                        upVoters: $case.upVoters.filter(voter => voter !== userId)
                    };
                } else {
                    $case.upVoters.push(userId);
                    tempData = {
                        upVoters: $case.upVoters,
                        downVoters: $case.downVoters.filter(voter => voter !== userId)
                    };
                }
            } else {
                if ($case.downVoters.indexOf(userId) !== -1) {
                    tempData = {
                        downVoters: $case.downVoters.filter(voter => voter !== userId)
                    };
                } else {
                    $case.downVoters.push(userId);
                    tempData = {
                        downVoters: $case.downVoters,
                        upVoters: $case.upVoters.filter(voter => voter !== userId)
                    };
                }
            }

            handleModelRes(
                CaseModel.toggleReaction(caseId, tempData),
                res, {
                success: 'Your reaction saved successfully.',
                error: 'Something went wrong while updating "your reaction" for Case. Try again later.'
            });
        }, modelErr => {
            console.error(modelErr);
            return reactCaseErr(res, modelErr.message);
        }).catch(modelReason => {
            console.log(modelReason);
            return reactCaseErr(res, modelReason.message);
        });
    }

    byCaseId(req, res) {
        handleModelRes(CaseModel.byCaseId(req.params.caseId), res);
    }

    tempAll(req, res) {
        handleModelRes(CaseModel.tempAll(), res);
    }
}
