import { BaseController } from './BaseController';
import { RelationshipModel } from '../models/relationship.model';
import { handleModelRes, getReqMetadata, sendResponse } from '../utils/handlers';
import { FIELDS_RELATIONSHIP } from '../configs/query-fields';

const createRelationshipErr = (res, err = 'Server error') => {
    return sendResponse(res, {
        error: err,
        message: 'Something went wrong while creating new Relationship. Try again later.',
        type: 'INTERNAL_SERVER_ERROR'
    });
};

const reactRelationshipErr = (res, err = 'Server error') => {
    return sendResponse(res, {
        error: err,
        message: 'Something went wrong while saving your reaction for Relationship. Try again later.',
        type: 'INTERNAL_SERVER_ERROR'
    });
};

export class RelationshipController extends BaseController {

    relationshipExists(req, res) {
        handleModelRes(RelationshipModel.relationshipExists(req.params.name), res);
    }

    relationshipsList(req, res) {
        handleModelRes(RelationshipModel.list(), res, {
            onSuccess: data => parseResponseData(req, data)
        });
    }

    createRelationship(req, res, isRequest) {
        const { name } = req.body;

        RelationshipModel.relationshipExists(req.body).then($relationship => {
            if (!!$relationship) {
                return sendResponse(res, {
                    error: 'Cannot create new Relationship',
                    message: `Relationship already exist with Name "${name}".`,
                    type: 'CONFLICT'
                });
            }
            const user = getReqMetadata(req, 'user');

            const { body } = req;
            let newRelationship = new RelationshipModel();

            (FIELDS_RELATIONSHIP).split(',').map(field => {
                const data = body[field];
                if (data !== undefined) {
                    newRelationship[field] = data;
                }
            });

            newRelationship.vAuthUser = user.userId;

            handleModelRes(
                RelationshipModel.saveRelationship(newRelationship),
                res, {
                success: 'Relationship created successfully.',
                error: 'Something went wrong while creating new Relationship. Try again later.',
                // onSuccess: data => {
                //     parseResponseData(req, data, true);
                // }
            });
        }, modelErr => {
            console.error(modelErr);
            return createRelationshipErr(res, modelErr.message);
        }).catch(modelReason => {
            console.log(modelReason);
            return createRelationshipErr(res, modelReason.message);
        });
    }

    editRelationship(req, res) {
        const user = getReqMetadata(req, 'user');
        const { body } = req;

        let tempData = {};

        (FIELDS_RELATIONSHIP).split(',').map(field => {
            if (body[field] !== undefined) {
                tempData[field] = body[field];
            }
        });

        handleModelRes(
            RelationshipModel.editRelationship(user.userId, body.relationshipId, tempData),
            res, {
            success: 'Relationship updated successfully.',
            error: 'Something went wrong while updating the Relationship. Try again later.',
            // onSuccess: data => parseResponseData(req, data, true)
        });
    }

    tempAll(req, res) {
        handleModelRes(RelationshipModel.tempAll(), res);
    }
}

const parseResponseData = (req, data, toObject = false) => {
    !Array.isArray(data) && (data = [data]);

    data = data.map(item => {
        item.toObject && (item = item.toObject());

        delete item.createdOn;
        delete item.createdBy;
        delete item.updatedOn;
        delete item.createdBy;
        delete item.createdById;
        delete item.updatedById;
        delete item._id;
        delete item.__v;

        return item;
    });

    data = toObject && Array.isArray(data) ? data[0] : data;

    return data;
};