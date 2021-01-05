import { model } from 'mongoose';

import {
    BaseSchema, commonShemaOptions, defineCommonVirtuals, IBaseDocument, IBaseModel
} from './BaseSchema';
import { USER_KEY_FIELDS } from '../configs/query-fields';

interface IPermissionDoc extends IPermission, IBaseDocument { };

interface IPermissionModel extends IBaseModel<IPermissionDoc> { };

const PermissionSchema = new BaseSchema({
    permId: { type: Number, unique: true },
    name: { type: String, required: true, trim: true, lowercase: true, unique: true },
},
    {
        collection: 'Permission',
        ...commonShemaOptions((doc, ret, options) => {
            return ret;
        })
    }
);

defineCommonVirtuals(PermissionSchema);

/*
 * Add Custom static methods
 * =========================
 * 
 * Do not declare methods using ES6 arrow functions (=>). 
 * Arrow functions explicitly prevent binding this
 */
PermissionSchema.statics.list = function () {
    return this
        .aggregate([{ $match: {} }])
        .project({ permId: 1, name: 1, _id: 0 })
        .sort('name')
        .exec();
};

PermissionSchema.statics.tempAll = function () {
    return this.find()
        .populate('createdBy', USER_KEY_FIELDS)
        .populate('updatedBy', USER_KEY_FIELDS)
        .select().exec();
};

export const PermissionModel = model<IPermissionDoc, IPermissionModel>('Permission', PermissionSchema);