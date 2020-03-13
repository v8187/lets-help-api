import { randomItem } from '@v8187/rs-utils';
import { address, personName, EPersonNameFormats, dateTime, alphanumeric, randomWords } from '@v8187/rs-mock';
import { genders, bloodGroups, addressTypes, frequencies, durations, caseCategories, phoneNoTypes, voteTypes } from '../configs/enum-constants';

export const pName = () => personName({ female: true, male: true, format: EPersonNameFormats.NAME_INITIAL_SURNAME });
export const email = (name) => `${name.replace(/\s+/g, '.')}@gmail.com`.replace(/\.+/g, '.');
export const phoneType = () => randomItem(phoneNoTypes);
export const phoneNo = () => alphanumeric({ format: '+91-9xxxxxxxxx' });
export const addType = () => randomItem(addressTypes);
export const addr = () => address();
export const pincode = () => alphanumeric({ format: 'xxxxxx' });

export const gender = () => randomItem(genders);
export const bloodgroup = () => randomItem(bloodGroups);

export const dob = () => dateTime({ sqlTimestamp: true, from: +new Date(1975, 0, 1), to: +new Date(2003, 11, 31) });
export const recentDate = () => dateTime({ sqlTimestamp: true, from: +new Date(2018, 0, 1), to: +new Date(2019, 8, 31) });

export const country = () => 'IND';
export const state = () => 377;
export const city = () => randomItem([126210, 128578, 1390, 145691, 22251]);

export const bool = () => randomItem([true, false]);
export const title = () => randomWords(4, 6);
export const description = () => randomWords(20, 30);
export const randFrequency = () => randomItem(frequencies);
export const randDur = () => randomItem(durations);
export const caseCat = () => randomItem(caseCategories);
export const voteType = () => randomItem(voteTypes);
export const comments = () => randomWords(4, 30);