import apiClient from './client';
import type { AuthTokens, User } from './types';

// --- Request types ---

export interface RegisterRequest {
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  password: string;
  password_confirm: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface VerifyPhoneRequest {
  otp_code: string;
}

export interface RefreshTokenRequest {
  refresh: string;
}

export interface LogoutRequest {
  refresh: string;
}

// --- Response types ---

export interface RegisterResponse {
  success: boolean;
  message: string;
  tokens: AuthTokens;
  user: {
    id: string;
    email: string;
    full_name: string;
    is_owner: boolean;
    is_renter: boolean;
  };
}

export interface LoginResponse {
  access: string;
  refresh: string;
}

export interface VerifyPhoneResponse {
  success: boolean;
  message: string;
}

export interface ResendOtpResponse {
  success: boolean;
  message: string;
}

// --- API functions ---

export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  const response = await apiClient.post<RegisterResponse>('/auth/register/', data);
  return response.data;
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/auth/login/', data);
  return response.data;
}

export async function verifyPhone(data: VerifyPhoneRequest): Promise<VerifyPhoneResponse> {
  const response = await apiClient.post<VerifyPhoneResponse>('/auth/verify-phone/', data);
  return response.data;
}

export async function resendOtp(): Promise<ResendOtpResponse> {
  const response = await apiClient.post<ResendOtpResponse>('/auth/resend-otp/');
  return response.data;
}

export async function refreshToken(data: RefreshTokenRequest): Promise<{ access: string }> {
  const response = await apiClient.post<{ access: string }>('/auth/token/refresh/', data);
  return response.data;
}

export async function logout(data: LogoutRequest): Promise<void> {
  await apiClient.post('/auth/logout/', data);
}
