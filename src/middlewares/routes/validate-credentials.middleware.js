import { sendResponse, setReqMetadata } from '../../utils/handlers';

const invalidResponse = (res, msg) => {
    return sendResponse(res, {
        error: 'email/userPin missing/invalid',
        message: msg,
        type: 'BAD_REQUEST'
    });
};

/**
 * This Route middleware handler authenticates the request 
 * and send the appropiate custom messages for un-authorized requests
 */
export const validateCredentials = (req, res, next, passport) => {
    passport.authenticate('local-login', { session: false }, (err, user, info) => {
        console.log('validateCredentials', { err, user, infoType: info });
        // If there is some error
        if (err) {
            return sendResponse(res, {
                error: err.message,
                message: 'Failed to authenticate your request. Try again later.',
                type: 'INTERNAL_SERVER_ERROR'
            });
        }

        if (info) {
            const { message } = info;

            if (message === 'Missing credentials') {
                return invalidResponse(res, 'email or userPin is missing.');
            }

            if (message === 'User not found') {
                return invalidResponse(res, `User does not exist with "${req.body.email}".`);
            }

            if (message === 'Invalid userPin') {
                return invalidResponse(res, 'UserPin is incorrect.');
            }
        }
        if (user) {
            setReqMetadata(req, 'user', user);
            // req[process.env.APP_NAME] = req[process.env.APP_NAME] || {};
            // req[process.env.APP_NAME].user = user;
        }
        return next();
    })(req, res, next);
};