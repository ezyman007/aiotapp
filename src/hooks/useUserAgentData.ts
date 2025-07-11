import { useEffect, useState } from "react";

export function useUserAgentData() {
  const [ua, setUa] = useState<string>("");

  useEffect(() => {
    if ((navigator as any).userAgentData) {
      const uaData = (navigator as any).userAgentData;
      setUa(JSON.stringify(uaData));
    } else {
      setUa(navigator.userAgent);
    }
  }, []);

  return ua;
} 