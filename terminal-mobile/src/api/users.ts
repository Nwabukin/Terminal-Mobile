import apiClient from './client';
import type { ApiResponse, User } from './types';

export async function getProfile() {
  const { data } = await apiClient.get<ApiResponse<User>>('/users/me/');
  return data;
}

export async function updateProfile(payload: Partial<User>) {
  const { data } = await apiClient.patch<ApiResponse<User>>('/users/me/', payload);
  return data;
}
