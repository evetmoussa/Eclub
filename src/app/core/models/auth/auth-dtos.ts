// auth-dtos.ts — Strongly-typed request bodies for /auth/* endpoints.
// These mirror the back-end swagger schemas exactly.

export interface LoginRequest {
  email?: string;
  membershipId?: string;
  sequenceNumber?: string;
  clubCode?: string;
  password: string;
  isAdmin: boolean;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  nationalId: string;
  isAdmin: boolean;
}

export interface ForgotPasswordRequest {
  email?: string;
  phoneNumber?: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  email?: string;
  phoneNumber?: string;
}

export interface VerifyResetCodeRequest {
  phoneNumber: string;
  code: string;
}

export interface ResendResetCodeRequest {
  phoneNumber: string;
}

export interface ConfirmEmailRequest {
  userId: string;
  code: string;
}

export interface ResendConfirmationRequest {
  email: string;
}

export interface TokenPair {
  token: string;
  refreshToken: string;
}
