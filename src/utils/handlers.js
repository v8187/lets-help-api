import httpStatus from 'http-status-codes';
import rUpdate from 'react-addons-update';

const ARRAYTOOBJECT_ROUTES = ['userProfile', 'caseInfo'];

const arrayToObject = (res, data) => {
    const hasRoute = ARRAYTOOBJECT_ROUTES.some(route => res.req.url.indexOf(route) !== -1);
    return hasRoute && Array.isArray(data) ? data[0] : data;
};

export const sendResponse = (res, params) => {

    let resContent = rUpdate({}, { $merge: params });

    const { error } = resContent;
    resContent.OK = !error;

    res.status(httpStatus[params.type || 'OK']);

    // if (/unauthorized/i.test(error)) {
    if (params.type === 'UNAUTHORIZED') {
        // res.status(httpStatus.UNAUTHORIZED);
        // resContent.error = httpStatus.getStatusText(httpStatus.UNAUTHORIZED);
        resContent.message = resContent.message || 'You are not authroized to perform this action.';
    }
    // else if (/failed/i.test(error)) {
    else if (params.type === 'INTERNAL_SERVER_ERROR') {
        // res.status(httpStatus.INTERNAL_SERVER_ERROR);
        // resContent.error = httpStatus.getStatusText(httpStatus.INTERNAL_SERVER_ERROR);
        resContent.message = resContent.message || 'Something went wrong while processing your request. Try again later.';
    }
    // else if (/invalid|wrong|incorrect|missing/i.test(error)) {
    else if (params.type === 'BAD_REQUEST') {
        // res.status(httpStatus.BAD_REQUEST);
        // resContent.error = httpStatus.getStatusText(httpStatus.BAD_REQUEST);
        resContent.message = resContent.message || 'Required fields are incorrect / missing.';
    }
    else {
        if (resContent.data instanceof Array) {
            resContent.count = resContent.data.length;
        }
        else if (resContent.data && resContent.data.nModified === 1) {
            delete resContent.data;
        }
    }

    res.json(resContent);
};

export const handleModelRes = (promise, res, options = {}) => {
    promise.then(
        dbRes => {
            console.log('res.req.url = %o', res.req.url);
            dbRes === null ? sendResponse(res, {
                error: 'Invalid values',
                message: options.ifNull || '',
                type: 'BAD_REQUEST'
            }) : sendResponse(res, {
                data: options.onSuccess ? options.onSuccess(dbRes) : dbRes, //arrayToObject(res, dbRes),
                message: options.success || ''
            });
        }, dbErr => {
            console.log(dbErr);
            if (/invalid/i.test(dbErr.message) || /must be array/i.test(dbErr.message)) {
                return sendResponse(res, {
                    error: 'Invalid values',
                    message: dbErr.message || options.error,
                    type: 'BAD_REQUEST'
                });
            }
            return sendResponse(res, {
                error: dbErr,
                message: options.error || 'Cannot handle request. Try again later',
                type: 'INTERNAL_SERVER_ERROR'
            });
        }
    ).catch(dbReason => {
        console.log(dbReason);
        sendResponse(res, {
            error: dbReason,
            message: options.error || 'Cannot handle request. Try again later',
            type: 'INTERNAL_SERVER_ERROR'
        });
    });
};

export const setReqMetadata = (req, data) => {
    req[process.env.APP_NAME] = req[process.env.APP_NAME] || {};
    req[process.env.APP_NAME] = { ...data };
};

export const getReqMetadata = (req) => {
    return req[process.env.APP_NAME];
};