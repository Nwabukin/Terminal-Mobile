import apiClient from './client';
import type { Listing, ApiResponse } from './types';

export async function fetchListingDetail(
  listingId: string
): Promise<Listing> {
  const { data } = await apiClient.get<ApiResponse<Listing>>(
    `/listings/${listingId}/`
  );

  if (!data.success || !data.data) {
    throw new Error(data.message || 'Failed to fetch listing');
  }

  return data.data;
}

export async function fetchMyListings(): Promise<Listing[]> {
  const { data } = await apiClient.get<ApiResponse<Listing[]>>('/listings/');

  if (!data.success || !data.data) {
    throw new Error(data.message || 'Failed to fetch listings');
  }

  return data.data;
}
