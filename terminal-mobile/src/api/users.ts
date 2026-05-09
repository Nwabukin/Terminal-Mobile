import apiClient from './client';
import type { User, ApiResponse } from './types';

export interface MeResponse {
  success: boolean;
  data: User;
}

export async function fetchMe(): Promise<MeResponse> {
  const response = await apiClient.get<MeResponse>('/users/me/');
  return response.data;
}

export async function getMe(): Promise<User> {
  const { data } = await apiClient.get<ApiResponse<User>>('/users/me/');
  if (!data.success || !data.data) {
    throw new Error(data.message || 'Failed to fetch user');
  }
  return data.data;
}

export async function updateMe(
  payload: Partial<User>,
): Promise<User> {
  const { data } = await apiClient.put<ApiResponse<User>>(
    '/users/me/',
    payload,
  );
  if (!data.success || !data.data) {
    throw new Error(data.message || 'Failed to update user');
  }
  return data.data;
}

export async function patchMe(
  payload: Partial<User>,
): Promise<User> {
  const { data } = await apiClient.patch<ApiResponse<User>>(
    '/users/me/',
    payload,
  );
  if (!data.success || !data.data) {
    throw new Error(data.message || 'Failed to patch user');
  }
  return data.data;
}

export async function updateRole(
  payload: { is_owner?: boolean; is_renter?: boolean },
): Promise<User> {
  const { data } = await apiClient.patch<ApiResponse<User>>(
    '/users/me/role/',
    payload,
  );
  if (!data.success || !data.data) {
    throw new Error(data.message || 'Failed to update role');
  }
  return data.data;
}

export async function uploadDocument(
  file: { uri: string; type?: string; name?: string },
  documentType: string,
): Promise<void> {
  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    type: file.type ?? 'image/jpeg',
    name: file.name ?? 'document.jpg',
  } as any);
  formData.append('document_type', documentType);

  await apiClient.post('/users/me/documents/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}
