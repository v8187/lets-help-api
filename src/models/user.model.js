import { Schema, model } from 'mongoose';
import { compareSync } from 'bcryptjs';

import {
    BaseSchema, commonShemaOptions,
    conditionalField, defineCommonVirtuals
} from './BaseSchema';
import {
    USER_KEY_FIELDS, FIELDS_GET_PUBLIC_PROFILE, FIELDS_GET_OWN_PROFILE, FIELDS_GET_USER_PROFILE
} from '../configs/query-fields';
import { userGroups, userRoles, genders, bloodGroups } from '../configs/enum-constants';

const UserSchema = new BaseSchema({
    // Account Fields
    userId: String,
    userPin: { type: String, require: true },
    isVerified: Boolean,
    roles: {
        type: Schema.Types.EnumArray, default: ['default'], enum: userRoles, required: true
    },
    // groups: {
    //     type: Schema.Types.EnumArray, default: ['default'], enum: userGroups, required: true
    // },

    // Personal Fields
    name: String,
    gender: { type: String, enum: genders, lowercase: true },
    dob: { type: Date },
    bloodGroup: { type: String, enum: bloodGroups, lowercase: false },

    // Communication Fields
    email: {
        type: String, lowercase: true, required: true
    },
    address: String,
    contactNo: String,
    alternateNo1: String,
    alternateNo2: String,
    city: String,
    state: String,
    country: String,

    // Misc Fields
    referredById: String,
    joinedOn: Date,

    // Privacy fields
    showEmail: Boolean,
    showContactNos: Boolean,
    showBloodGroup: Boolean,
    showAddress: Boolean,
    showContributions: Boolean,
    showBirthday: Boolean
},
    {
        collection: 'User',
        ...commonShemaOptions((doc, ret, options) => {
            return ret;
        })
    }
);

defineCommonVirtuals(UserSchema);

// User Schema's virtual fields
UserSchema.virtual('referredBy', {
    ref: 'User',
    localField: 'referredById',
    foreignField: 'userId',
    justOne: true,
    // lookup: (doc) => {
    //     return {
    //         from: 'User', let: { id: '$referredById' },
    //         pipeline: [
    //             { $match: { $expr: { $or: [{ $eq: ['$userId', '$$id'] }, { $eq: ['$email', '$$id'] },] } } },
    //             { $project: { userId: 1, email: 1, name: 1, _id: 0 } }
    //         ], as: 'referredBy',
    //     };
    // },
});

// User Schema's save pre hook
UserSchema.pre('save', async function (next) {
    let user = this;

    user.userId = user._id;
    user.createdById = user.updatedById = user.vAuthUser || user.userId;

    delete user.vAuthUser;

    if (!user.joinedOn) {
        user.joinedOn = new Date();
    }

    if (!user.referredById) {
        const defaultReferrer = await UserModel.findOne({ email: 'vikram1vicky@gmail.com' }).select('userId email').exec();
        user.referredById = defaultReferrer ? defaultReferrer.userId : user.userId;
    }
    next();
});

UserSchema.pre('updateOne', function (next) {
    next();
});

/*
 * Add Custom static methods
 * =========================
 * 
 * Do not declare methods using ES6 arrow functions (=>). 
 * Arrow functions explicitly prevent binding this
 */
UserSchema.statics.list = function () {
    return this
        .aggregate([
            { $match: {} },
            // ...lookupUserFields('referredById', 'referredBy')
        ])
        .project({ userId: 1, name: 1, joinedOn: 1, _id: 0 })
        .sort('name')
        .exec();
};

UserSchema.statics.listForAdmin = function () {
    return this
        .aggregate([{ $match: {} }])
        .project({ userId: 1, name: 1, joinedOn: 1, email: 1, contactNo: 1, alternateNo1: 1, alternateNo2: 1, _id: 0 })
        .sort('name')
        .exec();
};

UserSchema.statics.userProfile = function (userId) {
    return this
        .aggregate([{ $match: { userId } }, { $limit: 1 }])
        .project({
            userId: 1, name: 1, gender: 1, joinedOn: 1, isVerified: 1,
            roles: 1, city: 1, state: 1, country: 1,
            ...conditionalField('contactNo', 'showContactNos'),
            ...conditionalField('alternateNo1', 'showContactNos'),
            ...conditionalField('alternateNo2', 'showContactNos'),
            ...conditionalField('email', 'showEmail'),
            ...conditionalField('bloodGroup', 'showBloodGroup'),
            ...conditionalField('address', 'showAddress'),
            // ...conditionalField('email', 'showContributions'),
            ...conditionalField('dob', 'showBirthday'),
            _id: 0
        })
        .exec();
};

UserSchema.statics.userProfileForAdmin = function (userId) {
    return this
        // .aggregate([
        //     { $match: { userId } },
        //     ...lookupUserFields('createdById', 'createdBy'),
        //     ...lookupUserFields('updatedById', 'updatedBy'),
        //     ...lookupRefFields('referredById', 'referredBy'),
        //     { $project: { _id: 0, userPin: 0, __v: 0 } }
        // ]);
        .findOne({ userId })
        .populate('createdBy', USER_KEY_FIELDS)
        .populate('updatedBy', USER_KEY_FIELDS)
        .populate('referredBy', USER_KEY_FIELDS)
        .select(FIELDS_GET_USER_PROFILE)
        .exec();
};

UserSchema.statics.byUserId = function (userId) {
    // console.log('USER_SELF_QUERY_FIELDS', USER_SELF_QUERY_FIELDS);
    return this
        .findOne({ userId })
        .populate('createdBy', USER_KEY_FIELDS)
        .populate('updatedBy', USER_KEY_FIELDS)
        .populate('referredBy', USER_KEY_FIELDS)
        .select(FIELDS_GET_OWN_PROFILE)
        .exec();
};

UserSchema.statics.tempAll = function () {
    return this.find()
        .populate('createdBy', USER_KEY_FIELDS)
        .populate('updatedBy', USER_KEY_FIELDS)
        .populate('referredBy', USER_KEY_FIELDS)
        // .populate('contactNo', PHONE_QUERY_FIELDS)
        // .populate('city', 'city name -_id')
        // .populate('state', 'state name -_id')
        // .populate('country', 'country name -_id')
        // .populate({
        //     path: 'address',
        //     model: AddressModel,
        //     select: '-_id -__v',
        //     populate: [{
        //         path: 'city',
        //         model: CityModel,
        //         select: 'city name -_id'
        //     }, {
        //         path: 'state',
        //         model: StateModel,
        //         select: 'state name -_id'
        //     }, {
        //         path: 'country',
        //         model: CountryModel,
        //         select: 'country name -_id'
        //     }]
        // })
        .select().exec();
};

UserSchema.statics.count = function () {
    return this.countDocuments();
};

UserSchema.statics.keyProps = function () {
    return this.find().select(USER_KEY_FIELDS).sort('name').exec();
};

UserSchema.statics.byUserRoles = function (roles) {
    return this
        .find({ roles })
        .select(FIELDS_GET_PUBLIC_PROFILE)
        .exec();
};

UserSchema.statics.hasAccount = function (userInfo) {
    return this
        .findOne({
            $or: [
                { email: userInfo },
                { userId: userInfo }
            ]
        })
        // .select(USER_QUERY_FIELDS)
        .exec();
};

UserSchema.statics.changeUserPin = function (email, newUserPin) {
    return this.updateOne(
        { email },
        { $set: { userPin: newUserPin } },
        { upsert: false }
    ).exec();
};

UserSchema.statics.editProfile = function (userId, profileId, data) {
    return this.updateOne(
        { userId: profileId },
        { $set: { ...data, vAuthUser: userId } },
        { upsert: false }
    ).exec();
};

UserSchema.statics.editRoles = function (userId, newRoles, vAuthUser) {
    return this.updateOne(
        { userId },
        { $set: { roles: newRoles, vAuthUser } },
        { upsert: false }
    ).exec();
};

UserSchema.statics.saveUser = function (user) {
    // console.log('saveUser', user);
    return user.save();
};

/**
 * Add Custom instance methods
 * =========================
 * Do not declare methods using ES6 arrow functions (=>)
 * rrow functions explicitly prevent binding this
 */

UserSchema.methods.validateUserPin = function (pwd) {
    return compareSync(pwd, this.userPin);
};

UserSchema.methods.tokenFields = function () {
    return {
        userId: this.userId,
        email: this.email,
        // groups: [...this.groups],
        roles: [...this.roles]
    };
};

export const UserModel = model('User', UserSchema);
