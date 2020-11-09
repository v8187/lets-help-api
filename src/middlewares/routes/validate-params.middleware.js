import { sendResponse } from '../../utils/handlers';

/**
 * This Route middleware verifies the request 
 * has given params or not
 */
export const validateParams = (req, res, next, params, atleastOneParam = false) => {

    const arrParams = params.split(',');

    if (atleastOneParam) {
        const keys = Object.keys(req.body || req.params);

        return keys.length ? next() : sendResponse(res, {
            error: 'Parameters missing/invalid',
            message: `Atleast one parameter is required.`,
            type: 'BAD_REQUEST'
        });
    }

    if ((!req.body && !req.params) || arrParams.some(prm => (!req.body[prm] && !req.params[prm]))) {
        return sendResponse(res, {
            error: 'Parameters missing/invalid',
            message: `${arrParams.join(', ')} is/are missing.`,
            type: 'BAD_REQUEST'
        });
    }

    return next();
};

/**
 * This Route middleware verifies the request 
 * has given params or not
 */
export const validateParams2 = (req, res, next, params) => {

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