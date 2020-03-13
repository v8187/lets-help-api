const userAllField = `userId,userPin,isVerified,roles,groups,
name,gender,dob,picture,bloodGroup,email,location,
 address,phoneNos,city,state,country,
 referredById,joinedOn,showBloodGroup,
 showPhoneNos,showAddress,showEmail,showContributions,
 showBirthday,showBirthOfyear,showPicture`

export const USER_KEY_FIELDS = 'userId name email -_id';
// own user profile
export const FIELDS_GET_OWN_PROFILE = '-_id -userPin -__v';
export const FIELDS_PUT_OWN_PROFILE = 'name,gender,dob,picture,bloodGroup,email,location,address,phoneNos,city,state,country,showBloodGroup,showPhoneNos,showAddress,showEmail,showContributions,showBirthday,showBirthOfyear,showPicture';
// user profile by Admin
export const FIELDS_GET_USER_PROFILE = '-_id -userPin -__v';
export const FIELDS_PUT_USER_PROFILE = 'isVerified,roles,groups,referredById,joinedOn';
// user profile by all other users
export const FIELDS_GET_PUBLIC_PROFILE = 'userId email roles groups name gender picture location referredBy joinedOn -_id -__v';

export const CASE_KEY_FIELDS = 'caseId caseTitle -_id';
export const CASE_ADMIN_QUERY_FIELDS = '-_id -__v';
export const CASE_PUBLIC_QUERY_FIELDS = '-_id -userPin -__v -createdById -updatedById -createdOn -updatedOn';