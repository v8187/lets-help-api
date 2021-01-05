import { model } from 'mongoose';

import {
    BaseSchema, commonShemaOptions, defineCommonVirtuals, IBaseDocument, IBaseModel
} from './BaseSchema';
import { USER_KEY_FIELDS } from '../configs/query-fields';

interface IRelationshipDoc extends IRelationship, IBaseDocument { };

interface IRelationshipModel extends IBaseModel<IRelationshipDoc> {
    relEdit(vAuthUser: string, relId: string, data: IRelationship): any;
    countDocs(): any;
};

const RelationshipSchema = new BaseSchema({
    relId: { type: Number, unique: true },
    name: { type: String, required: true, trim: true, lowercase: true, unique: true },
},
    {
        collection: 'Relationship',
        ...commonShemaOptions((doc, ret, options) => {
            return ret;
        })
    }
);

defineCommonVirtuals(RelationshipSchema);

// Relationship Schema's save pre hook
RelationshipSchema.pre('save', async function (next) {
    // let $relationship = this;

    // $relationship.relId = $relationship._id;

    next();
});

RelationshipSchema.post('save', async function ($relationship, next) {

    await $relationship.execPopulate();

    next();
});

/*
 * Add Custom static methods
 * =========================
 * 
 * Do not declare methods using ES6 arrow functions (=>). 
 * Arrow functions explicitly prevent binding this
 */
RelationshipSchema.statics.list = function () {
    return this
        .aggregate([{ $match: {} }])
        .project({ relId: 1, name: 1, _id: 0 })
        .sort('name')
        .exec();
};

RelationshipSchema.statics.tempAll = function () {
    return this.find()
        .populate('createdBy', USER_KEY_FIELDS)
        .populate('updatedBy', USER_KEY_FIELDS)
        .select().exec();
};

RelationshipSchema.statics.countDocs = function () {
    return this.countDocuments();
};

RelationshipSchema.statics.relEdit = function (vAuthUser: string, relId: string, data: IRelationship) {
    return this.findOneAndUpdate(
        { relId },
        { $set: { ...data, vAuthUser } },
        { upsert: false, new: true }
    )
        .select('name relId -_id').exec();
};

export const RelationshipModel = model<IRelationshipDoc, IRelationshipModel>('Relationship', RelationshipSchema);