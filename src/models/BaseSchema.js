import mongoose, { Schema, plugin } from 'mongoose';

import { hashUserPinPlugin, recordAuthorPlugin } from '../middlewares/db';
import { EnumArray } from '../middlewares/db/EnumArray.type';

// Bind custom Schema Types
Schema.Types.EnumArray = EnumArray;

// Bind custom mongoose Plugins
mongoose.plugin(hashUserPinPlugin);
mongoose.plugin(recordAuthorPlugin);

const COMMON_DEF = {
    createdById: {
        type: String
    },
    updatedById: {
        type: String
    },
    status: {
        type: Number,
        enum: [0, 1],
        default: 1
    }
};

export class BaseSchema extends Schema {

    constructor(def, options) {
        super(Object.assign(def, COMMON_DEF), {
            timestamps: {
                createdAt: 'createdOn',
                updatedAt: 'updatedOn'
            },
            ...options
        });
    }
}

export const defineCommonVirtuals = (schema) => {
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

export const commonTransform = (doc, ret, options) => {
    delete ret.createdById;
    delete ret.updatedById;
    delete ret.referredById;

    return ret;
};

export const commonShemaOptions = (fnTransform) => {
    const tempTransform = (doc, ret, options) => {
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


export const lookupRefFields = (byId, as) => {
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

export const lookupUserFields = (byId, as) => {
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

export function conditionalField(name, condition) {
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

export const lookupCountryFields = (byId, as) => {
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

export const lookupStateFields = (byId, as) => {
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

export const lookupCityFields = (byId, as) => {
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