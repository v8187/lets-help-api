import { Router } from 'express';

import * as enums from '../configs/enum-constants';
import { handleModelRes } from '../utils';
// import { deepCopy } from '@v8187/rs-utils';

const router = Router();

// Middleware that is specific to this router
router.use((req, res, next) => {
    // Log for all requests
    console.log('Router: API: Enum Values: Request made');
    next();
});

// Country Routes
router.get('/', (req, res) => {
    // let enumsCopy = deepCopy(enums);
    // // Remove server only enum constants
    // delete enumsCopy.authProviders;
    // delete enumsCopy.refModels;

    handleModelRes(new Promise(resolve => resolve(enums)), res);
});

export const enumValuesRouter = router;