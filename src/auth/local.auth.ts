import { Strategy } from 'passport-local';

import { UserModel } from '../models/user.model';

const { LC_USER_PIN_FIELD, LC_SESSION, LC_EMAIL_FIELD } = process.env;

const fnVerifyLogin = (
    req, email, userPin, done
) => {
    console.log('local.auth: fnVerifyLogin', req.user);
    process.nextTick(() => {
        UserModel
            .hasAccount(email)
            .then(async (user) => {
                console.log('local.auth: fnVerifyLogin:hasAccount', !!user);
                user && console.log('user.isModified', user.isModified(), 'user.isNew', user.isNew);
                // If User not found
                if (!user) {
                    return done(null, false, {
                        message: `User not found`
                    });
                }
                if (!user.validateUserPin(userPin)) {
                    return done(null, false, {
                        message: `Invalid userPin`
                    });
                }
                let parsedUser = await user.tokenFields();
                return done(null, parsedUser);
            }, modelErr => {
                console.error(modelErr);
                return done(modelErr, false);
            })
            .catch(modelReason => {
                console.log(modelReason);
                return done(modelReason, false);
            });
    });
};

export const setupAuthLocal = (passport) => {
    // Strategy for Login
    passport.use('local-login', new Strategy({
        passReqToCallback: true,
        usernameField: LC_EMAIL_FIELD,
        passwordField: LC_USER_PIN_FIELD,
        session: LC_SESSION === 'true'
    }, fnVerifyLogin));
};