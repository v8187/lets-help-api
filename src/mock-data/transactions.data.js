import { randomItem, randomNum } from '@v8187/rs-utils';
import { randomWords } from '@v8187/rs-mock';

import { NYearDate } from './utils';
const { UserModel } = require('../models/user.model');
const { CaseModel } = require('../models/case.model');
const { TransactionModel } = require('../models/transaction.model');

import { transTypes, transModes } from '../configs/enum-constants';


const mockTransactionsData = new Array(1000).join(',').split(',');

let initiated, added, notAdded;

let onTransactionsAddedCB, usersData, casesData, vikram, gurinder;

function onTransactionsAdded(callback) {
    if (initiated === added + notAdded) {
        console.log('Transactions: %d added , %d failed to add', added, notAdded);
        notAdded === 0 && onTransactionsAddedCB();
    }
}

const addTransaction = (trans) => {

    const ranDate = NYearDate(3);
    trans = new TransactionModel();

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

    trans.save().then(
        saveRes => {
            added++;
            onTransactionsAdded();
        },
        saveErr => {
            notAdded++;
            onTransactionsAdded();
        })
        .catch(saveReason => {
            notAdded++;
            onTransactionsAdded();
        });
};

export default async function (callback) {
    initiated = mockTransactionsData.length; added = 0; notAdded = 0;
    onTransactionsAddedCB = callback;
    usersData = (await UserModel.find().select('userId email -_id').exec());
    casesData = (await CaseModel.find().select('caseId -_id').exec());
    vikram = usersData.filter(user => user.email === 'vikram1vicky@gmail.com')[0].userId;
    gurinder = usersData.filter(user => user.email === 'gurinder1god@gmail.com')[0].userId;

    console.log('usersData = %o, casesData = %o, vikram = %o, gurinder = %o', usersData.length, casesData.length, vikram, gurinder);

    mockTransactionsData.map(addTransaction);
};
