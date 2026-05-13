import type { Listing } from '../api/types';

export type RenterStackParamList = {
  RenterHome: undefined;
  ListingDetail: { listingId: string };
  RequestBooking: { listing?: Listing; listingId?: string };
  BookingDetail: { bookingId: string };
  Thread: { threadId: string };
};

export type RenterTabParamList = {
  Search: undefined;
  Bookings: undefined;
  Messages: undefined;
  Profile: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  VerifyPhone: undefined;
};

export type OwnerTabParamList = {
  Dashboard: undefined;
  OwnerBookings: undefined;
  OwnerMessages: undefined;
  OwnerProfile: undefined;
};

/** Native stack wrapping owner tabs — same detail routes as renter so `navigate()` from shared screens works. */
export type OwnerStackParamList = {
  OwnerHome: undefined;
  ListingDetail: { listingId: string };
  RequestBooking: { listing?: Listing; listingId?: string };
  BookingDetail: { bookingId: string };
  Thread: { threadId: string };
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  ListingWizard: { listingId?: string } | undefined;
};
