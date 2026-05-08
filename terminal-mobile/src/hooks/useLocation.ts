import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

const LAGOS_DEFAULT = { latitude: 6.5244, longitude: 3.3792 };

export function useLocation() {
  const [location, setLocation] = useState(LAGOS_DEFAULT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({});
          setLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
        }
      } catch {
        // Fall back to Lagos default
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { location, loading };
}
