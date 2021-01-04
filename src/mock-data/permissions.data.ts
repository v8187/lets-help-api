import { fillCollection } from './fetch.api';

import * as permissionsData from '../configs/permissions';

const data = [];

for (let key in permissionsData) {
    data.push({
        name: permissionsData[key]
    });
}

export default (callback) => fillCollection(data, 'api/permission/add', 'Permission', callback);