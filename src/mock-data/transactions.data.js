import { bool, NYearDate } from './utils';
import { UserModel } from '../models/user.model';
import { CaseModel } from '../models/case.model';
import { TransactionModel } from '../models/transaction.model';
import { randomItem, randomNum } from '@v8187/rs-utils';
import { transTypes, transModes } from '../configs/enum-constants';
import { randomWords } from '@v8187/rs-mock';
// Add Dump Transactions data
const common = {};

const dumpTransactionsData = new Array(1000).join(',').split(',');

let initiated = 0, added = 0, notAdded = 0, usersData, casesData,
    vikram, gurinder;

const addTransaction = (trans) => {

    const ranDate = NYearDate(3);
    trans = {};

    trans.vAuthUser = randomItem([vikram, gurinder]);
    trans.transType = randomItem(transTypes);
    trans.amount = randomNum(100, 1000);
    trans.forMonth = new Date(ranDate).getMonth() + 1;
    trans.forYear = new Date(ranDate).getFullYear();
    trans.transDate = ranDate;
    trans.transMode = 'cash'; // randomItem(transModes);
    trans.spentById = randomItem(usersData).userId;
    trans.remarks = randomWords(2, 15);

    if (trans.transType === 'c') {
        trans.fromUserId = randomItem(usersData).userId;
    } else {
        trans.forCaseId = randomItem(casesData).caseId;
    }

    initiated++;
    TransactionModel.saveTransaction(Object.assign(new TransactionModel(), trans)).then(
        saveRes => {
            added++;
            if (initiated === added + notAdded) {
                console.log('Transactions: %d added , %d failed to add', added, notAdded);
            }
        },
        saveErr => {
            notAdded++;
            if (initiated === added + notAdded) {
                console.log('Transactions: %d added , %d failed to add', added, notAdded);
            }
        })
        .catch(saveReason => {
            notAdded++;
            if (initiated === added + notAdded) {
                console.log('Transactions: %d added , %d failed to add', added, notAdded);
            }
        });
};

(async () => {
    usersData = (await UserModel.find().select('userId email -_id').exec());
    // usersData = usersData.toArray();

    casesData = (await CaseModel.find().select('caseId -_id').exec());
    // casesData = casesData.toArray();

    vikram = usersData.filter(user => user.email === 'vikram1vicky@gmail.com')[0].userId;
    gurinder = usersData.filter(user => user.email === 'gurinder1god@gmail.com')[0].userId;
    dumpTransactionsData.map(addTransaction);
})();