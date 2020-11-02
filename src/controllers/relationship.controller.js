import { BaseController } from './BaseController';
import { RelationshipModel } from '../models/relationship.model';
import { IncrementModel } from '../models/increment.model';
import { handleModelRes, getReqMetadata, sendResponse } from '../utils/handlers';

const FIELDS_RELATIONSHIP = 'name';

const relAddErr = (res, err = 'Server error') => {
    return sendResponse(res, {
        error: err,
        message: 'Something went wrong while creating new Relationship. Try again later.',
        type: 'INTERNAL_SERVER_ERROR'
    });
};

export class RelationshipController extends BaseController {

    isExist(req, res) {
        handleModelRes(RelationshipModel.isExist(req.params.name), res);
    }

    relList(req, res) {
        handleModelRes(RelationshipModel.list(), res);
    }

    relAdd(req, res, isRequest) {
        const { name } = req.body;

        RelationshipModel.isExist(req.body).then(async $relationship => {
            if (!!$relationship) {
                return sendResponse(res, {
                    error: 'Cannot create new Relationship',
                    message: `Relationship already exist with Name "${name}".`,
                    type: 'CONFLICT'
                });
            }

            const { body } = req;
            let newRelationship = new RelationshipModel();

            (FIELDS_RELATIONSHIP).split(',').map(field => {
                const data = body[field];
                if (data !== undefined) {
                    newRelationship[field] = data;
                }
            });

            if (process.env.DB_FILL_MODE !== 'ON') {
                const user = getReqMetadata(req, 'user');
                newRelationship.vAuthUser = user.userId;
            }

            const srNoRes = await IncrementModel.getSrNo(88);
            newRelationship.relId = srNoRes.srNo;

            handleModelRes(
                newRelationship.save(),
                res, {
                success: 'Relationship created successfully.',
                error: 'Something went wrong while creating new Relationship. Try again later.',
            });
        }, modelErr => {
            console.error(modelErr);
            return relAddErr(res, modelErr.message);
        }).catch(modelReason => {
            console.log(modelReason);
            return relAddErr(res, modelReason.message);
        });
    }

    relEdit(req, res) {
        const user = getReqMetadata(req, 'user');
        const { body } = req;

        let tempData = {};

        (FIELDS_RELATIONSHIP).split(',').map(field => {
            if (body[field] !== undefined) {
                tempData[field] = body[field];
            }
        });

        handleModelRes(
            RelationshipModel.relEdit(user.userId, body.relationshipId, tempData),
            res, {
            success: 'Relationship updated successfully.',
            error: 'Something went wrong while updating the Relationship. Try again later.',
        });
    }

    tempAll(req, res) {
        handleModelRes(RelationshipModel.tempAll(), res);
    }
}
