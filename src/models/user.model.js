import { model } from 'mongoose';
import { compareSync } from 'bcryptjs';

import { BaseSchema, commonShemaOptions, defineCommonVirtuals } from './BaseSchema';
import {
    USER_KEY_FIELDS, 
    FIELDS_USER_ROLE_POPU, FIELDS_BLOOD_GROUP_POPU
} from '../configs/query-fields';
import { genders } from '../configs/enum-constants';

const FIELDS_MY_PROFILE_GET = '-_id -userPin -deviceToken -deviceOS -__v -status';

const UserSchema = new BaseSchema({
    // Account Fields
    userId: { type: String, trim: true },
    userPin: { type: String, require: true, trim: true },
    isVerified: { type: Boolean, },
    roleIds: [{ type: Number, required: true }],

    // Personal Fields
    name: { type: String, trim: true },
    gender: { type: String, enum: genders, lowercase: true, trim: true },
    dob: { type: Date },
    bgId: { type: Number },

    // Communication Fields
    email: { type: String, lowercase: true, required: true },
    address: { type: String, trim: true },
    contactNo: { type: String, trim: true },
    alternateNo1: { type: String, trim: true },
    alternateNo2: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true },

    // Misc Fields
    referredById: { type: String, trim: true },
    joinedOn: Date,

    // Privacy fields
    showEmail: { type: Boolean, },
    showContactNos: { type: Boolean, },
    showBloodGroup: { type: Boolean, },
    showAddress: { type: Boolean, },
    showContributions: { type: Boolean, },
    showBirthday: { type: Boolean, },
    deviceToken: { type: String },
    deviceOS: { type: String }
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
UserSchema.virtual('roles', {
    ref: 'UserRole',
    localField: 'roleIds',
    foreignField: 'urId'
});

UserSchema.virtual('bloodGroup', {
    ref: 'BloodGroup',
    localField: 'bgId',
    foreignField: 'bgId',
    justOne: true
});

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

UserSchema.post('save', async function ($user, next) {

    await $user.populate('createdBy', USER_KEY_FIELDS)
        .populate('updatedBy', USER_KEY_FIELDS)
        .populate('referredBy', USER_KEY_FIELDS)
        .execPopulate();

    next();
});

/*
 * Add Custom static methods
 * =========================
 * 
 * Do not declare methods using ES6 arrow functions (=>). 
 * Arrow functions explicitly prevent binding this
 */
// UserSchema.statics.list = function () {
//     return this
//         .aggregate([
//             { $match: {} },
//             // ...lookupUserFields('referredById', 'referredBy')
//         ])
//         .project({ userId: 1, name: 1, joinedOn: 1, _id: 0 })
//         .sort('name')
//         .exec();
// };

UserSchema.statics.list = function () {
    return this
        .aggregate([{ $match: {} }])
        .project({
            userId: 1, name: 1, joinedOn: 1, email: 1,
            contactNo: 1, alternateNo1: 1, alternateNo2: 1, _id: 0
        })
        .sort('name')
        .exec();
};

// UserSchema.statics.userProfile = function (userId) {
//     return this
//         .aggregate([{ $match: { userId } }, { $limit: 1 }])
//         .project({
//             userId: 1, name: 1, gender: 1, joinedOn: 1, isVerified: 1,
//             roles: 1, city: 1, state: 1, country: 1,
//             ...conditionalField('contactNo', 'showContactNos'),
//             ...conditionalField('alternateNo1', 'showContactNos'),
//             ...conditionalField('alternateNo2', 'showContactNos'),
//             ...conditionalField('email', 'showEmail'),
//             ...conditionalField('bloodGroup', 'showBloodGroup'),
//             ...conditionalField('address', 'showAddress'),
//             // ...conditionalField('email', 'showContributions'),
//             ...conditionalField('dob', 'showBirthday'),
//             _id: 0
//         })
//         .exec();
// };

UserSchema.statics.userProfile = function (userId) {
    return this
        // .aggregate([
        //     { $match: { userId } },
        //     ...lookupUserFields('createdById', 'createdBy'),
        //     ...lookupUserFields('updatedById', 'updatedBy'),
        //     ...lookupRefFields('referredById', 'referredBy'),
        //     { $project: { _id: 0, userPin: 0, deviceToken: 0, __v: 0 } }
        // ]);
        .findOne({ userId })
        .populate('createdBy', USER_KEY_FIELDS)
        .populate('updatedBy', USER_KEY_FIELDS)
        .populate('referredBy', USER_KEY_FIELDS)
        .populate('roles', FIELDS_USER_ROLE_POPU)
        .populate('bloodGroup', FIELDS_BLOOD_GROUP_POPU)
        .select(FIELDS_MY_PROFILE_GET)
        .exec();
};

UserSchema.statics.byUserId = function (userId) {
    // console.log('USER_SELF_QUERY_FIELDS', USER_SELF_QUERY_FIELDS);
    return this
        .findOne({ userId })
        .populate('createdBy', USER_KEY_FIELDS)
        .populate('updatedBy', USER_KEY_FIELDS)
        .populate('referredBy', USER_KEY_FIELDS)
        .populate('roles', FIELDS_USER_ROLE_POPU)
        .populate('bloodGroup', FIELDS_BLOOD_GROUP_POPU)
        .select(FIELDS_MY_PROFILE_GET)
        .exec();
};

UserSchema.statics.tempAll = function () {
    return this.find()
        .populate('createdBy', USER_KEY_FIELDS)
        .populate('updatedBy', USER_KEY_FIELDS)
        .populate('referredBy', USER_KEY_FIELDS)
        .populate('roles', FIELDS_USER_ROLE_POPU)
        .populate('bloodGroup', FIELDS_BLOOD_GROUP_POPU)
        // .populate('contactNo', PHONE_QUERY_FIELDS)
        // .populate('city', 'city name -_id')
        // .populate('state', 'state name -_id')
        // .populate('country', 'country name -_id')
        // .populate({
        //     path: 'address',
        //     model: AddressModel,
        //     select: '-_id -__v -status',
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

UserSchema.statics.getDeviceTokens = function (roles) {
    return this
        .find({
            roles,
            deviceToken: { $ne: undefined }
        })
        .select('-_id deviceToken userId')
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
    return this.findOneAndUpdate(
        { email },
        { $set: { userPin: newUserPin } },
        { upsert: false }
    )
        .populate('createdBy', USER_KEY_FIELDS)
        .populate('updatedBy', USER_KEY_FIELDS)
        .populate('referredBy', USER_KEY_FIELDS)
        .select('-_id -__v -status').exec();
};

UserSchema.statics.editProfile = function (vAuthUser, userId, data) {
    return this.findOneAndUpdate(
        { userId },
        { $set: { ...data, vAuthUser } },
        { upsert: false, new: true, }
    )
        .populate('createdBy', USER_KEY_FIELDS)
        .populate('updatedBy', USER_KEY_FIELDS)
        .populate('referredBy', USER_KEY_FIELDS)
        .select(FIELDS_MY_PROFILE_GET).exec();
};

UserSchema.statics.setDevice = function (userId, deviceInfo) {
    return this.updateOne(
        { userId },
        { $set: { ...deviceInfo, vAuthUser: userId } },
        { upsert: false, new: true, }
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
    console.log('this.roles = %o', this.roleIds);
    return {
        userId: this.userId,
        email: this.email,
        // groups: [...this.groups],
        roleIds: this.roleIds ? [...this.roleIds] : []
    };
};

export const UserModel = model('User', UserSchema);