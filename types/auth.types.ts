export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  PROVIDER = 'PROVIDER',
  COUNSELOR = 'COUNSELOR',
  TECHNICIAN = 'TECHNICIAN',
  ADMIN = 'ADMIN',
  HR = 'HR',
  MANAGER = 'MANAGER',
  SUPPORT = 'SUPPORT',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export interface User {
  id: string;
  mobileNumber: string;
  name?: string | null;
  email?: string | null;
  dateOfBirth?: string | null;
  profilePhoto?: string | null;
  role: UserRole;
  status: UserStatus;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface RequestOtpDto {
  mobileNumber: string;
}

export interface VerifyOtpDto {
  mobileNumber: string;
  otp: string;
}

export interface CompleteProfileDto {
  name: string;
  email?: string;
  gender?: Gender;
  dateOfBirth?: string;
  role: UserRole;
}
