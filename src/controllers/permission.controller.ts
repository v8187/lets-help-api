import { Request, Response } from 'express';

import { BaseController } from './BaseController';
import { PermissionModel } from '../models/permission.model';
import { IncrementModel } from '../models/increment.model';
import { handleModelRes, getReqMetadata } from '../utils/handlers';

const FIELDS_PERMISSION = 'name';

export class PermissionController extends BaseController {

    permList(req: Request, res: Response) {
        handleModelRes(PermissionModel.list(), res);
    }

    permAdd(req: Request, res: Response) {
        (async () => {
            const { body } = req;
            let newPermission = new PermissionModel();

            (FIELDS_PERMISSION).split(',').map(field => {
                if (body[field] !== undefined) {
                    newPermission[field] = body[field];
                }
            });

            if (process.env.DB_FILL_MODE !== 'ON') {
                newPermission.vAuthUser = getReqMetadata(req).userId;
            }

            const srNoRes = await IncrementModel.getSrNo(88);
            newPermission.permId = srNoRes.srNo;

            handleModelRes(
                newPermission.save(),
                res, {
                success: 'Permission created successfully.',
                error: 'Something went wrong while creating new Permission. Try again later.',
            });
        })();
    }

    tempAll(req: Request, res: Response) {
        handleModelRes(PermissionModel.tempAll(), res);
    }
}
