import { useEffect, useState } from "react";

export function useMagnetometer() {
  const [data, setData] = useState<{ x: number; y: number; z: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    let sensor: any;

    async function setupMagnetometer() {
      try {
        // Try Generic Sensor API first
        if ('Magnetometer' in window) {
          // @ts-ignore
          sensor = new window.Magnetometer();
          sensor.addEventListener('reading', () => {
            setData({ x: sensor.x, y: sensor.y, z: sensor.z });
            setError(null);
          });
          sensor.start();
          setSupported(true);
        } else if ('DeviceOrientationEvent' in window) {
          // Fallback to DeviceOrientationEvent
          setSupported(true);
          window.addEventListener('deviceorientation', (event) => {
            if (event.alpha !== null && event.beta !== null && event.gamma !== null) {
              // Convert orientation to approximate magnetometer values
              const x = Math.sin(event.alpha * Math.PI / 180) * Math.cos(event.beta * Math.PI / 180);
              const y = Math.sin(event.beta * Math.PI / 180);
              const z = Math.cos(event.alpha * Math.PI / 180) * Math.cos(event.beta * Math.PI / 180);
              setData({ x: x * 50, y: y * 50, z: z * 50 }); // Scale for visualization
              setError(null);
            }
          });
        } else {
          setError("Magnetometer not supported in this browser");
        }
      } catch (err: any) {
        setError("Failed to access magnetometer: " + err.message);
      }
    }

    setupMagnetometer();

    return () => {
      if (sensor) {
        sensor.stop();
      }
      window.removeEventListener('deviceorientation', () => {});
    };
  }, []);

  return { data, error, supported };
} 