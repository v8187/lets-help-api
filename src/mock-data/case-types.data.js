import { fillCollection } from './fetch.api';

const actualCaseTypesData = [
    { name: 'education', label: 'Education' },
    { name: 'ration', label: 'Ration' },
    { name: 'medical', label: 'Medical' },
    { name: 'legal', label: 'Legal' },
    { name: 'financial', label: 'Financial' },
    { name: 'commodity', label: 'Commodity' }
];

export default (callback) => fillCollection(actualCaseTypesData, 'api/caseType/add', 'Case Type', callback);