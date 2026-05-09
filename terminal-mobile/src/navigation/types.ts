import type { Listing } from '../api/types';

export type RenterStackParamList = {
  RenterHome: undefined;
  ListingDetail: { listingId: string };
  RequestBooking: { listing: Listing };
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
  Listings: undefined;
  OwnerBookings: undefined;
  OwnerMessages: undefined;
  OwnerProfile: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  ListingWizard: undefined;
};
