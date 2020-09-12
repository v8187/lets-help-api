import { model } from 'mongoose';

import {
    BaseSchema, commonShemaOptions, defineCommonVirtuals
} from './BaseSchema';
import { USER_KEY_FIELDS } from '../configs/query-fields';

const RelationshipSchema = new BaseSchema({
    relationshipId: { type: String, },
    name: { type: String, required: true, trim: true },
    label: { type: String, trim: true }
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
    let $relationship = this;

    $relationship.relationshipId = $relationship._id;

    next();
});

RelationshipSchema.post('save', async function ($relationship, next) {

    const populatedRelationship = await $relationship.execPopulate();

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
        .project({ relationshipId: 1, name: 1, label: 1, _id: 0 })
        .sort('label')
        .exec();
};

RelationshipSchema.statics.tempAll = function () {
    return this.find()
        .populate('createdBy', USER_KEY_FIELDS)
        .populate('updatedBy', USER_KEY_FIELDS)
        .select().exec();
};

RelationshipSchema.statics.count = function () {
    return this.countDocuments();
};

RelationshipSchema.statics.relationshipExists = function ({ name }) {
    return this
        .findOne({ name })
        .exec();
};

RelationshipSchema.statics.editRelationship = function (vAuthUser, relationshipId, data) {
    return this.findOneAndUpdate(
        { relationshipId },
        { $set: { ...data, vAuthUser } },
        { upsert: false, new: true }
    )
        .select('name label relationshipId -_id').exec();
};

RelationshipSchema.statics.saveRelationship = function ($relationship) {
    return $relationship.save();
};

export const RelationshipModel = model('Relationship', RelationshipSchema);