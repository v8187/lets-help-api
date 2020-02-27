import { sendResponse } from '../../utils/handlers';

/**
 * This Route middleware verifies the request 
 * has given params or not
 */
export const validateParams = (req, res, next, params) => {

    const { body } = req,
        arrParams = params.split(',');

    if (!body || arrParams.some(prm => !body[prm])) {
        return sendResponse(res, {
            error: 'Parameters missing/invalid',
            message: `${arrParams.join(', ')} is/are missing.`,
            type: 'BAD_REQUEST'
        });
    }

    return next();
};