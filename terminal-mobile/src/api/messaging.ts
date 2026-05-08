import apiClient from './client';
import type { ApiResponse, PaginatedResponse, Thread, Message } from './types';

export async function getThreads() {
  const { data } = await apiClient.get<PaginatedResponse<Thread>>('/messaging/threads/');
  return data;
}

export async function getThread(id: string) {
  const { data } = await apiClient.get<ApiResponse<Thread>>(`/messaging/threads/${id}/`);
  return data;
}

export async function getMessages(threadId: string) {
  const { data } = await apiClient.get<PaginatedResponse<Message>>(
    `/messaging/threads/${threadId}/messages/`
  );
  return data;
}

export async function sendMessage(threadId: string, body: string) {
  const { data } = await apiClient.post<ApiResponse<Message>>(
    `/messaging/threads/${threadId}/messages/`,
    { body }
  );
  return data;
}

export async function getAblyToken() {
  const { data } = await apiClient.get<ApiResponse<{ token: string }>>('/messaging/ably-token/');
  return data;
}
