export const USER_KEY_FIELDS = 'userId name email -_id';
export const FIELDS_PUT_DEVICE_INFO = 'deviceToken,deviceOS';
// own user profile
export const FIELDS_GET_OWN_PROFILE = '-_id -userPin -deviceToken -deviceOS -__v -status';
export const FIELDS_PUT_OWN_PROFILE = 'name,gender,dob,bgId,address,contactNo,alternateNo1,alternateNo2,city,state,country,showEmail,showContactNos,showBloodGroup,showAddress,showContributions,showBirthday';
// user profile by Admin
export const FIELDS_GET_USER_PROFILE = FIELDS_GET_OWN_PROFILE + ' -showEmail -showContactNos -showBloodGroup -showAddress -showContributions -showBirthday';
export const FIELDS_PUT_USER_PROFILE = 'isVerified,roleIds,referredById,joinedOn,contactNo,alternateNo1,alternateNo2';
export const FIELDS_POST_USER_PROFILE = 'name,gender,dob,bgId,address,contactNo,alternateNo1,alternateNo2,city,state,country,email,isVerified,roleIds,referredById,joinedOn';
// user profile by all other users
export const FIELDS_GET_PUBLIC_PROFILE = 'userId email roles contactNo alternateNo1 alternateNo2 name gender referredBy joinedOn -_id';
// case details by all other users
export const FIELDS_GET_CASE_ALL = '-_id -__v -status';
export const CASE_KEY_FIELDS = 'caseId title -_id';
export const CASE_ADMIN_QUERY_FIELDS = '-_id -__v -status';
export const CASE_PUBLIC_QUERY_FIELDS = '-_id -__v -status -createdById -updatedById -createdOn -updatedOn';
// Case Create/Update fields based on Role
export const FIELDS_CREATE_CASE = 'ctId,relId,referredOn,contactNo,title,name,contactPerson,description,gender,age,address,city,state,country,referredBy';
export const FIELDS_CREATE_CASE_ADMIN = FIELDS_CREATE_CASE + ',isApproved,approvedOn,isClosed,closedOn,closingReason,showContactNos,showAddress';

export const FIELDS_TRANSACTION_AD_SEARCH = 'transType,minAmount,maxAmount,fromDate,toDate,forCase,fromUser,transMode,spentBy';
export const FIELDS_TRANSACTION_REQUIRED = 'transType,amount,forMonth,forYear,transDate,remarks';
export const FIELDS_TRANSACTION_ADD_UPDATE = FIELDS_TRANSACTION_REQUIRED + ',forCaseId,spentById,fromUserId,transMode,bankDetails,upiDetails,ewalletDetails';

export const FIELDS_USER_ROLE = 'name,permIds';
export const FIELDS_USER_ROLE_POPU = 'name urId -_id';
export const FIELDS_PERMISSION = 'name';
export const FIELDS_PERMISSION_POPU = 'name permId -_id';
export const FIELDS_CASE_TYPE = 'name';
export const FIELDS_CASE_TYPE_POPU = 'name ctId -_id';
export const FIELDS_RELATIONSHIP = 'name';
export const FIELDS_RELATIONSHIP_POPU = 'name relId -_id';
export const FIELDS_BLOOD_GROUP = 'name';
export const FIELDS_BLOOD_GROUP_POPU = 'name bgId -_id';