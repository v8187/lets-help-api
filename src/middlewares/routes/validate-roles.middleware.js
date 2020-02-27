import { sendResponse, getToken, extract } from '../../utils';

/**
 * This Route middleware verifies the request 
 * is made by user with Authorized Roles
 */
export const validateRoles = (req, res, next, roles) => {

    let { payload } = extract(getToken(req));

    if (payload.roles.indexOf(roles) === -1) {
        return sendResponse(res, {
            error: 'Not Allowed',
            message: `You do not have permission to perform this action.`,
            type: 'FORBIDDEN'
        });
    }

    return next();
};