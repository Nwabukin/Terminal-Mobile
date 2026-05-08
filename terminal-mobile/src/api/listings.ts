import apiClient from './client';
import type { ApiResponse, PaginatedResponse, Listing } from './types';

export async function getListings(params?: Record<string, string>) {
  const { data } = await apiClient.get<PaginatedResponse<Listing>>('/listings/', { params });
  return data;
}

export async function getListing(id: string) {
  const { data } = await apiClient.get<ApiResponse<Listing>>(`/listings/${id}/`);
  return data;
}

export async function createListing(payload: Partial<Listing>) {
  const { data } = await apiClient.post<ApiResponse<Listing>>('/listings/', payload);
  return data;
}

export async function updateListing(id: string, payload: Partial<Listing>) {
  const { data } = await apiClient.patch<ApiResponse<Listing>>(`/listings/${id}/`, payload);
  return data;
}

export async function uploadListingMedia(listingId: string, formData: FormData) {
  const { data } = await apiClient.post<ApiResponse<{ file_url: string }>>(
    `/listings/${listingId}/media/`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return data;
}
