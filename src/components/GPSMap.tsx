"use client";
import { useEffect, useRef, useState, useMemo } from 'react';
import { useGoogleAPIRateLimit } from '@/hooks/useGoogleAPIRateLimit';
import { useGPSCache } from '@/hooks/useGPSCache';

// Google Maps types
declare global {
  interface Window {
    google: {
      maps: {
        Map: any;
        Marker: any;
        Circle: any;
        MapTypeId: any;
        SymbolPath: any;
      };
    };
  }
}

// Global state to track API loading
let apiLoadingPromise: Promise<void> | null = null;
let apiLoaded = false;

interface GPSMapProps {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  showCacheStatus?: boolean;
}

// Function to load Google Maps API
function loadGoogleMapsAPI(): Promise<void> {
  if (apiLoaded) {
    return Promise.resolve();
  }
  
  if (apiLoadingPromise) {
    return apiLoadingPromise;
  }

  apiLoadingPromise = new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.google?.maps) {
      apiLoaded = true;
      resolve();
      return;
    }

    // Check if script already exists
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      // Wait for existing script to load
      const checkLoaded = () => {
        if (window.google?.maps) {
          apiLoaded = true;
          resolve();
        } else {
          setTimeout(checkLoaded, 100);
        }
      };
      checkLoaded();
      return;
    }

    // Create new script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'DEMO_KEY'}`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      apiLoaded = true;
      resolve();
    };
    script.onerror = () => {
      apiLoadingPromise = null;
      reject(new Error("Failed to load Google Maps API"));
    };
    document.head.appendChild(script);
  });

  return apiLoadingPromise;
}

export function GPSMap({ latitude, longitude, accuracy, showCacheStatus = true }: GPSMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [lastMapUpdate, setLastMapUpdate] = useState<number>(0);
  const [isClient, setIsClient] = useState(false);

  // Always call useGPSCache to maintain hook order
  const gpsCache = useGPSCache();
  const cacheStatus = isClient ? gpsCache.getCacheStatus() : { hasCache: false, source: null };

  // Google API rate limiting with conservative limits
  const rateLimit = useGoogleAPIRateLimit({
    maxCallsPerMinute: 5, // Conservative limit for maps
    maxCallsPerHour: 50,
    maxCallsPerDay: 500
  });

  // Use ref to prevent infinite re-renders
  const rateLimitRef = useRef(rateLimit);

  // Update ref when rateLimit changes - but don't cause re-renders
  useEffect(() => {
    rateLimitRef.current = rateLimit;
  }, []); // Empty dependency array to prevent infinite re-renders

  // Memoize position to prevent unnecessary map updates
  const currentPosition = useMemo(() => {
    if (latitude && longitude) {
      return { lat: latitude, lng: longitude };
    }
    return null;
  }, [latitude, longitude]);

  // Check if we should update the map based on rate limiting and position change
  const shouldUpdateMap = useMemo(() => {
    if (!currentPosition || !mapRef.current || !latitude || !longitude) {
      return false;
    }

    // Check rate limiting
    if (!rateLimitRef.current.canMakeCall('maps')) {
      return false;
    }

    // Only update if position has changed significantly (more than 10 meters)
    const lastPos = mapRef.current.dataset.lastPosition;
    if (lastPos) {
      try {
        const [lastLat, lastLng] = lastPos.split(',').map(Number);
        const latDiff = Math.abs(latitude - lastLat);
        const lngDiff = Math.abs(longitude - lastLng);
        
        // Rough conversion: 0.0001 degrees ≈ 11 meters
        if (latDiff < 0.0001 && lngDiff < 0.0001) {
          return false;
        }
      } catch (e) {
        // If parsing fails, allow update
      }
    }

    return true;
  }, [currentPosition, latitude, longitude]);

  // Set client flag on mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Load Google Maps API and update map
    const loadMap = async () => {
      try {
        await loadGoogleMapsAPI();
        
        // Update map if conditions are met
        if (shouldUpdateMap && currentPosition) {
          // Record the API call
          if (!rateLimitRef.current.makeCall('maps')) {
            console.warn('Rate limit exceeded for Google Maps API');
            return;
          }

          const map = new window.google.maps.Map(mapRef.current!, {
            center: currentPosition,
            zoom: 15,
            mapTypeId: window.google.maps.MapTypeId.ROADMAP,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            zoomControl: true,
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }]
              }
            ]
          });

          new window.google.maps.Marker({
            position: currentPosition,
            map: map,
            title: "Device Location",
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#3B82F6",
              fillOpacity: 0.8,
              strokeColor: "#1E40AF",
              strokeWeight: 2
            }
          });

          if (accuracy && accuracy > 0) {
            new window.google.maps.Circle({
              strokeColor: "#3B82F6",
              strokeOpacity: 0.3,
              strokeWeight: 1,
              fillColor: "#3B82F6",
              fillOpacity: 0.1,
              map: map,
              center: currentPosition,
              radius: accuracy
            });
          }

          // Store current position to prevent unnecessary updates
          if (mapRef.current) {
            mapRef.current.dataset.lastPosition = `${latitude},${longitude}`;
          }

          setMapLoaded(true);
          setLastMapUpdate(Date.now());
          setMapError(null);
        }
      } catch (error: any) {
        console.error("Error initializing map:", error);
        if (error.message?.includes('InvalidKeyMapError') || error.message?.includes('InvalidKey')) {
          setMapError("Invalid Google Maps API key");
        } else if (error.message?.includes('OVER_QUERY_LIMIT')) {
          setMapError("Google Maps API rate limit exceeded");
        } else {
          setMapError("Error initializing map");
        }
      }
    };

    loadMap();
  }, [shouldUpdateMap, currentPosition, latitude, longitude, accuracy]); // Removed rateLimit dependency

  if (!latitude || !longitude) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
        <div className="text-center text-white">
          <div className="text-sm font-bold">GPS Location</div>
          <div className="text-xs opacity-90">Waiting for location data...</div>
          {isClient && showCacheStatus && cacheStatus.hasCache && (
            <button
              onClick={() => gpsCache.getCurrentLocation()}
              className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors font-semibold"
            >
              Load Cached Location
            </button>
          )}
        </div>
      </div>
    );
  }

  if (mapError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
        <div className="text-center text-white p-4">
          <div className="text-sm font-bold mb-2">GPS Location</div>
          <div className="text-xs mb-3 opacity-90">{mapError}</div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 shadow-sm border border-white/30">
            <div className="text-xs text-white/90 mb-1 font-semibold">Coordinates:</div>
            <div className="text-sm font-mono text-blue-300 font-bold">
              {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </div>
            {accuracy && (
              <div className="text-xs text-white/80 mt-1 font-medium">
                Accuracy: ±{accuracy.toFixed(1)}m
              </div>
            )}
            {isClient && showCacheStatus && cacheStatus.source && (
              <div className="text-xs text-white/80 mt-1 font-medium">
                Source: {cacheStatus.source}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!apiLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
        <div className="text-center text-white">
          <div className="text-sm font-bold">GPS Location</div>
          <div className="text-xs opacity-90">Loading map...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <div className="text-xs text-white font-semibold">GPS Location</div>
        <div className="flex items-center gap-2">
          {isClient && showCacheStatus && cacheStatus.source && (
            <div className={`text-xs px-2 py-1 rounded font-semibold ${
              cacheStatus.source === 'gps' ? 'bg-green-500/80 text-white' :
              cacheStatus.source === 'cache' ? 'bg-blue-500/80 text-white' :
              'bg-yellow-500/80 text-white'
            }`}>
              {cacheStatus.source.toUpperCase()}
            </div>
          )}
          {rateLimitRef.current.getStatus().isBlocked && (
            <div className="text-xs text-white bg-orange-500/80 px-2 py-1 rounded font-semibold">
              {rateLimitRef.current.getStatus().blockReason} ({rateLimitRef.current.getStatus().timeUntilReset}s)
            </div>
          )}
          {!rateLimitRef.current.getStatus().isBlocked && rateLimitRef.current.getStatus().remainingCalls < 2 && (
            <div className="text-xs text-white bg-yellow-500/80 px-2 py-1 rounded font-semibold">
              {rateLimitRef.current.getStatus().remainingCalls} calls left
            </div>
          )}
        </div>
      </div>
      <div ref={mapRef} className="w-full h-full rounded-lg overflow-hidden" />
      <div className="flex justify-between items-center mt-1">
        {accuracy && (
          <div className="text-xs text-white/90 font-medium">
            Accuracy: ±{accuracy.toFixed(1)}m
          </div>
        )}
        <div className="flex items-center gap-2">
          {lastMapUpdate > 0 && (
            <div className="text-xs text-white/80 font-medium">
              Updated: {new Date(lastMapUpdate).toLocaleTimeString()}
            </div>
          )}
          <div className="text-xs text-white/80 font-medium">
            API: {rateLimitRef.current.getStatus().callsPerMinute}/min
          </div>
        </div>
      </div>
    </div>
  );
} 