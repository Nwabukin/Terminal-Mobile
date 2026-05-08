export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]> | string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  count: number;
  data: T[];
}

export interface User {
  id: string;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  full_name: string;
  profile_photo: string | null;
  bio: string;
  is_renter: boolean;
  is_owner: boolean;
  verification_level: number;
  is_phone_verified: boolean;
  is_email_verified: boolean;
  is_id_verified: boolean;
  created_at: string;
  unread_messages?: number;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface ListingMedia {
  id: string;
  file_url: string;
  is_primary: boolean;
  display_order: number;
}

export interface ListingOwner {
  id: string;
  full_name: string;
  profile_photo: string | null;
  verification_level: number;
}

export interface Listing {
  id: string;
  owner: ListingOwner;
  resource_type: 'equipment' | 'vehicle' | 'warehouse' | 'terminal' | 'facility';
  title: string;
  description: string;
  category: string;
  price_daily: string | null;
  price_weekly: string | null;
  price_monthly: string | null;
  specs: Record<string, unknown>;
  latitude: number | null;
  longitude: number | null;
  location_address: string;
  location_city: string;
  operator_available: boolean;
  delivery_available: boolean;
  status: 'draft' | 'active' | 'paused' | 'archived';
  is_available: boolean;
  verification_tier: 'basic' | 'verified' | 'inspected';
  view_count: number;
  primary_photo_url: string | null;
  media: ListingMedia[];
  created_at: string;
  updated_at: string;
}

export interface SearchResult {
  id: string;
  resource_type: Listing['resource_type'];
  title: string;
  category: string;
  price_daily: string | null;
  price_weekly: string | null;
  price_monthly: string | null;
  latitude: number;
  longitude: number;
  location_address: string;
  location_city: string;
  is_available: boolean;
  verification_tier: string;
  primary_photo_url: string | null;
  distance_km: number;
  owner_name: string;
  owner_photo: string | null;
}

export interface BookingParty {
  id: string;
  full_name: string;
  profile_photo: string | null;
  phone: string;
}

export interface Booking {
  id: string;
  renter: BookingParty;
  owner: BookingParty;
  listing_id: string;
  listing_title: string;
  start_date: string;
  end_date: string;
  duration_type: 'daily' | 'weekly' | 'monthly';
  duration_days: number;
  gross_amount: string;
  commission_rate: string;
  commission_amount: string;
  owner_payout_amount: string;
  renter_note: string;
  status: 'pending' | 'confirmed' | 'declined' | 'active' | 'completed' | 'cancelled';
  payment_status: 'unpaid' | 'simulated_paid';
  thread_id: string | null;
  cancellation_reason: string;
  created_at: string;
  updated_at: string;
}

export interface MessageSender {
  id: string;
  full_name: string;
  profile_photo: string | null;
}

export interface Message {
  id: string;
  sender: MessageSender;
  body: string;
  is_read: boolean;
  created_at: string;
}

export interface Thread {
  id: string;
  is_booking_thread: boolean;
  booking_id: string | null;
  listing_title: string | null;
  other_participant: {
    id: string;
    full_name: string;
    profile_photo: string | null;
  } | null;
  last_message: {
    body: string;
    sender_name: string;
    created_at: string;
  } | null;
  unread_count: number;
  created_at: string;
  updated_at: string;
}
