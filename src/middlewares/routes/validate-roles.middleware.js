import { UserRoleModel } from '../../models/user-role.model';
import { sendResponse, getToken, extract, setReqMetadata } from '../../utils';

/**
 * This Route middleware verifies the request 
 * is made by user with Authorized Roles
 */
export const validatePermissions = async (req, res, next, permissionNames) => {
    if (process.env.DB_FILL_MODE === 'ON') {
        return next();
    }

    let { payload } = extract(getToken(req));

    const userPermsRes = await UserRoleModel.byRoleIds(payload.roles);

    const hasPermission = userPermsRes.some((value) => {
        return value.toObject().permissions.some(per => permissionNames.indexOf(per.name) !== -1)
    });

    // console.log('userPermsRes = %o, uniquePerms = %o', userPermsRes, hasPermission);
    if (hasPermission) {
        setReqMetadata(req, 'permissions', permissionNames);
        return next();
    }

    return sendResponse(res, {
        error: 'Not Allowed',
        message: `You do not have permission to perform this action.`,
        type: 'FORBIDDEN'
    });
};