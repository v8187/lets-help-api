import { NextFunction, Request, Response, Router } from 'express';

import * as enums from '../configs/enum-constants';
import { handleModelRes } from '../utils';
// import { deepCopy } from '@v8187/rs-utils';

const router = Router();

// Middleware that is specific to this router
router.use((req: Request, res: Response, next: NextFunction) => {
    // Log for all requests
    console.log('Router: API: Enum Values: Request made');
    next();
});

// Country Routes
router.get('/', (req: Request, res: Response) => {
    // let enumsCopy = deepCopy(enums);
    // Remove server only enum constants
    // delete enumsCopy.refModels;

    handleModelRes(new Promise(resolve => resolve(enums)), res);
});

export const enumValuesRouter = router;