import { fillCollection } from './fetch.api';

const actualCaseTypesData = [
    // 'education', 'ration', 'medical', 'legal', 'financial', 'commodity'
    { name: 'education', label: 'Education' },
    { name: 'ration', label: 'Ration' },
    { name: 'medical', label: 'Medical' },
    { name: 'legal', label: 'Legal' },
    { name: 'financial', label: 'Financial' },
    { name: 'commodity', label: 'Commodity' }
];

fillCollection(actualCaseTypesData, 'api/caseType/createCaseType', 'Case Type', () => {
    console.log('Case Types added....');
});