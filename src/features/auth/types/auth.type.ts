export interface UsersIdentity {
    id: string;
    email: string;
}

export interface UsersStatus {
    status: number;
}

export interface UsersAttempt {
    loginAttempt: number;
    lastLoginTime: string | null;
    otpAttempt: number;
    lastOtpAttempt: string | null;
}

export interface UsersAuditTrail {
    createdAt: string;
    createdBy: string;
    updatedAt: string;
    updatedBy: string;
    flagDelete: number;
}

export interface UsersAttribute {
    role: string;
}

export interface Tokens {
    accessToken: string;
    refreshToken: string;
}

export interface UsersProfile 
extends UsersIdentity,
        UsersAttribute {}