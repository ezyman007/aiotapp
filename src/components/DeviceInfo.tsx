"use client";
import { useState, useEffect, useMemo } from 'react';

interface DeviceInfoProps {
  networkInfo: any;
  userAgentData: string | null;
  geolocation: any;
  isClient: boolean;
}

export default function DeviceInfo({ networkInfo, userAgentData, geolocation, isClient }: DeviceInfoProps) {
  const [mounted, setMounted] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({
    screenResolution: 'N/A',
    viewport: 'N/A',
    colorDepth: 'N/A',
    pixelRatio: 'N/A',
    language: 'N/A',
    onlineStatus: 'N/A',
    cookieEnabled: 'N/A',
    doNotTrack: 'N/A'
  });

  // Set mounted flag and update device info on client side
  useEffect(() => {
    setMounted(true);
    
    if (typeof window !== 'undefined') {
      setDeviceInfo({
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        colorDepth: `${window.screen.colorDepth} bit`,
        pixelRatio: window.devicePixelRatio.toFixed(2),
        language: navigator.language,
        onlineStatus: navigator.onLine ? 'Online' : 'Offline',
        cookieEnabled: navigator.cookieEnabled ? 'Yes' : 'No',
        doNotTrack: navigator.doNotTrack || 'Not set'
      });
    }
  }, []);

  // Memoize the GPS cache status to prevent unnecessary re-renders
  const gpsCacheStatus = useMemo(() => {
    if (!mounted || !isClient || !geolocation.getCacheStatus) return null;
    try {
      return geolocation.getCacheStatus();
    } catch (error) {
      return null;
    }
  }, [mounted, isClient]); // Remove geolocation.getCacheStatus dependency

  return (
    <div className="max-h-64 overflow-y-auto space-y-3 text-sm pr-2">
      <div>
        <span className="opacity-70">Network Type:</span>
        <div className="font-mono">{networkInfo?.type || 'N/A'}</div>
      </div>
      <div>
        <span className="opacity-70">Effective Type:</span>
        <div className="font-mono">{networkInfo?.effectiveType || 'N/A'}</div>
      </div>
      <div>
        <span className="opacity-70">Downlink:</span>
        <div className="font-mono">{networkInfo?.downlink ? `${networkInfo.downlink} Mbps` : 'N/A'}</div>
      </div>
      <div>
        <span className="opacity-70">RTT:</span>
        <div className="font-mono">{networkInfo?.rtt ? `${networkInfo.rtt}ms` : 'N/A'}</div>
      </div>
      <div>
        <span className="opacity-70">Save Data:</span>
        <div className="font-mono">{networkInfo?.saveData ? 'Enabled' : 'Disabled'}</div>
      </div>
      <div>
        <span className="opacity-70">Platform:</span>
        <div className="font-mono text-xs break-all">{userAgentData || 'N/A'}</div>
      </div>
      <div>
        <span className="opacity-70">Screen Resolution:</span>
        <div className="font-mono">{deviceInfo.screenResolution}</div>
      </div>
      <div>
        <span className="opacity-70">Viewport:</span>
        <div className="font-mono">{deviceInfo.viewport}</div>
      </div>
      <div>
        <span className="opacity-70">Color Depth:</span>
        <div className="font-mono">{deviceInfo.colorDepth}</div>
      </div>
      <div>
        <span className="opacity-70">Pixel Ratio:</span>
        <div className="font-mono">{deviceInfo.pixelRatio}</div>
      </div>
      <div>
        <span className="opacity-70">Language:</span>
        <div className="font-mono">{deviceInfo.language}</div>
      </div>
      <div>
        <span className="opacity-70">Online Status:</span>
        <div className="font-mono">{deviceInfo.onlineStatus}</div>
      </div>
      <div>
        <span className="opacity-70">Cookie Enabled:</span>
        <div className="font-mono">{deviceInfo.cookieEnabled}</div>
      </div>
      <div>
        <span className="opacity-70">Do Not Track:</span>
        <div className="font-mono">{deviceInfo.doNotTrack}</div>
      </div>
      {mounted && isClient && gpsCacheStatus && (
        <div>
          <span className="opacity-70">GPS Cache:</span>
          <div className="flex items-center gap-2 mt-1">
            <div className={`text-xs px-2 py-1 rounded ${
              gpsCacheStatus.hasCache ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
            }`}>
              {gpsCacheStatus.hasCache ? 'Available' : 'None'}
            </div>
            {gpsCacheStatus.hasCache && (
              <button
                onClick={geolocation.clearCache}
                className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 