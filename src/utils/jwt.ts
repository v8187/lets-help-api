import { Request } from 'express';
import { sign, decode, verify, SignCallback, VerifyCallback } from 'jsonwebtoken';

const { JWT_SECRET, JWT_EXPIRE_IN } = process.env;

const JWT_ALGORITHM = 'HS256';

export const newToken = (payload: ITokenFields, callback: SignCallback) => {
    sign({
        userId: payload.userId,
        email: payload.email,
        roles: payload.roleIds,
        permissions: payload.permissions,
        iat: Math.floor(Date.now() / 1000)
    }, JWT_SECRET || '', {
        algorithm: JWT_ALGORITHM,
        expiresIn: JWT_EXPIRE_IN
    }, (errSign, encoded) => {
        console.log('newToken', errSign, encoded);
        callback && callback(errSign, encoded);
    });
};

export const validate = (token: string, callback: VerifyCallback) => {
    verify(token, JWT_SECRET || '', {
        algorithms: [JWT_ALGORITHM]
    }, (errVerify, decoded) => {
        console.log('validate', errVerify, decoded);
        callback && callback(errVerify, decoded);
    });
};

export const extract = (token: string) => {
    return decode(token, {
        complete: true,
        json: true
    });
};

export const getToken = (req: Request) => {
    return req.headers?.authorization?.replace('Bearer ', '');
};