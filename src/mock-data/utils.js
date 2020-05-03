import { randomItem } from '@v8187/rs-utils';
import { address, personName, EPersonNameFormats, dateTime, alphanumeric, randomWords } from '@v8187/rs-mock';
import { genders, bloodGroups, addressTypes, frequencies, durations, caseCategories, phoneNoTypes, voteTypes } from '../configs/enum-constants';

const DAY_MILISECONDS = 24 * 60 * 60 * 1000;

export const pName = () => personName({ female: true, male: true, format: EPersonNameFormats.NAME_INITIAL_SURNAME });
export const email = (name) => `${name.replace(/\s+/g, '.')}@gmail.com`.replace(/\.+/g, '.');
export const phoneType = () => randomItem(phoneNoTypes);
export const phoneNo = () => alphanumeric({ format: '9xxxxxxxxx' });
export const addType = () => randomItem(addressTypes);
export const addr = () => address();
export const pincode = () => alphanumeric({ format: 'xxxxxx' });

export const gender = () => randomItem(genders);
export const bloodgroup = () => randomItem(bloodGroups);

export const dob = () => dateTime({ sqlTimestamp: true, from: +new Date(1975, 0, 1), to: +new Date(2003, 11, 31) });
export const recentDate = () => dateTime({ sqlTimestamp: true, from: (+new Date() - (DAY_MILISECONDS * 60)), to: +new Date() });
export const NYearDate = (num) => dateTime({ sqlTimestamp: true, from: (+new Date() - (DAY_MILISECONDS * 365 * (num || 1))), to: +new Date() });

export const country = () => 'India';
export const state = () => 'Punjab';
export const city = () => randomItem(['Amritsar', 'Jalandhar', 'Ludhiana', 'Chandigarh', 'Pathankot']);

export const bool = () => randomItem([true, false]);
export const title = () => randomWords(4, 6);
export const description = () => randomWords(20, 30);
export const randFrequency = () => randomItem(frequencies);
export const randDur = () => randomItem(durations);
export const caseCat = () => randomItem(caseCategories);
export const voteType = () => randomItem(voteTypes);
export const comments = () => randomWords(4, 30);