import { Request, Response } from 'express';

import { BaseController } from './BaseController';
import { BloodGroupModel } from '../models/blood-group.model';
import { IncrementModel } from '../models/increment.model';
import { handleModelRes, getReqMetadata } from '../utils/handlers';

const FIELDS_BLOOD_GROUP = 'name';

export class BloodGroupController extends BaseController {

    bgList(req: Request, res: Response) {
        handleModelRes(BloodGroupModel.list(), res);
    }

    async bgAdd(req: Request, res: Response) {
        const { body } = req;
        let newBloodGroup = new BloodGroupModel();

        (FIELDS_BLOOD_GROUP).split(',').map(field => {
            if (body[field] !== undefined) {
                newBloodGroup[field] = body[field];
            }
        });

        if (process.env.DB_FILL_MODE !== 'ON') {
            newBloodGroup.vAuthUser = getReqMetadata(req).userId;
        }

        const srNoRes = await IncrementModel.getSrNo(88);
        newBloodGroup.bgId = srNoRes.srNo;

        handleModelRes(
            newBloodGroup.save(),
            res, {
            success: 'Blood Group created successfully.',
            error: 'Something went wrong while creating new Blood Group. Try again later.',
            name: 'Blood Group'
        });
    }

    bgEdit(req: Request, res: Response) {
        const { body } = req;
        let tempData = {};

        (FIELDS_BLOOD_GROUP).split(',').map(field => {
            if (body[field] !== undefined) {
                tempData[field] = body[field];
            }
        });

        handleModelRes(
            BloodGroupModel.bgEdit(getReqMetadata(req).userId, body.bgId, tempData),
            res, {
            success: 'BloodGroup updated successfully.',
            error: 'Something went wrong while updating the Blood Group. Try again later.',
            name: 'Blood Group'
        });
    }

    tempAll(req: Request, res: Response) {
        handleModelRes(BloodGroupModel.tempAll(), res);
    }
}
