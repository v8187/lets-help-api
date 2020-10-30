import { BaseController } from './BaseController';
import { CaseModel } from '../models/case.model';
import { handleModelRes, getReqMetadata, sendResponse } from '../utils/handlers';
import { sendNotification } from '../firebase-sdk';
import { userRoles } from '../configs/enum-constants';

const FIELDS_CREATE_CASE = 'ctId,relId,referredOn,contactNo,title,name,contactPerson,description,gender,age,address,city,state,country,referredBy';
const FIELDS_CREATE_CASE_ADMIN = FIELDS_CREATE_CASE + ',isApproved,approvedOn,isClosed,closedOn,closingReason,showContactNos,showAddress';


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
        handleModelRes(CaseModel.list(), res, {
            onSuccess: data => parseResponseData(req, data)
        });
    }

    caseDetails(req, res) {
        handleModelRes(CaseModel.caseDetails(req.params.caseId), res, {
            onSuccess: data => parseResponseData(req, data, true)
        });
    }

    createCase(req, res, isRequest) {
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
                error: 'Something went wrong while creating new Case. Try again later.',
                onSuccess: data => {
                    parseResponseData(req, data, true);
                    sendNotification({
                        data: {
                            caseId: data.caseId
                        },
                        notification: {
                            title: 'New Case',
                            body: isRequest ? 'Someone requested a new case.' : 'New case added. Click for details.'
                        }
                    }, isRequest ? ['admin'] : [...userRoles]);
                }
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
            error: 'Something went wrong while updating the Case. Try again later.',
            onSuccess: data => parseResponseData(req, data, true)
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

    byCaseId(req, res) {
        handleModelRes(CaseModel.byCaseId(req.params.caseId), res);
    }

    tempAll(req, res) {
        handleModelRes(CaseModel.tempAll(), res);
    }
}

const parseResponseData = (req, data, toObject = false) => {
    const user = getReqMetadata(req, 'user'),
        isAdmin = user.roles.indexOf('admin') !== -1;

    !Array.isArray(data) && (data = [data]);

    data = data.map(item => {
        item.toObject && (item = item.toObject());

        if (!isAdmin) {
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
        delete item._id;
        delete item.__v;

        return item;
    });

    data = toObject && Array.isArray(data) ? data[0] : data;

    return data;
};