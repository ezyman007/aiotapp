import { useEffect, useState } from "react";

export function useProximity() {
  const [distance, setDistance] = useState<number | null>(null);
  const [near, setNear] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    function handleProximity(event: any) {
      setDistance(event.value || null);
      setNear(event.near || false);
      setError(null);
    }

    function handleProximityError() {
      setError("Proximity sensor not available");
    }

    // Check if proximity sensor is supported
    if ('ondeviceproximity' in window || 'onuserproximity' in window) {
      setSupported(true);
      window.addEventListener("deviceproximity", handleProximity);
      window.addEventListener("userproximity", handleProximity);
      window.addEventListener("error", handleProximityError);
    } else {
      setError("Proximity sensor not supported in this browser");
    }

    return () => {
      window.removeEventListener("deviceproximity", handleProximity);
      window.removeEventListener("userproximity", handleProximity);
      window.removeEventListener("error", handleProximityError);
    };
  }, []);

  return { distance, near, error, supported };
} 