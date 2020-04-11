const userAllField = `userId,userPin,isVerified,roles,
name,gender,dob,,bloodGroup,email,
 address,contactNo,alternateNo1,alternateNo2,city,state,country,
 referredById,joinedOn,showBloodGroup,
 showAddress,showContributions,
 showBirthday`

export const USER_KEY_FIELDS = 'userId name email -_id';
// own user profile
export const FIELDS_GET_OWN_PROFILE = '-_id -userPin -__v';
export const FIELDS_PUT_OWN_PROFILE = 'name,gender,dob,bloodGroup,address,contactNo,alternateNo1,alternateNo2,city,state,country,showEmail,showContactNos,showBloodGroup,showAddress,showContributions,showBirthday';
// user profile by Admin
export const FIELDS_GET_USER_PROFILE = '-_id -userPin -__v -showEmail -showContactNos -showBloodGroup -showAddress -showContributions -showBirthday';
export const FIELDS_PUT_USER_PROFILE = 'isVerified,roles,referredById,joinedOn,contactNo,alternateNo1,alternateNo2';
export const FIELDS_POST_USER_PROFILE = 'name,gender,dob,bloodGroup,address,contactNo,alternateNo1,alternateNo2,city,state,country,email,isVerified,roles,referredById,joinedOn';
// user profile by all other users
export const FIELDS_GET_PUBLIC_PROFILE = 'userId email roles contactNo alternateNo1 alternateNo2 name gender referredBy joinedOn -_id';
// case details by all other users
export const FIELDS_GET_CASE_ALL = '-_id -__v';
export const CASE_KEY_FIELDS = 'caseId title -_id';
export const CASE_ADMIN_QUERY_FIELDS = '-_id -__v';
export const CASE_PUBLIC_QUERY_FIELDS = '-_id -userPin -__v -createdById -updatedById -createdOn -updatedOn';