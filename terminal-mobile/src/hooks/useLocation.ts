import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';

interface LocationState {
  latitude: number;
  longitude: number;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const LAGOS_DEFAULT = {
  latitude: 6.5244,
  longitude: 3.3792,
};

export function useLocation(): LocationState {
  const [latitude, setLatitude] = useState(LAGOS_DEFAULT.latitude);
  const [longitude, setLongitude] = useState(LAGOS_DEFAULT.longitude);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setError('Location permission denied');
        setLatitude(LAGOS_DEFAULT.latitude);
        setLongitude(LAGOS_DEFAULT.longitude);
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);
    } catch {
      setError('Failed to get location');
      setLatitude(LAGOS_DEFAULT.latitude);
      setLongitude(LAGOS_DEFAULT.longitude);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  return { latitude, longitude, loading, error, refresh: fetchLocation };
}
