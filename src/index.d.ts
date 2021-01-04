declare interface IBloodGroup {
    bgId?: number;
    name?: string;
}

declare interface ICaseType {
    ctId?: number;
    name?: string;
}

declare interface ICase {
    caseId?: string;
    title?: string;
    description?: string;
    name?: string;
    ctId?: number;
    relId?: number;
    contactPerson?: string;
    contactNo?: string;
    alternateNo1?: string;
    alternateNo2?: string;
    gender?: string;
    age?: number;
    isApproved?: 0 | 1;
    approvedOn?: Date;
    referredById?: string;
    referredOn?: Date;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    isClosed?: 0 | 1;
    closedOn?: Date;
    closingReason?: string;
    showContactNos?: boolean;
    showAddress?: boolean;
    upVoters?: string[];
    downVoters?: string[];
}

declare interface IIncrement {
    incrId?: string;
    srNo?: number;
}

declare interface INotification {
    notiId?: string;
    userId?: string;
    title?: string;
    body?: string;
    image?: string;
    data?: any;
    sentOn?: Date;
    isRead?: boolean;
    readOn?: Date;
    isDeleted?: boolean;
    deletedOn?: Date;
}

declare interface IPermission {
    permId?: number;
    name?: string;
}

declare interface IRelationship {
    relId?: number;
    name?: string;
}

declare interface IBankDetails {
    accountName?: string;
    accountNo?: string;
    bankName?: string;
}

declare interface IUPIDetails {
    upiName?: string;
    upiId?: string;
}

declare interface IEWalletDetails {
    ewalletName?: string;
    ewalletNo?: string;
}

declare interface ITransaction {
    transId?: string;
    transType?: string;
    amount?: number;
    forMonth?: number;
    forYear?: number;
    transDate?: Date;
    forCaseId?: string;
    fromUserId?: string;
    transMode?: string;
    bankDetails?: IBankDetails;
    upiDetails?: IUPIDetails;
    ewalletDetails?: IEWalletDetails;
    spentById?: string;
    remarks: string;
}

declare interface IUserRole {
    urId?: number;
    name?: string;
    permIds: number[];
}

declare interface IUser {
    userId?: string;
    userPin?: string;
    isVerified?: boolean;
    roleIds: number[],
    // Personal Fields
    name?: string;
    gender?: string;
    dob?: Date;
    bgId?: number;
    // Communication Fields
    email?: string;
    address?: string;
    contactNo?: string;
    alternateNo1?: string;
    alternateNo2?: string;
    city?: string;
    state?: string;
    country?: string;
    // Misc Fields
    referredById?: string;
    joinedOn?: Date;
    // Privacy fields
    showEmail?: boolean;
    showContactNos?: boolean;
    showBloodGroup?: boolean;
    showAddress?: boolean;
    showContributions?: boolean;
    showBirthday?: boolean;
    deviceToken?: string;
    deviceOS?: string;
}