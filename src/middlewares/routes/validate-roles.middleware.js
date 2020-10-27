import { UserRoleModel } from '../../models/user-role.model';
import { sendResponse, getToken, extract } from '../../utils';

/**
 * This Route middleware verifies the request 
 * is made by user with Authorized Roles
 */
export const validatePermissions = async (req, res, next, permissionName) => {
    if (process.env.DB_FILL_MODE === 'ON') {
        return next();
    }

    let { payload } = extract(getToken(req));

    const userPermsRes = await UserRoleModel.byRoleIds(payload.roles);

    const hasPermission = userPermsRes.some((value) => {
        return value.toObject().permissions.some(per => per.name === permissionName)
    });

    console.log('userPermsRes = %o, uniquePerms = %o', userPermsRes, hasPermission);
    if (hasPermission) {
        return next();
    }

    return sendResponse(res, {
        error: 'Not Allowed',
        message: `You do not have permission to perform this action.`,
        type: 'FORBIDDEN'
    });
};