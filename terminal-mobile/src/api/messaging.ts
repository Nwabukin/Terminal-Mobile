import apiClient from './client';
import { extractPagedItems } from './pagination';
import type { Thread, Message, ApiResponse } from './types';

export interface CreateInquiryPayload {
  listing_id: string;
  initial_message: string;
}

export interface SendMessagePayload {
  body: string;
}

export interface ThreadDetailResponse {
  success: boolean;
  thread: Thread;
  messages: Message[];
}

export async function getThreads() {
  const { data } = await apiClient.get<unknown>('/threads/');
  return { success: true as const, data: extractPagedItems<Thread>(data) };
}

export async function createInquiryThread(payload: CreateInquiryPayload) {
  const { data } = await apiClient.post<ApiResponse<Thread>>('/threads/', payload);
  return data;
}

export async function getThreadDetail(threadId: string) {
  const { data } = await apiClient.get<ThreadDetailResponse>(`/threads/${threadId}/`);
  return data;
}

export async function sendMessage(threadId: string, payload: SendMessagePayload) {
  const { data } = await apiClient.post<ApiResponse<Message>>(
    `/threads/${threadId}/messages/`,
    payload
  );
  return data;
}

export async function getAblyToken() {
  const { data } = await apiClient.post<{ success: boolean; token: any }>(
    '/threads/token/'
  );
  return data;
}
