import { Strategy, ExtractJwt } from 'passport-jwt';

import { UserModel } from '../models/user.model';

const { JWT_SECRET } = process.env;

const fnVerifyJwt = (jwtPayload, done) => {
    console.log('jwt.auth: fnVerifyJwt', jwtPayload);
    const { email } = jwtPayload;
    process.nextTick(() => {
        UserModel
            .hasAccount(email)
            .then(user => {
                console.log('jwt.auth: fnVerifyJwt:hasAccount', !!user);

                // If User exists
                if (user) {
                    return done(null, {
                        email: user.email,
                        userId: user.userId
                    });
                } else {
                    return done(null, false, {
                        message: `User does not exist with ${email}.`
                    });
                }
            }, modelErr => {
                console.error('modelErr', modelErr);
                return done(modelErr, false);
            })
            .catch(modelReason => {
                console.log('modelReason', modelReason);
                return done(modelReason, false);
            });
    });
};

export const setupAuthJwt = (passport) => {
    passport.use('myJwt', new Strategy({
        secretOrKey: JWT_SECRET,
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
    }, fnVerifyJwt));
};