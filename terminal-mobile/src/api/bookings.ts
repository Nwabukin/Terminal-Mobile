import apiClient from './client';
import type { Booking, ApiResponse, PaginatedResponse } from './types';

export interface CreateBookingPayload {
  listing_id: string;
  start_date: string;
  end_date: string;
  duration_type: 'daily' | 'weekly' | 'monthly';
  renter_note?: string;
}

export interface BookingFilters {
  role?: 'renter' | 'owner' | 'both';
  status?: string;
}

export async function createBooking(payload: CreateBookingPayload) {
  const { data } = await apiClient.post<ApiResponse<Booking>>('/bookings/', payload);
  return data;
}

export async function getBookings(filters: BookingFilters = {}) {
  const params = new URLSearchParams();
  if (filters.role) params.set('role', filters.role);
  if (filters.status) params.set('status', filters.status);

  const { data } = await apiClient.get<PaginatedResponse<Booking>>(
    `/bookings/?${params.toString()}`
  );
  return data;
}

export async function getBookingDetail(bookingId: string) {
  const { data } = await apiClient.get<ApiResponse<Booking>>(`/bookings/${bookingId}/`);
  return data;
}

export async function acceptBooking(bookingId: string) {
  const { data } = await apiClient.patch<ApiResponse<Booking>>(
    `/bookings/${bookingId}/accept/`
  );
  return data;
}

export async function declineBooking(bookingId: string, reason: string = '') {
  const { data } = await apiClient.patch<ApiResponse<Booking>>(
    `/bookings/${bookingId}/decline/`,
    { reason }
  );
  return data;
}

export async function cancelBooking(bookingId: string, reason: string = '') {
  const { data } = await apiClient.patch<ApiResponse<Booking>>(
    `/bookings/${bookingId}/cancel/`,
    { reason }
  );
  return data;
}

export async function markBookingPaid(bookingId: string) {
  const { data } = await apiClient.patch<ApiResponse<Booking>>(
    `/bookings/${bookingId}/pay/`
  );
  return data;
}
