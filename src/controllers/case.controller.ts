import { Request, Response } from 'express';

import { BaseController } from './BaseController';
import { CaseModel } from '../models/case.model';
import { handleModelRes, getReqMetadata, sendResponse } from '../utils/handlers';
import { sendNotification } from '../firebase-sdk';
import { userRoles } from '../configs/enum-constants';
import { CAN_ADD_CASE, CAN_VIEW_CASE_HIDDEN_DETAILS } from '../configs/permissions';

const FIELDS_REQUEST_CASE = 'ctId,relId,referredOn,contactNo,title,name,contactPerson,description,gender,age,address,city,state,country,referredBy';
const FIELDS_ADD_CASE = FIELDS_REQUEST_CASE + ',isApproved,approvedOn,isClosed,closedOn,closingReason,showContactNos,showAddress';

const reactCaseErr = (res, err = 'Server error') => {
    return sendResponse(res, {
        error: err,
        message: 'Something went wrong while saving your reaction for Case. Try again later.',
        type: 'INTERNAL_SERVER_ERROR'
    });
};

export class CaseController extends BaseController {

    createCase(req, res, isRequest) {
        const { permissionNames, userId } = getReqMetadata(req),
            canAdd = permissionNames.indexOf(CAN_ADD_CASE) !== -1;
        const { body } = req;
        let newCase = new CaseModel();

        (canAdd ? FIELDS_ADD_CASE : FIELDS_REQUEST_CASE).split(',').map(field => {
            const data = body[field];
            if (data !== undefined) {
                newCase[field] = Array.isArray(data) ? data.length ? data : newCase[field] : data;
            }
        });

        newCase.vAuthUser = userId;

        handleModelRes(
            newCase.save(),
            res, {
            success: 'Case created successfully.',
            error: 'Something went wrong while creating new Case. Try again later.',
            name: 'Case',
            onSuccess: data => {
                sendNotification({
                    data: {
                        caseId: data.caseId
                    },
                    notification: {
                        title: 'New Case',
                        body: isRequest ? 'Someone requested a new case.' : 'New case added. Click for details.'
                    }
                }, isRequest ? ['admin'] : [...userRoles]);
                return parseResponseData(req, data, true);
            }
        });
    }

    count(req: Request, res: Response) {
        handleModelRes(CaseModel.countDocs(), res);
    }

    ids(req: Request, res: Response) {
        handleModelRes(CaseModel.keyProps(), res);
    }

    casesList(req: Request, res: Response) {
        handleModelRes(CaseModel.list(), res, {
            onSuccess: data => parseResponseData(req, data)
        });
    }

    caseDetails(req: Request, res: Response) {
        handleModelRes(CaseModel.caseDetails(req.params.caseId), res, {
            onSuccess: data => parseResponseData(req, data, true)
        });
    }

    editCase(req: Request, res: Response) {
        const { permissionNames, userId } = getReqMetadata(req),
            canEdit = permissionNames.indexOf(CAN_ADD_CASE) !== -1;

        const { body } = req;

        const keys = Object.keys(body);
        const fields = (canEdit ? FIELDS_ADD_CASE : FIELDS_REQUEST_CASE).split(',');

        if (!keys.length || !keys.some(paramName => fields.indexOf(paramName) !== -1)) {
            return sendResponse(res, {
                error: 'Parameters missing/invalid',
                message: `Valid data is missing. Please provide at least one valid parameter to edit.`,
                name: 'Case',
                type: 'BAD_REQUEST'
            });
        }

        let tempData = {};

        fields.map(field => {
            if (body[field] !== undefined) {
                tempData[field] = body[field];
            }
        });

        handleModelRes(
            CaseModel.editCase(userId, body.caseId, tempData),
            res, {
            success: 'Case updated successfully.',
            error: 'Something went wrong while updating the Case. Try again later.',
            name: 'Case',
            onSuccess: data => parseResponseData(req, data, true)
        });
    }

    toggleReaction(req: Request, res: Response) {
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
            const { userId } = getReqMetadata(req);
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
                error: 'Something went wrong while updating "your reaction" for Case. Try again later.',
                onSuccess: data => parseResponseData(req, data, true)
            });
        }, modelErr => {
            console.error(modelErr);
            return reactCaseErr(res, modelErr.message);
        }).catch(modelReason => {
            console.log(modelReason);
            return reactCaseErr(res, modelReason.message);
        });
    }

    tempAll(req: Request, res: Response) {
        handleModelRes(CaseModel.tempAll(), res);
    }
}

const parseResponseData = (req, data, toObject = false) => {
    const { permissionNames } = getReqMetadata(req),
        canViewPI = !!permissionNames && permissionNames.indexOf(CAN_VIEW_CASE_HIDDEN_DETAILS) !== -1;

    !Array.isArray(data) && (data = [data]);

    data = data.map(item => {
        item.toObject && (item = item.toObject());

        if (!canViewPI) {
            if (!item.showContactNos) {
                delete item.contactNo;
                delete item.alternateNo1;
                delete item.alternateNo2;
            }
            if (!item.showAddress) {
                delete item.address;
            }
            delete item.createdOn;
            delete item.createdBy;
            delete item.updatedOn;
            delete item.createdBy;
        }
        if (!item.isClosed) {
            delete item.closedOn;
            delete item.closingReason;
        }
        if (!item.isApproved) {
            delete item.approvedOn;
        }
        delete item.createdById;
        delete item.updatedById;
        delete item.referredById;
        delete item.ctId;
        delete item.relId;
        delete item._id;
        delete item.__v;

        return item;
    });

    data = toObject && Array.isArray(data) ? data[0] : data;

    return data;
};