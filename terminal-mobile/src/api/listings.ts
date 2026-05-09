import apiClient from './client';
import type { Listing, ApiResponse } from './types';

export async function fetchListingDetail(id: string): Promise<Listing> {
  const { data } = await apiClient.get<ApiResponse<Listing>>(
    `/listings/${id}/`,
  );
  if (!data.success || !data.data) {
    throw new Error(data.message || 'Failed to fetch listing');
  }
  return data.data;
}

export async function getMyListings(): Promise<Listing[]> {
  const { data } = await apiClient.get<ApiResponse<Listing[]>>(
    '/listings/?own=true',
  );
  if (!data.success || !data.data) {
    throw new Error(data.message || 'Failed to fetch listings');
  }
  return data.data;
}

export async function createListing(
  payload: Partial<Listing>,
): Promise<Listing> {
  const { data } = await apiClient.post<ApiResponse<Listing>>(
    '/listings/',
    payload,
  );
  if (!data.success || !data.data) {
    throw new Error(data.message || 'Failed to create listing');
  }
  return data.data;
}

export async function updateListing(
  id: string,
  payload: Partial<Listing>,
): Promise<Listing> {
  const { data } = await apiClient.put<ApiResponse<Listing>>(
    `/listings/${id}/`,
    payload,
  );
  if (!data.success || !data.data) {
    throw new Error(data.message || 'Failed to update listing');
  }
  return data.data;
}

export async function patchListing(
  id: string,
  payload: Partial<Listing>,
): Promise<Listing> {
  const { data } = await apiClient.patch<ApiResponse<Listing>>(
    `/listings/${id}/`,
    payload,
  );
  if (!data.success || !data.data) {
    throw new Error(data.message || 'Failed to patch listing');
  }
  return data.data;
}

export async function changeListingStatus(
  id: string,
  status: Listing['status'],
): Promise<Listing> {
  const { data } = await apiClient.patch<ApiResponse<Listing>>(
    `/listings/${id}/status/`,
    { status },
  );
  if (!data.success || !data.data) {
    throw new Error(data.message || 'Failed to change listing status');
  }
  return data.data;
}

export async function uploadListingMedia(
  listingId: string,
  file: { uri: string; type?: string; name?: string },
  isPrimary: boolean,
  displayOrder: number,
): Promise<void> {
  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    type: file.type ?? 'image/jpeg',
    name: file.name ?? 'photo.jpg',
  } as any);
  formData.append('is_primary', isPrimary ? 'true' : 'false');
  formData.append('display_order', String(displayOrder));

  await apiClient.post(`/listings/${listingId}/media/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export async function deleteListingMedia(
  listingId: string,
  mediaId: string,
): Promise<void> {
  await apiClient.delete(`/listings/${listingId}/media/${mediaId}/`);
}
