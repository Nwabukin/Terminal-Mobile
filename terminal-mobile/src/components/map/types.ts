import type { SearchResult } from '../../api/types';

export interface TerminalMapProps {
  latitude: number;
  longitude: number;
  listings: SearchResult[];
  selectedListingId: string | null;
  onMarkerPress: (listing: SearchResult) => void;
  onMapPress: () => void;
}
