import { CaseTypeModel } from '../models/case-type.model';

const actualCaseTypesData = [
    // 'education', 'ration', 'medical', 'legal', 'financial', 'commodity'
    { name: 'education', label: 'Education' },
    { name: 'ration', label: 'Ration' },
    { name: 'medical', label: 'Medical' },
    { name: 'legal', label: 'Legal' },
    { name: 'financial', label: 'Financial' },
    { name: 'commodity', label: 'Commodity' }
];

let initiated = 0, added = 0, notAdded = 0;
const vikram = 'admin';

const addCaseType = ($caseType, callback) => {

    $caseType.vAuthUser = vikram;

    // For Mock Data
    initiated++;
    CaseTypeModel.saveCaseType(Object.assign(new CaseTypeModel(), $caseType)).then(
        saveRes => {
            added++;
            if (initiated === added + notAdded) {
                console.log('CaseTypes: %d added , %d failed to add', added, notAdded);
            }
            callback instanceof Function && callback();
        },
        saveErr => {
            notAdded++;
            if (initiated === added + notAdded) {
                console.log('CaseTypes: %d added , %d failed to add', added, notAdded);
            }
        })
        .catch(saveReason => {
            notAdded++;
            if (initiated === added + notAdded) {
                console.log('CaseTypes: %d added , %d failed to add', added, notAdded);
            }
        });
};

actualCaseTypesData.map(addCaseType);