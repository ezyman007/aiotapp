import { useState, useEffect, useCallback, useRef } from 'react';
import { useGPSCache } from './useGPSCache';

interface GeolocationCoords {
  lat: number;
  lon: number;
  accuracy: number;
}

interface GeolocationState {
  coords: GeolocationCoords | null;
  error: string | null;
  permissionGranted: boolean;
  isLoading: boolean;
  source: 'gps' | 'cache' | 'default' | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    coords: null,
    error: null,
    permissionGranted: false,
    isLoading: true,
    source: null
  });

  const [isClient, setIsClient] = useState(false);

  // Always call useGPSCache to maintain hook order
  const gpsCache = useGPSCache();

  // Use refs to prevent infinite re-renders
  const updateLocationRef = useRef<((coords: GeolocationCoords, source: 'gps' | 'cache' | 'default') => void) | null>(null);
  const setErrorRef = useRef<((error: string) => void) | null>(null);
  const gpsCacheRef = useRef(gpsCache);
  const permissionGrantedRef = useRef(false);

  // Update ref when gpsCache changes
  useEffect(() => {
    gpsCacheRef.current = gpsCache;
  }, [gpsCache]);

  const updateLocation = useCallback((coords: GeolocationCoords, source: 'gps' | 'cache' | 'default') => {
    setState(prev => {
      // Only update if coordinates actually changed
      if (prev.coords?.lat === coords.lat && 
          prev.coords?.lon === coords.lon && 
          prev.coords?.accuracy === coords.accuracy &&
          prev.source === source) {
        return prev;
      }
      
      return {
        ...prev,
        coords,
        error: null,
        isLoading: false,
        source
      };
    });
  }, []);

  const setError = useCallback((error: string) => {
    setState(prev => ({
      ...prev,
      error,
      isLoading: false
    }));
  }, []);

  // Store refs to prevent dependency issues - only update once
  useEffect(() => {
    updateLocationRef.current = updateLocation;
    setErrorRef.current = setError;
  }, [updateLocation, setError]);

  const requestLocation = useCallback(async () => {
    if (!isClient) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const cachedLocation = await gpsCacheRef.current.getCurrentLocation();
      
      updateLocationRef.current?.({
        lat: cachedLocation.latitude,
        lon: cachedLocation.longitude,
        accuracy: cachedLocation.accuracy
      }, cachedLocation.source);

      // If we got GPS data, update permission status
      if (cachedLocation.source === 'gps') {
        permissionGrantedRef.current = true;
        setState(prev => ({ ...prev, permissionGranted: true }));
      }
    } catch (error: any) {
      console.error('Geolocation error:', error);
      setErrorRef.current?.(error.message || 'Failed to get location');
    }
  }, [isClient]);

  const clearCache = useCallback(() => {
    if (!isClient) return;
    
    gpsCacheRef.current.clearCache();
    setState(prev => ({
      ...prev,
      coords: null,
      source: null
    }));
  }, [isClient]);

  const getCacheStatus = useCallback(() => {
    if (!isClient) return { hasCache: false, age: null, source: null };
    return gpsCacheRef.current.getCacheStatus();
  }, [isClient]);

  // Set client flag on mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize with cached location - only run once when client is ready
  useEffect(() => {
    if (!isClient) return;

    const initializeLocation = async () => {
      try {
        const cacheStatus = gpsCacheRef.current.getCacheStatus();
        
        if (cacheStatus.hasCache && cacheStatus.location) {
          updateLocationRef.current?.({
            lat: cacheStatus.location.latitude,
            lon: cacheStatus.location.longitude,
            accuracy: cacheStatus.location.accuracy
          }, cacheStatus.location.source);
        } else {
          // Try to get fresh location directly without calling requestLocation
          setState(prev => ({ ...prev, isLoading: true, error: null }));
          
          const cachedLocation = await gpsCacheRef.current.getCurrentLocation();
          
          updateLocationRef.current?.({
            lat: cachedLocation.latitude,
            lon: cachedLocation.longitude,
            accuracy: cachedLocation.accuracy
          }, cachedLocation.source);

          if (cachedLocation.source === 'gps') {
            permissionGrantedRef.current = true;
            setState(prev => ({ ...prev, permissionGranted: true }));
          }
        }
      } catch (error: any) {
        console.error('Geolocation initialization error:', error);
        setErrorRef.current?.(error.message || 'Failed to initialize location');
      }
    };

    initializeLocation();
  }, [isClient]); // Removed gpsCache dependency

  // Watch for location changes - only save the last position to cache
  useEffect(() => {
    if (!isClient) return;
    
    if (!navigator.geolocation) {
      setErrorRef.current?.('Geolocation not supported');
      return;
    }

    let lastSavedPosition: GeolocationPosition | null = null;
    let saveTimeout: NodeJS.Timeout | null = null;
    let lastCoords: GeolocationCoords | null = null;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const coords: GeolocationCoords = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          accuracy: position.coords.accuracy || 100
        };

        // Only update if coordinates actually changed
        if (lastCoords?.lat === coords.lat && 
            lastCoords?.lon === coords.lon && 
            lastCoords?.accuracy === coords.accuracy) {
          return;
        }

        lastCoords = coords;

        // Update the UI immediately
        updateLocationRef.current?.(coords, 'gps');
        
        // Update permission status only once
        if (!permissionGrantedRef.current) {
          permissionGrantedRef.current = true;
          setState(prev => ({ ...prev, permissionGranted: true }));
        }

        // Store the position for potential caching (don't save immediately)
        lastSavedPosition = position;

        // Clear any existing timeout
        if (saveTimeout) {
          clearTimeout(saveTimeout);
        }

        // Only save to cache after 5 seconds of no new updates (debounced caching)
        saveTimeout = setTimeout(() => {
          if (lastSavedPosition) {
            gpsCacheRef.current.saveToCache({
              latitude: lastSavedPosition.coords.latitude,
              longitude: lastSavedPosition.coords.longitude,
              accuracy: lastSavedPosition.coords.accuracy || 100,
              timestamp: Date.now()
            });
            console.log('GPS position saved to cache (last known position)');
          }
        }, 5000);
      },
      (error) => {
        console.warn('Geolocation watch error:', error);
        // Don't set error here as we might have cached data
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000 // Accept cached positions up to 30 seconds old
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
    };
  }, [isClient]); // Removed gpsCache dependency

  return {
    ...state,
    requestLocation,
    clearCache,
    getCacheStatus
  };
} 