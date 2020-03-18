import { Schema, model } from 'mongoose';
import { compareSync } from 'bcryptjs';

import { BaseSchema, commonShemaOptions, defineCommonVirtuals } from './BaseSchema';
import {
    USER_KEY_FIELDS, FIELDS_GET_PUBLIC_PROFILE, FIELDS_GET_OWN_PROFILE
} from './query-fields';
import { userGroups, userRoles, genders, bloodGroups } from '../configs/enum-constants';
import { isEmail } from '../utils';

const UserSchema = new BaseSchema({
    // Account Fields
    userId: String,
    userPin: { type: String, require: true },
    isVerified: Boolean,
    roles: {
        type: Schema.Types.EnumArray, default: ['default'], enum: userRoles, required: true
    },
    groups: {
        type: Schema.Types.EnumArray, default: ['default'], enum: userGroups, required: true
    },

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
    phoneNos: [{ type: String }],
    city: String,
    state: String,
    country: String,

    // Misc Fields
    referredById: String,
    joinedOn: Date,

    // Privacy fields
    showBloodGroup: Boolean,
    showAddress: Boolean,
    showContributions: Boolean,
    showBirthday: Boolean,
    showBirthOfyear: Boolean
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
    justOne: true
});

// User Schema's save pre hook
UserSchema.pre('save', function (next) {
    let user = this;

    user.createdById = user.updatedById = user.userId = user._id;

    user.joinedOn = new Date();

    if (!user.email) {
        user.email = user.email;
    } else if (!user.email && isEmail(user.email)) {
        user.email = user.email;
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
        .find()
        .sort('name')
        .select(FIELDS_GET_PUBLIC_PROFILE)
        .exec();
};

UserSchema.statics.tempAll = function () {
    return this.find()
        .populate('createdBy', USER_KEY_FIELDS)
        .populate('updatedBy', USER_KEY_FIELDS)
        .populate('referredBy', USER_KEY_FIELDS)
        // .populate('phoneNos', PHONE_QUERY_FIELDS)
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

UserSchema.statics.keyProps = function () {
    return this.find().select(USER_KEY_FIELDS).exec();
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

UserSchema.statics.byUserRoles = function (roles) {
    return this
        .find({ roles })
        .select(FIELDS_GET_PUBLIC_PROFILE)
        .exec();
};

UserSchema.statics.byUserGroups = function (groups) {
    return this
        .find({ groups })
        .select(FIELDS_GET_PUBLIC_PROFILE)
        .exec();
};

UserSchema.statics.byEmail = function (email) {
    return this
        .findOne({ email })
        .select(FIELDS_GET_PUBLIC_PROFILE)
        .exec();
};

UserSchema.statics.byMobile = function (mobile) {
    return this
        .findOne({ mobile })
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

UserSchema.statics.editProfile = function (userId, data) {
    return this.updateOne(
        { userId },
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

UserSchema.statics.editGroups = function (userId, newGroups, vAuthUser) {
    return this.updateOne(
        { userId },
        { $set: { groups: newGroups, vAuthUser } },
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
        groups: [...this.groups],
        roles: [...this.roles]
    };
};

export const UserModel = model('User', UserSchema);