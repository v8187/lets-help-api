import { readFile, writeFile } from 'fs';

import { BaseController } from './BaseController';
import { UserModel } from '../models/user.model';
import { sendResponse, getReqMetadata } from '../utils/handlers';
import { newToken, extract, getToken } from '../utils';
import { APP_ROOT } from '../configs/app';

const hasAccountErr = (res, err = 'Server error') => {
    return sendResponse(res, {
        error: err,
        message: `Cannot check account. Try again later`,
        type: 'INTERNAL_SERVER_ERROR'
    });
};

const signUpErr = (res, err = 'Server error') => {
    return sendResponse(res, {
        error: err,
        message: `Cannot create account. Try again later`,
        type: 'INTERNAL_SERVER_ERROR'
    });
};

const logoutErr = (res, err = 'Server error') => {
    return sendResponse(res, {
        error: err,
        message: `Could not logout at this moment. Try again later`,
        type: 'INTERNAL_SERVER_ERROR'
    });
};

const createNewUser = (email, userPin, res) => {
    let newUser = new UserModel(),
        userData = {
            provider: 'local',
            email,
            userPin
        };

    UserModel
        .saveUser(Object.assign(newUser, userData))
        .then(savedUser => {
            // If Signup was successful, generate and bind new Token
            newToken(savedUser.tokenFields(), (err, token) => {
                if (err) {
                    console.log('err.stack', err.stack);
                    return signUpErr(res, err.message);
                }
                sendResponse(res, {
                    message: 'Sign Up is successfully done!!!',
                    data: token
                });
            });
        }, saveErr => {
            console.log('saveErr', saveErr);
            return signUpErr(res, saveErr.message);
        })
        .catch(saveReason => {
            console.log('saveReason', saveReason);
            return signUpErr(res, saveReason.message);
        });
};

export class AuthController extends BaseController {

    hasAccount(req, res, next, passport) {

        const { email } = req.body;

        UserModel.hasAccount(email).then(user => {
            sendResponse(res, {
                message: !!user? `${email} exists.`: `${email} does not exist.`,
                data: {
                    hasAccount: !!user
                }
            });
        }, modelErr => {
            console.error(modelErr);
            return hasAccountErr(res, modelErr.message);
        }).catch(modelReason => {
            console.log(modelReason);
            return hasAccountErr(res, modelReason.message);
        });
    }

    userPin(req, res, next, passport) {

        const { email, userPin } = req.body;

        UserModel.hasAccount(email).then(user => {
            if (user) {
                return sendResponse(res, {
                    error: 'Sign Up failed',
                    message: `User already exist with "${email}".`,
                    type: 'CONFLICT'
                });
            }
            createNewUser(email, userPin, res);
        }, modelErr => {
            console.error(modelErr);
            return signUpErr(res, modelErr.message);
        }).catch(modelReason => {
            console.log(modelReason);
            return signUpErr(res, modelReason.message);
        });
    }

    login(req, res, next, passport) {
        newToken({ ...getReqMetadata(req, 'user') }, (err, token) => {
            if (err) {
                return sendResponse(res, {
                    error: err.message,
                    message: `Could not login at this moment. Try again later`,
                    type: 'INTERNAL_SERVER_ERROR'
                });
            }
            sendResponse(res, {
                message: 'You are logged in successfully!!!',
                data: token
            });
        });

    }

    logout(req, res, next, passport) {
        const invalidTokensFile = `${APP_ROOT}${process.env.INVALID_TOKENS_FILE}`;

        readFile(invalidTokensFile, 'utf8', (err, fileContent) => {
            if (err && err.message.indexOf('no such file or directory') === -1) {
                return logoutErr(res, err.message);
            }
            const token = getToken(req),
                decoded = extract(token);

            console.log('decoded', decoded);
            const newData = {
                token,
                userId: decoded.payload.userId,
                validTill: decoded.payload.exp
            };

            let jsonData;
            // If content/file not available, create new one
            if (!fileContent) {
                jsonData = [newData];
            } else {
                jsonData = JSON.parse(fileContent);
                // Clear the invalid tokens
                jsonData = jsonData.filter(tkn => {
                    const dt = new Date(1970);

                    dt.setSeconds(tkn.validTill)

                    return dt.getTime() > new Date().getTime();
                });
                jsonData.push(newData);
            }
            writeFile(invalidTokensFile, JSON.stringify(jsonData), 'utf8', (err) => {
                console.log('writeFile:: err, data', err);
                if (err) {
                    return logoutErr(res, err.message);
                }
                req.logout();
                return sendResponse(res, {
                    message: 'You are logged out successfully!!!'
                });
            });
        });
    }

    findOrCreate(
        userData,
        done
    ) {
        UserModel
            .hasAccount(userData.userId)
            .then(user => {
                console.log(`LocalAuthController: findOrCreate: ${userData.provider} :hasAccount`, !!user);

                // If User already exists with given profile
                if (user) {
                    // console.log('user.isModified', user.isModified(), 'user.isNew', user.isNew);
                    return done(null, user);
                }
                let newUser = new UserModel();

                UserModel
                    .saveUser(Object.assign(newUser, userData))
                    .then(savedUser => {
                        console.log('savedUser', savedUser);
                        return done(null, savedUser);
                    }, saveErr => {
                        console.log('saveErr', saveErr);
                        return done(saveErr, false);
                    })
                    .catch(saveReason => {
                        console.log('saveReason', saveReason);
                        return done(saveReason, false);
                    });
            }, findErr => {
                console.error('findErr', findErr);
                return done(findErr, false);
            })
            .catch(findReason => {
                console.log('findReason', findReason);
                return done(findReason, false);
            });
    }
}