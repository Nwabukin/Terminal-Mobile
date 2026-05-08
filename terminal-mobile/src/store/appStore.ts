import { create } from 'zustand';

type UserRole = 'renter' | 'owner';

interface AppState {
  role: UserRole;
  toggleRole: () => void;
  searchFilters: {
    resourceType: string | null;
    radiusKm: number;
    availableOnly: boolean;
  };
  setSearchFilters: (filters: Partial<AppState['searchFilters']>) => void;
}

export const useAppStore = create<AppState>((set) => ({
  role: 'renter',
  toggleRole: () =>
    set((state) => ({ role: state.role === 'renter' ? 'owner' : 'renter' })),
  searchFilters: {
    resourceType: null,
    radiusKm: 50,
    availableOnly: true,
  },
  setSearchFilters: (filters) =>
    set((state) => ({
      searchFilters: { ...state.searchFilters, ...filters },
    })),
}));
