import { sendResponse, getReqMetadata } from '../../utils';

/**
 * This Route middleware verifies the request 
 * is made by user with Authorized Roles
 */
export const validatePermissions = async (req, res, next, permissions) => {
    if (process.env.DB_FILL_MODE === 'ON') {
        return next();
    }

    let { permissionNames } = getReqMetadata(req);

    const hasPermission = permissionNames.some(per => permissions.indexOf(per) !== -1);

    if (hasPermission) {
        return next();
    }

    return sendResponse(res, {
        error: 'Not Allowed',
        message: `You do not have permission to perform this action.`,
        type: 'FORBIDDEN'
    });
};