import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ActiveRole = 'renter' | 'owner';

interface AppState {
  activeRole: ActiveRole;
  setActiveRole: (role: ActiveRole) => Promise<void>;
  hydrateRole: () => Promise<void>;
  bookingStatusFilter: string | null;
  setBookingStatusFilter: (status: string | null) => void;
  searchResourceType: string | null;
  setSearchResourceType: (type: string | null) => void;
  searchRadius: number;
  setSearchRadius: (radius: number) => void;
}

const ROLE_STORAGE_KEY = 'terminal_active_role';

export const useAppStore = create<AppState>((set) => ({
  activeRole: 'renter',

  setActiveRole: async (role) => {
    await AsyncStorage.setItem(ROLE_STORAGE_KEY, role);
    set({ activeRole: role });
  },

  hydrateRole: async () => {
    try {
      const stored = await AsyncStorage.getItem(ROLE_STORAGE_KEY);
      if (stored === 'renter' || stored === 'owner') {
        set({ activeRole: stored });
      }
    } catch {
      // Default to renter
    }
  },

  bookingStatusFilter: null,
  setBookingStatusFilter: (status) => set({ bookingStatusFilter: status }),
  searchResourceType: null,
  setSearchResourceType: (type) => set({ searchResourceType: type }),
  searchRadius: 25,
  setSearchRadius: (radius) => set({ searchRadius: radius }),
}));
