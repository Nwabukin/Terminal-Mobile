import apiClient from './client';
import type { SearchResult } from './types';

interface MapSearchParams {
  lat: number;
  lng: number;
  radius?: number;
  resource_type?: string;
  available?: boolean;
}

interface MapSearchResponse {
  success: boolean;
  count: number;
  radius_km: number;
  data: SearchResult[];
}

export async function fetchMapListings(
  params: MapSearchParams
): Promise<MapSearchResponse> {
  const queryParams: Record<string, string> = {
    lat: params.lat.toString(),
    lng: params.lng.toString(),
  };

  if (params.radius !== undefined) {
    queryParams.radius = params.radius.toString();
  }

  if (params.resource_type) {
    queryParams.resource_type = params.resource_type;
  }

  if (params.available !== undefined) {
    queryParams.available = params.available.toString();
  }

  const { data } = await apiClient.get<MapSearchResponse>('/search/map/', {
    params: queryParams,
  });

  return data;
}
