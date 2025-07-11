import { useCallback, useMemo } from 'react';

interface CachedLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  source: 'gps' | 'cache' | 'default';
}

interface CacheStatus {
  hasCache: boolean;
  age: number | null;
  source: 'gps' | 'cache' | 'default' | null;
  location: CachedLocation | null;
}

const CACHE_KEY = 'gps_location_cache';
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes in milliseconds

// Default location (Kuala Lumpur, Malaysia)
const DEFAULT_LOCATION: CachedLocation = {
  latitude: 3.1390,
  longitude: 101.6869,
  accuracy: 1000,
  timestamp: Date.now(),
  source: 'default'
};

class GPSCacheManager {
  private static instance: GPSCacheManager;
  private cache: CachedLocation | null = null;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): GPSCacheManager {
    if (!GPSCacheManager.instance) {
      GPSCacheManager.instance = new GPSCacheManager();
    }
    return GPSCacheManager.instance;
  }

  private isClient(): boolean {
    return typeof window !== 'undefined';
  }

  private loadFromStorage(): CachedLocation | null {
    if (!this.isClient()) return null;
    
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const location: CachedLocation = JSON.parse(cached);
      const age = Date.now() - location.timestamp;

      // Check if cache is still valid
      if (age < CACHE_EXPIRY) {
        return location;
      } else {
        // Cache expired, remove it
        localStorage.removeItem(CACHE_KEY);
        return null;
      }
    } catch (error) {
      console.error('Error loading GPS cache:', error);
      return null;
    }
  }

  private saveToStorage(location: CachedLocation): void {
    if (!this.isClient()) return;
    
    try {
      // Always overwrite the existing cache with the new location
      localStorage.setItem(CACHE_KEY, JSON.stringify(location));
      console.log('GPS cache updated with new location');
    } catch (error) {
      console.error('Error saving GPS cache:', error);
    }
  }

  initialize(): void {
    if (this.isInitialized) return;
    
    this.cache = this.loadFromStorage();
    this.isInitialized = true;
  }

  getCacheStatus(): CacheStatus {
    if (!this.isInitialized) {
      this.initialize();
    }

    if (!this.cache) {
      return {
        hasCache: false,
        age: null,
        source: null,
        location: null
      };
    }

    const age = Date.now() - this.cache.timestamp;
    return {
      hasCache: age < CACHE_EXPIRY,
      age,
      source: this.cache.source,
      location: this.cache
    };
  }

  async getCurrentLocation(): Promise<CachedLocation> {
    if (!this.isInitialized) {
      this.initialize();
    }

    // First, try to get fresh GPS location
    try {
      if (this.isClient() && navigator.geolocation) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 30000
          });
        });

        const location: CachedLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy || 100,
          timestamp: Date.now(),
          source: 'gps'
        };

        // Update cache with fresh location
        this.cache = location;
        this.saveToStorage(location);
        return location;
      }
    } catch (error) {
      console.warn('Failed to get fresh GPS location:', error);
    }

    // If GPS fails, try cached location
    const cacheStatus = this.getCacheStatus();
    if (cacheStatus.hasCache && cacheStatus.location) {
      return cacheStatus.location;
    }

    // Fallback to default location
    return DEFAULT_LOCATION;
  }

  saveToCache(location: Omit<CachedLocation, 'source'>): void {
    const cachedLocation: CachedLocation = {
      ...location,
      source: 'gps'
    };

    // Always replace the existing cache with the new location
    this.cache = cachedLocation;
    this.saveToStorage(cachedLocation);
  }

  clearCache(): void {
    this.cache = null;
    if (this.isClient()) {
      localStorage.removeItem(CACHE_KEY);
      console.log('GPS cache cleared');
    }
  }

  // Get the last known position without updating cache
  getLastKnownPosition(): CachedLocation | null {
    if (!this.isInitialized) {
      this.initialize();
    }
    return this.cache;
  }
}

export function useGPSCache() {
  const cacheManager = useMemo(() => GPSCacheManager.getInstance(), []);

  const getCacheStatus = useCallback(() => {
    return cacheManager.getCacheStatus();
  }, [cacheManager]);

  const getCurrentLocation = useCallback(async () => {
    return await cacheManager.getCurrentLocation();
  }, [cacheManager]);

  const saveToCache = useCallback((location: Omit<CachedLocation, 'source'>) => {
    cacheManager.saveToCache(location);
  }, [cacheManager]);

  const clearCache = useCallback(() => {
    cacheManager.clearCache();
  }, [cacheManager]);

  const getLastKnownPosition = useCallback(() => {
    return cacheManager.getLastKnownPosition();
  }, [cacheManager]);

  // Memoize the returned object to prevent infinite re-renders
  return useMemo(() => ({
    getCacheStatus,
    getCurrentLocation,
    saveToCache,
    clearCache,
    getLastKnownPosition
  }), [getCacheStatus, getCurrentLocation, saveToCache, clearCache, getLastKnownPosition]);
} 