// export const   USER_SELF_QUERY_FIELDS = 'userId email provider isVerified roles groups ' +
//     'name gender dob picture bloodGroup ' +
//     'email addresses phoneNos location ' +
//     'referredBy joinedOn createdBy updatedById' +
//     'showBloodGroup showPhoneNos showAddresses showEmail showContributions showBirthday showBirthOfyear showPicture ' +
//     '-_id';
export const USER_SELF_QUERY_FIELDS = '-_id -userPin -__v';
export const USER_PUBLIC_QUERY_FIELDS = 'userId email roles groups ' +
    'name gender picture bloodGroup ' +
    'email addresses phoneNos location ' +
    'referredBy joinedOn ' +
    '-_id';

export const USER_KEY_FIELDS = 'userId email name email -_id';

export const ADDRESS_QUERY_FIELDS = 'addressId userId contactName phoneNo line1 line2 landmark city state country postalCode latitude longitude isDefault type -_id';

export const PHONE_QUERY_FIELDS = 'phoneNoId userId number type -_id';

export const CASE_KEY_FIELDS = 'caseId caseTitle -_id';
export const CASE_ADMIN_QUERY_FIELDS = '-_id -__v';
export const CASE_PUBLIC_QUERY_FIELDS = '-_id -userPin -__v -createdById -updatedById -createdOn -updatedOn';