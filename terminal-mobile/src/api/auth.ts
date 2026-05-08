import apiClient from './client';
import type { ApiResponse, AuthTokens, User } from './types';

export async function login(email: string, password: string) {
  const { data } = await apiClient.post<ApiResponse<AuthTokens & { user: User }>>(
    '/auth/login/',
    { email, password }
  );
  return data;
}

export async function register(payload: {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
}) {
  const { data } = await apiClient.post<ApiResponse<AuthTokens & { user: User }>>(
    '/auth/register/',
    payload
  );
  return data;
}

export async function verifyPhone(otp: string) {
  const { data } = await apiClient.post<ApiResponse<null>>('/auth/verify-phone/', { otp });
  return data;
}

export async function resendOtp() {
  const { data } = await apiClient.post<ApiResponse<null>>('/auth/resend-otp/');
  return data;
}

export async function refreshToken(refresh: string) {
  const { data } = await apiClient.post<{ access: string }>('/auth/token/refresh/', { refresh });
  return data;
}

export async function logout(refresh: string) {
  const { data } = await apiClient.post<ApiResponse<null>>('/auth/logout/', { refresh });
  return data;
}
