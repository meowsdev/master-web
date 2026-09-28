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
  activeProfile?: any;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

export interface RequestOtpDto {
  phoneNumber: string;
}

export interface VerifyOtpDto {
  phoneNumber: string;
  code: string;
}

export interface TechnicianLoginDto {
  phoneNumber: string;
  password: string;
}

export interface CompleteProfileDto {
  fullName?: string;
  email?: string;
  role?: UserRole;
}
