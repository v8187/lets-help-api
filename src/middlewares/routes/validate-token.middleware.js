import { readFile } from 'fs';

import { sendResponse, setReqMetadata } from '../../utils/handlers';
import { APP_ROOT } from '../../configs/app';
import { getToken, extract } from '../../utils';
import { UserRoleModel } from '../../models/user-role.model';

const unauthorizedRes = (res, msg) => {
    return sendResponse(res, {
        error: 'Not authroized',
        message: msg,
        type: 'UNAUTHORIZED'
    });
};

const errorRes = (res, err) => {
    return sendResponse(res, {
        error: err,
        message: 'Failed to authenticate your request. Try again later.',
        type: 'INTERNAL_SERVER_ERROR'
    });
};

/**
 * This Route middleware authenticates the request 
 * and send the appropiate custom messages for un-authorized requests
 */
export const validateToken = (req, res, next, passport) => {
    if (process.env.DB_FILL_MODE === 'ON') {
        return next();
    }
    passport.authenticate('myJwt', { session: false }, (err, user, info) => {
        console.log('validateToken', { err, user, infoType: info, 'req.headers': req.headers });
        // If there is some error
        if (err) {
            return errorRes(res, err.message);
        }

        if (info) {
            const { message, name } = info;

            if (message === 'No auth token') {
                return unauthorizedRes(res, 'Authorization token is missing.');
            }

            if (name === 'JsonWebTokenError' ||
                message.indexOf('Unexpected token') === 0) {
                return unauthorizedRes(res, 'Authorization token is not valid.');
            }

            if (name === 'TokenExpiredError') {
                return unauthorizedRes(res, 'Authorization token has expired.');
            }

            if (name === 'NotBeforeError') {
                return unauthorizedRes(res, 'Authorization token is not active.');
            }
        }
        // Check if token is nin invalid tokens list
        const invalidTokensFile = `${APP_ROOT}${process.env.INVALID_TOKENS_FILE}`;

        readFile(invalidTokensFile, 'utf8', async (err, fileContent) => {
            if (err) {
                if (err.message.indexOf('no such file or directory') !== -1) {
                    // Set userId to req temporarly
                    setReqMetadata(req, extract(getToken(req)).payload);
                    return next();
                } else {
                    return errorRes(res, err.message);
                }
            }
            const token = getToken(req);

            if (JSON.parse(fileContent).some(tkn => tkn.token === token)) {
                return unauthorizedRes(res, 'Authorization token is not valid.');
            }

            let { payload } = extract(token);

            const userPermsRes = await UserRoleModel.byRoleIds(payload.roles);
            const permissionNames = [];

            userPermsRes.map(grpPer => {
                grpPer.toObject().permissions.map(per => {
                    permissionNames.indexOf(per.name) === -1 && permissionNames.push(per.name);
                });
            });

            // Set userId to req temporarly
            setReqMetadata(req, { ...payload, permissionNames });
            return next();
        });
    })(req, res, next);
};