"use client";
import { useState, useEffect, useMemo } from 'react';
import { useAccelerometer } from '@/hooks/useAccelerometer';
import { useMicrophone } from '@/hooks/useMicrophone';
import { useProximity } from '@/hooks/useProximity';
import { useMagnetometer } from '@/hooks/useMagnetometer';
import { useAmbientLight } from '@/hooks/useAmbientLight';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useNetworkInfo } from '@/hooks/useNetworkInfo';
import { useUserAgentData } from '@/hooks/useUserAgentData';
import { useSensorWebSocket } from '@/hooks/useSensorWebSocket';
import { useGoogleAPIRateLimit } from '@/hooks/useGoogleAPIRateLimit';

import { AccelerometerChart } from '@/components/AccelerometerChart';
import { MicrophoneChart } from '@/components/MicrophoneChart';
import { ModernGauge } from '@/components/ModernGauge';
import { MagnetometerCompass } from '@/components/MagnetometerCompass';
import { AmbientLightTankGauge } from '@/components/AmbientLightTankGauge';
import { GPSMap } from '@/components/GPSMap';
import { FighterJet3D } from '@/components/FighterJet3D';
import { AnimatedLogo } from '@/components/AnimatedLogo';
import { RateLimitStatus } from '@/components/RateLimitStatus';
import DeviceInfo from '@/components/DeviceInfo';

const themes = [
  { name: 'Ocean Blue', class: 'bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-700' },
  { name: 'Forest Green', class: 'bg-gradient-to-br from-green-900 via-emerald-800 to-teal-700' },
  { name: 'Sunset Orange', class: 'bg-gradient-to-br from-orange-900 via-red-800 to-pink-700' },
  { name: 'Purple Night', class: 'bg-gradient-to-br from-purple-900 via-indigo-800 to-blue-700' },
  { name: 'Cyber Dark', class: 'bg-gradient-to-br from-gray-900 via-slate-800 to-zinc-700' }
];

export default function Home() {
  const [currentTheme, setCurrentTheme] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);

  // Sensor hooks
  const accelerometer = useAccelerometer();
  const microphone = useMicrophone();
  const proximity = useProximity();
  const magnetometer = useMagnetometer();
  const ambientLight = useAmbientLight();
  const geolocation = useGeolocation();
  const networkInfo = useNetworkInfo();
  const userAgentData = useUserAgentData();

  // Google API rate limiting
  const rateLimit = useGoogleAPIRateLimit({
    maxCallsPerMinute: 10,
    maxCallsPerHour: 100,
    maxCallsPerDay: 1000
  });

  // Memoize the WebSocket data to prevent infinite re-renders
  const wsData = useMemo(() => ({
    accelerometer: {
      x: accelerometer.x,
      y: accelerometer.y,
      z: accelerometer.z,
      roll: accelerometer.roll,
      pitch: accelerometer.pitch,
      yaw: accelerometer.yaw,
      error: accelerometer.error
    },
    microphone: {
      volume: microphone.volume,
      freqData: microphone.freqData,
      error: microphone.error,
      permissionGranted: microphone.permissionGranted
    },
    proximity: {
      distance: proximity.distance,
      near: proximity.near,
      error: proximity.error,
      supported: proximity.supported
    },
    magnetometer: {
      data: magnetometer.data,
      error: magnetometer.error
    },
    ambientLight: {
      lux: ambientLight.lux,
      error: ambientLight.error,
      supported: ambientLight.supported
    },
    geolocation: {
      coords: geolocation.coords,
      error: geolocation.error,
      permissionGranted: geolocation.permissionGranted
    },
    network: networkInfo,
    userAgent: userAgentData,
  }), [
    accelerometer.x, accelerometer.y, accelerometer.z, accelerometer.roll, accelerometer.pitch, accelerometer.yaw, accelerometer.error,
    microphone.volume, microphone.freqData, microphone.error, microphone.permissionGranted,
    proximity.distance, proximity.near, proximity.error, proximity.supported,
    magnetometer.data?.x, magnetometer.data?.y, magnetometer.data?.z, magnetometer.error,
    ambientLight.lux, ambientLight.error, ambientLight.supported,
    geolocation.coords?.lat, geolocation.coords?.lon, geolocation.coords?.accuracy, geolocation.error, geolocation.permissionGranted,
    networkInfo?.type, networkInfo?.effectiveType, networkInfo?.downlink, networkInfo?.rtt, networkInfo?.saveData,
    userAgentData
  ]);

  // WebSocket for real-time sensor streaming
  const ws = useSensorWebSocket({
    data: wsData,
    connected: wsConnected
  });

  // Set client flag on mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className={`min-h-screen ${themes[currentTheme].class} text-white transition-all duration-500`}>
      {/* Header */}
      <header className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <AnimatedLogo />
          </div>
          
          <div className="flex items-center space-x-4">
            {/* WebSocket Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${ws.status === 'connected' ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-sm">{ws.status === 'connected' ? 'Connected' : 'Disconnected'}</span>
            </div>

            {/* Theme Selector */}
            <div className="relative">
              <select
                value={currentTheme}
                onChange={(e) => setCurrentTheme(Number(e.target.value))}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 text-gray-800"
              >
                {themes.map((theme, index) => (
                  <option key={index} value={index} className="text-gray-800">
                    {theme.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {/* Accelerometer Chart */}
        <section className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h2 className="text-lg font-semibold mb-4">Accelerometer</h2>
          <div className="h-64">
            <AccelerometerChart data={accelerometer} />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-400">{accelerometer.x?.toFixed(2) || '0.00'}</div>
              <div className="text-xs opacity-70">X</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">{accelerometer.y?.toFixed(2) || '0.00'}</div>
              <div className="text-xs opacity-70">Y</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">{accelerometer.z?.toFixed(2) || '0.00'}</div>
              <div className="text-xs opacity-70">Z</div>
            </div>
          </div>
          {accelerometer.error && (
            <div className="mt-2 text-red-400 text-sm">{accelerometer.error}</div>
          )}
        </section>

        {/* 3D Fighter Jet */}
        <section className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h2 className="text-lg font-semibold mb-4">3D Fighter Jet</h2>
          <div className="h-64 bg-gray-900 rounded-lg overflow-hidden">
            <FighterJet3D 
              roll={accelerometer.roll} 
              pitch={accelerometer.pitch} 
              yaw={accelerometer.yaw} 
            />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-blue-400">{accelerometer.roll?.toFixed(1) || '0.0'}°</div>
              <div className="text-xs opacity-70">Roll</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-400">{accelerometer.pitch?.toFixed(1) || '0.0'}°</div>
              <div className="text-xs opacity-70">Pitch</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-400">{accelerometer.yaw?.toFixed(1) || '0.0'}°</div>
              <div className="text-xs opacity-70">Yaw</div>
            </div>
          </div>
        </section>

        {/* Microphone Chart */}
        <section className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h2 className="text-lg font-semibold mb-4">Microphone</h2>
          <div className="h-64">
            <MicrophoneChart freqData={microphone.freqData} volume={microphone.volume} />
          </div>
          <div className="mt-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{microphone.volume?.toFixed(2) || '0.00'}</div>
            <div className="text-xs opacity-70">Volume Level</div>
          </div>
          {microphone.error && (
            <div className="mt-2 text-red-400 text-sm">{microphone.error}</div>
          )}
        </section>

        {/* Proximity Sensor */}
        <section className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h2 className="text-lg font-semibold mb-4">Proximity Sensor</h2>
          <div className="flex justify-center">
            <ModernGauge
              value={proximity.distance || 0}
              min={0}
              max={100}
              label="Distance (cm)"
              color="blue"
            />
          </div>
          <div className="mt-4 text-center">
            <div className="text-sm opacity-70">
              {proximity.distance !== null ? `${proximity.distance.toFixed(1)} cm` : 'N/A'}
            </div>
          </div>
          {proximity.error && (
            <div className="mt-2 text-red-400 text-sm">{proximity.error}</div>
          )}
        </section>

        {/* Magnetometer Compass */}
        <section className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h2 className="text-lg font-semibold mb-4">Magnetometer</h2>
          <div className="flex justify-center">
            <MagnetometerCompass 
              x={magnetometer.data?.x ?? null} 
              y={magnetometer.data?.y ?? null} 
              z={magnetometer.data?.z ?? null} 
            />
          </div>
          {magnetometer.error && (
            <div className="mt-2 text-red-400 text-sm">{magnetometer.error}</div>
          )}
        </section>

        {/* Ambient Light Sensor */}
        <section className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h2 className="text-lg font-semibold mb-4">Ambient Light</h2>
          <div className="flex justify-center">
            <AmbientLightTankGauge lux={ambientLight.lux} />
          </div>
          <div className="mt-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{ambientLight.lux?.toFixed(1) || '0.0'}</div>
            <div className="text-xs opacity-70">Lux</div>
          </div>
          {ambientLight.error && (
            <div className="mt-2 text-red-400 text-sm">{ambientLight.error}</div>
          )}
        </section>

        {/* GPS Map */}
        <section className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h2 className="text-lg font-semibold mb-4">GPS Location</h2>
          <div className="h-64 bg-gray-100 rounded-lg overflow-hidden">
            <GPSMap
              latitude={geolocation.coords?.lat || null}
              longitude={geolocation.coords?.lon || null}
              accuracy={geolocation.coords?.accuracy || null}
              showCacheStatus={true}
            />
          </div>
          {geolocation.error && (
            <div className="mt-2 text-red-400 text-sm">{geolocation.error}</div>
          )}
        </section>

        {/* Device Information */}
        <section className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h2 className="text-lg font-semibold mb-4">Device Info</h2>
          <DeviceInfo 
            networkInfo={networkInfo}
            userAgentData={userAgentData}
            geolocation={geolocation}
            isClient={isClient}
          />
        </section>

        {/* WebSocket Connect */}
        <section className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h2 className="text-lg font-semibold mb-4">WebSocket Stream</h2>
          <div className="flex flex-col items-center gap-4">
            <button
              className={`px-6 py-2 rounded-full font-bold shadow transition ${
                wsConnected ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
              onClick={() => setWsConnected((c) => !c)}
            >
              {wsConnected ? 'Disconnect' : 'Connect & Stream Data'}
            </button>
            <div className="text-xs text-gray-300">Status: <span className="capitalize">{ws.status}</span></div>
            {ws.error && <div className="text-xs text-red-400">{ws.error}</div>}
          </div>
        </section>
      </main>

      {/* Footer with API Status */}
      <footer className="p-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <RateLimitStatus showDetails={true} />
        </div>
      </footer>
    </div>
  );
}
