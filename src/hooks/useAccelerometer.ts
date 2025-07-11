import { useEffect, useState, useRef } from "react";

export interface AccelerometerData {
  x: number;
  y: number;
  z: number;
  roll: number;
  pitch: number;
  yaw: number;
}

export function useAccelerometer() {
  const [data, setData] = useState<AccelerometerData>({
    x: 0,
    y: 0,
    z: 0,
    roll: 0,
    pitch: 0,
    yaw: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const permissionGrantedRef = useRef(false);
  const eventListenerAddedRef = useRef(false);

  useEffect(() => {
    async function requestPermission() {
      try {
        // Check if DeviceMotionEvent is supported
        if (!window.DeviceMotionEvent) {
          setError("Device motion not supported");
          return;
        }

        // Request permission for iOS devices
        if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
          const permission = await (DeviceMotionEvent as any).requestPermission();
          if (permission === 'granted') {
            permissionGrantedRef.current = true;
            addEventListener();
          } else {
            setError("Motion permission denied");
            return;
          }
        } else {
          permissionGrantedRef.current = true;
          addEventListener();
        }
      } catch (err) {
        setError("Failed to get motion permission");
      }
    }

    function handleMotion(event: DeviceMotionEvent) {
      if (!permissionGrantedRef.current) return;
      
      const x = event.accelerationIncludingGravity?.x || 0;
      const y = event.accelerationIncludingGravity?.y || 0;
      const z = event.accelerationIncludingGravity?.z || 0;
      
      // Calculate roll, pitch, yaw from acceleration
      const roll = Math.atan2(y, z) * (180 / Math.PI);
      const pitch = Math.atan2(-x, Math.sqrt(y * y + z * z)) * (180 / Math.PI);
      
      setData({ x, y, z, roll, pitch, yaw: 0 });
      setError(null);
    }

    function addEventListener() {
      if (!eventListenerAddedRef.current && permissionGrantedRef.current) {
        window.addEventListener("devicemotion", handleMotion);
        eventListenerAddedRef.current = true;
      }
    }

    requestPermission();

    return () => {
      if (eventListenerAddedRef.current) {
        window.removeEventListener("devicemotion", handleMotion);
        eventListenerAddedRef.current = false;
      }
    };
  }, []);

  return { ...data, error };
} 