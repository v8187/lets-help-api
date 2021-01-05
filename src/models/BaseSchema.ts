import mongoose, {
    Schema, SchemaDefinition, SchemaOptions,
    Model, Aggregate, Query, Document
} from 'mongoose';

import { hashUserPinPlugin, recordAuthorPlugin } from '../middlewares/db';
import { EnumArray } from '../middlewares/db/EnumArray.type';

// Bind custom Schema Types
(Schema.Types as any).EnumArray = EnumArray;

// Bind custom mongoose Plugins
mongoose.plugin(hashUserPinPlugin);
mongoose.plugin(recordAuthorPlugin);

const COMMON_DEF = {
    createdById: String,
    updatedById: String,
    status: { type: Number, enum: [0, 1], default: 1 }
};


export interface IBaseDocument extends Document {
    createdById?: string;
    updatedById?: string;
};

export interface IChildDocument extends Document {
    refModel?: string;
    refId?: string;
};

export interface IBaseModel<T> extends Model<T & IBaseDocument> {
    list(): Aggregate<T> | Query<T[], Document>;
    list(id: string): Aggregate<T> | Query<T[], Document>;
    tempAll(): Aggregate<T> | Query<T[], Document>;
};

export class BaseSchema extends Schema {

    constructor(def: SchemaDefinition, options: SchemaOptions) {
        super(Object.assign(def, COMMON_DEF), {
            timestamps: {
                createdAt: 'createdOn',
                updatedAt: 'updatedOn'
            },
            ...options
        });
    }
}

export const defineCommonVirtuals = (schema: Schema) => {
    schema.virtual('createdBy', {
        ref: 'User',
        localField: 'createdById',
        foreignField: 'userId',
        justOne: true
    });

    schema.virtual('updatedBy', {
        ref: 'User',
        localField: 'updatedById',
        foreignField: 'userId',
        justOne: true
    });
};

export const commonTransform = (doc: any, ret: any, options: any) => {
    delete ret.createdById;
    delete ret.updatedById;
    delete ret.referredById;

    return ret;
};

export const commonShemaOptions = (fnTransform: typeof commonTransform) => {
    const tempTransform = (doc: any, ret: any, options: any) => {
        ret = commonTransform(doc, ret, options);
        return fnTransform ? fnTransform(doc, ret, options) : ret;
    };

    return {
        id: false,
        toObject: {
            virtuals: true,
            transform: tempTransform
        },
        toJSON: {
            virtuals: true,
            transform: tempTransform
        }
    };
};


export const lookupRefFields = (byId: string, as: string) => {
    return [{
        $lookup: {
            from: 'User', as, let: { byId: `$${byId}` },
            pipeline: [
                // { $match: { $expr: { $or: [{ $eq: ['$userId', '$$byId'] }, { $eq: ['$email', '$$byId'] }] } } },
                // { $match: { $expr: { $or: [{ $eq: ['$userId', '$$referredById'] }, { $eq: ['$email', '$$referredById'] }] } } },
                // { $match: { $or: [{ email: '$byId' }] } },
                // { $match: { $expr: { $eq: ['$email', '$$byId'] } } },
                { $limit: 1 },
                { $project: { userId: 1, email: 1, name: 1, _id: 0 } }
            ]
        }
    }, { $unwind: `$${as}` }, { $project: { [byId]: 0 } }];
};

export const lookupUserFields = (byId: string, as: string) => {
    return [{
        $lookup: {
            from: 'User', as, let: { byId: `$${byId}` },
            pipeline: [
                { $match: { $expr: { $eq: ['$userId', '$$byId'] } } },
                { $limit: 1 },
                { $project: { userId: 1, email: 1, name: 1, _id: 0 } }
            ]
        }
    }, { $unwind: `$${as}` }, { $project: { [byId]: 0 } }];
};

export function conditionalField(name: string, condition: string) {
    return {
        [name]: {
            $cond: {
                if: { $eq: [`$${condition}`, true] },
                then: `$${name}`,
                else: null
            }
        }
    };
}

export const lookupCountryFields = (byId: string, as: string) => {
    return [{
        $lookup: {
            from: 'Country', as, let: { byId: `$${byId}` },
            pipeline: [
                { $match: { $expr: { $eq: ['$countryId', '$$byId'] } } },
                { $limit: 1 },
                { $project: { countryId: 1, name: 1, _id: 0 } }
            ]
        }
    }, { $unwind: `$${as}` }, { $project: { [byId]: 0 } }];
};

export const lookupStateFields = (byId: string, as: string) => {
    return [{
        $lookup: {
            from: 'State', as, let: { byId: `$${byId}` },
            pipeline: [
                { $match: { $expr: { $eq: ['$stateId', '$$byId'] } } },
                { $limit: 1 },
                { $project: { stateId: 1, name: 1, _id: 0 } }
            ]
        }
    }, { $unwind: `$${as}` }, { $project: { [byId]: 0 } }];
};

export const lookupCityFields = (byId: string, as: string) => {
    return [{
        $lookup: {
            from: 'City', as, let: { byId: `$${byId}` },
            pipeline: [
                { $match: { $expr: { $eq: ['$cityId', '$$byId'] } } },
                { $limit: 1 },
                { $project: { cityId: 1, name: 1, _id: 0 } }
            ]
        }
    }, { $unwind: `$${as}` }, { $project: { [byId]: 0 } }];
};