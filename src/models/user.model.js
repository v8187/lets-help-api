import { Schema, model } from 'mongoose';
import { compareSync } from 'bcryptjs';

import { BaseSchema, commonShemaOptions, defineCommonVirtuals } from './BaseSchema';
import {
    USER_KEY_FIELDS, USER_PUBLIC_QUERY_FIELDS, USER_SELF_QUERY_FIELDS, PHONE_QUERY_FIELDS
} from './query-fields';
import { userGroups, userRoles, authProviders, genders, bloodGroups } from '../configs/enum-constants';
import { isEmail } from '../utils';

const UserSchema = new BaseSchema({
    // Account Fields
    userId: { type: String },
    userPin: {
        type: String, require: function () { return ['local'].indexOf(this.provider) !== -1; }
    },
    provider: { type: String, enum: authProviders, lowercase: true, required: true },
    isVerified: { type: Boolean, default: false },
    roles: {
        type: Schema.Types.EnumArray, default: ['default'], enum: userRoles, required: true
    },
    groups: {
        type: Schema.Types.EnumArray, default: ['default'], enum: userGroups, required: true
    },

    // Personal Fields
    name: { type: String, required: false },
    gender: { type: String, enum: genders, lowercase: true },
    dob: { type: Date },
    picture: { type: String, required: false },
    bloodGroup: { type: String, enum: bloodGroups, lowercase: false },

    // Communication Fields
    email: {
        type: String, lowercase: true, required: true
    },
    location: { type: String },
    address: { type: String },
    phoneNos: [{ type: String }],
    city: { type: String },
    state: { type: String },
    country: { type: String },

    // Misc Fields
    referredById: { type: String },
    joinedOn: { type: Date },

    // Privacy fields
    showBloodGroup: { type: Boolean, default: false },
    showPhoneNos: { type: Boolean, default: false },
    showAddresses: { type: Boolean, default: false },
    showEmail: { type: Boolean, default: false },
    showContributions: { type: Boolean, default: false },
    showBirthday: { type: Boolean, default: false },
    showBirthOfyear: { type: Boolean, default: false },
    showPicture: { type: Boolean, default: false }
},
    {
        collection: 'User',
        ...commonShemaOptions((doc, ret, options) => {
            // delete ret.country;
            // delete ret.state;
            // delete ret.city;

            // if (ret.city && ret.city.state) {
            //     ret.state = ret.city.state;
            //     ret.country = ret.city.country;

            //     delete ret.city.state;
            //     delete ret.city.country;
            // }

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

    if (user.provider !== 'local') {
        return next();
    }
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
        .select(USER_PUBLIC_QUERY_FIELDS)
        .exec();
};

UserSchema.statics.tempAll = function () {
    return this.find()
        .populate('createdBy', USER_KEY_FIELDS)
        .populate('updatedBy', USER_KEY_FIELDS)
        .populate('phoneNos', PHONE_QUERY_FIELDS)
        .populate('referredBy', USER_KEY_FIELDS)
        .populate('city', 'city name -_id')
        .populate('state', 'state name -_id')
        .populate('country', 'country name -_id')
        .populate({
            path: 'addresses',
            model: AddressModel,
            select: '-_id -__v',
            populate: [{
                path: 'city',
                model: CityModel,
                select: 'city name -_id'
            }, {
                path: 'state',
                model: StateModel,
                select: 'state name -_id'
            }, {
                path: 'country',
                model: CountryModel,
                select: 'country name -_id'
            }]
        })
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
        .populate('phoneNos', PHONE_QUERY_FIELDS)
        .populate('referredBy', USER_KEY_FIELDS)
        .populate('city', 'city name -_id')
        .populate('state', 'state name -_id')
        .populate('country', 'country name -_id')
        .populate({
            path: 'addresses',
            model: AddressModel,
            select: '-_id -__v',
            populate: [{
                path: 'city',
                model: CityModel,
                select: 'city name -_id'
            }, {
                path: 'state',
                model: StateModel,
                select: 'state name -_id'
            }, {
                path: 'country',
                model: CountryModel,
                select: 'country name -_id'
            }]
        })
        .select(USER_SELF_QUERY_FIELDS)
        .exec();
};

UserSchema.statics.byUserRoles = function (roles) {
    return this
        .find({ roles })
        .select(USER_PUBLIC_QUERY_FIELDS)
        .exec();
};

UserSchema.statics.byUserGroups = function (groups) {
    return this
        .find({ groups })
        .select(USER_PUBLIC_QUERY_FIELDS)
        .exec();
};

UserSchema.statics.byEmail = function (email) {
    return this
        .findOne({ email })
        .select(USER_PUBLIC_QUERY_FIELDS)
        .exec();
};

UserSchema.statics.byMobile = function (mobile) {
    return this
        .findOne({ mobile })
        .select(USER_PUBLIC_QUERY_FIELDS)
        .exec();
};

UserSchema.statics.hasAccount = function (userInfo) {
    return this
        .findOne({
            $or: [
                { email: userInfo },
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

UserSchema.statics.editProfile = function (userId, data) {
    return this.updateOne(
        { userId },
        { $set: { ...data, vAuthUser: userId } },
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
        roles: [...this.roles],
        provider: this.provider
    };
};

export const UserModel = model('User', UserSchema);