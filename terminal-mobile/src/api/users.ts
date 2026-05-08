import apiClient from './client';
import type { User } from './types';

export interface MeResponse {
  success: boolean;
  data: User;
}

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  bio?: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data: User;
}

export async function fetchMe(): Promise<MeResponse> {
  const response = await apiClient.get<MeResponse>('/users/me/');
  return response.data;
}

export async function updateProfile(data: UpdateProfileRequest): Promise<UpdateProfileResponse> {
  const response = await apiClient.patch<UpdateProfileResponse>('/users/me/', data);
  return response.data;
}
