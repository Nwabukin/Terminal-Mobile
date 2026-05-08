import apiClient from './client';
import type { PaginatedResponse, SearchResult } from './types';

export async function searchListings(params: {
  latitude: number;
  longitude: number;
  radius_km?: number;
  resource_type?: string;
  available_only?: boolean;
}) {
  const { data } = await apiClient.get<PaginatedResponse<SearchResult>>('/search/', { params });
  return data;
}
