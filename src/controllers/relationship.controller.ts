import { BaseController } from './BaseController';
import { RelationshipModel } from '../models/relationship.model';
import { IncrementModel } from '../models/increment.model';
import { handleModelRes, getReqMetadata } from '../utils/handlers';

const FIELDS_RELATIONSHIP = 'name';

export class RelationshipController extends BaseController {

    isExist(req: Request, res: Response) {
        handleModelRes(RelationshipModel.isExist(req.params.name), res);
    }

    relList(req: Request, res: Response) {
        handleModelRes(RelationshipModel.list(), res);
    }

    async relAdd(req: Request, res: Response) {
        const { body } = req;
        let newRelationship = new RelationshipModel();

        (FIELDS_RELATIONSHIP).split(',').map(field => {
            if (body[field] !== undefined) {
                newRelationship[field] = body[field];
            }
        });

        if (process.env.DB_FILL_MODE !== 'ON') {
            newRelationship.vAuthUser = getReqMetadata(req).userId;
        }

        const srNoRes = await IncrementModel.getSrNo(88);
        newRelationship.relId = srNoRes.srNo;

        handleModelRes(
            newRelationship.save(),
            res, {
            success: 'Relationship created successfully.',
            error: 'Something went wrong while creating new Relationship. Try again later.',
            name: 'Relationship'
        });
    }

    relEdit(req: Request, res: Response) {
        const { body } = req;
        let tempData = {};

        (FIELDS_RELATIONSHIP).split(',').map(field => {
            if (body[field] !== undefined) {
                tempData[field] = body[field];
            }
        });

        handleModelRes(
            RelationshipModel.relEdit(getReqMetadata(req).userId, body.relId, tempData),
            res, {
            success: 'Relationship updated successfully.',
            error: 'Something went wrong while updating the Relationship. Try again later.',
            name: 'Relationship'
        });
    }

    tempAll(req: Request, res: Response) {
        handleModelRes(RelationshipModel.tempAll(), res);
    }
}
