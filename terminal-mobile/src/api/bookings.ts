import apiClient from './client';
import type { ApiResponse, PaginatedResponse, Booking } from './types';

export async function getBookings(params?: Record<string, string>) {
  const { data } = await apiClient.get<PaginatedResponse<Booking>>('/bookings/', { params });
  return data;
}

export async function getBooking(id: string) {
  const { data } = await apiClient.get<ApiResponse<Booking>>(`/bookings/${id}/`);
  return data;
}

export async function createBooking(payload: {
  listing_id: string;
  start_date: string;
  end_date: string;
  duration_type: string;
  renter_note?: string;
}) {
  const { data } = await apiClient.post<ApiResponse<Booking>>('/bookings/', payload);
  return data;
}

export async function updateBookingStatus(id: string, status: string, reason?: string) {
  const { data } = await apiClient.patch<ApiResponse<Booking>>(`/bookings/${id}/status/`, {
    status,
    cancellation_reason: reason,
  });
  return data;
}
