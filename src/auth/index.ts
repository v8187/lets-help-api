import { setupAuthLocal } from './local.auth';
import { setupAuthJwt } from './jwt.auth';

import { UserModel } from '../models/user.model';

export const setupAuthorization = (passport) => {

    // Passport needs to be able to serialize and deserialize users to support persistent login sessions
    passport.serializeUser((user, done) => {
        console.log('serializing user: ', user.userId);
        done(null, user.userId);
    });

    passport.deserializeUser((userId, done) => {
        console.log('deserializeUser: ', userId);
        UserModel
            .byUserId(userId)
            .then(
                user => {
                    console.log('passport.deserializeUser', user);
                    done(null, user);
                },
                modelErr => {
                    done(modelErr);
                    console.error('passport.deserializeUser', modelErr);
                }
            )
            .catch(modelReason => {
                done(modelReason);
                console.log('passport.deserializeUser', modelReason);
            });
    });

    setupAuthLocal(passport);
    setupAuthJwt(passport);
};