import { sign, decode, verify } from 'jsonwebtoken';

const { JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRE_IN } = process.env;

export const newToken = (payload, callback) => {
    sign({
        userId: payload.userId,
        email: payload.email,
        roles: payload.roleIds,
        permissions: payload.permissions,
        iat: Math.floor(Date.now() / 1000)
    }, JWT_SECRET, {
        algorithm: JWT_ALGORITHM,
        expiresIn: JWT_EXPIRE_IN
    }, (errSign, encoded) => {
        console.log('newToken', errSign, encoded);
        callback && callback(errSign, encoded);
    });
};

export const validate = (token, callback) => {
    verify(token, JWT_SECRET, {
        algorithms: JWT_ALGORITHM.split(',')
    }, (errVerify, decoded) => {
        console.log('validate', errVerify, decoded);
        callback && callback(errVerify, decoded);
    });
};

export const extract = (token) => {
    return decode(token, {
        complete: true,
        json: true
    });
};

export const getToken = (req) => {
    return req.headers.authorization.replace('Bearer ', '');
};