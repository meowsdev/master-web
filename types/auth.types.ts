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
  username?: string | null;
  districtId?: number | null;
  upazilaId?: number | null;
  email?: string | null;
  dateOfBirth?: string | null;
  profilePhoto?: string | null;
  role: UserRole;
  status: UserStatus;
  isVerified: boolean;
  activeProfile?: RoleProfile | null;
  customerProfile?: RoleProfile | null;
  providerProfile?: RoleProfile | null;
  counselorProfile?: RoleProfile | null;
  technicianProfile?: RoleProfile | null;
  availableRoles?: UserRole[];
  addresses?: Array<{
    id: string;
    addressText: string;
    latitude?: number | null;
    longitude?: number | null;
    isDefault?: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

/** Cookie-session login (OTP): tokens are httpOnly cookies, never in the body. */
export interface SessionResponse {
  user: User;
}

/** Legacy login (technician): tokens still come back in the body. */
export interface AuthResponse extends SessionResponse {
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
  username?: string;
  districtId?: number | null;
  upazilaId?: number | null;
  email?: string;
  profilePhoto?: string;
  role?: UserRole;
}

/** One of a user's role profiles, as far as the screens read it; the backend sends more fields. */
export interface RoleProfile {
  id: string;
  rating?: number | string | null;
  walletBalance?: number | string | null;
  level?: string | null;
  isBlockedForNegative?: boolean | null;
  totalCompletedOrders?: number | null;
  [field: string]: unknown;
}
