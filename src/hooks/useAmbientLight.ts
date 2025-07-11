import { useEffect, useState } from "react";

export function useAmbientLight() {
  const [lux, setLux] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    function handleLight(event: any) {
      const lightValue = event.value || event.lux || null;
      setLux(lightValue);
      setError(null);
    }

    function handleLightError() {
      setError("Ambient light sensor not available");
    }

    function updateLight(isDark: boolean) {
      setLux(isDark ? 10 : 500); // Approximate values
      setError(null);
    }

    // Check if ambient light sensor is supported
    if ('ondevicelight' in window) {
      setSupported(true);
      window.addEventListener("devicelight", handleLight);
      window.addEventListener("error", handleLightError);
    } else {
      // Fallback: use screen brightness as approximation
      setSupported(true);
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      updateLight(mediaQuery.matches);
      mediaQuery.addEventListener('change', (e) => updateLight(e.matches));
      
      return () => {
        mediaQuery.removeEventListener('change', (e) => updateLight(e.matches));
      };
    }

    return () => {
      window.removeEventListener("devicelight", handleLight);
      window.removeEventListener("error", handleLightError);
    };
  }, []); // Removed updateLight dependency

  return { lux, error, supported };
} 