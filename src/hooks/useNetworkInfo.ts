import { useEffect, useState } from "react";

export function useNetworkInfo() {
  const [info, setInfo] = useState<any>(null);

  useEffect(() => {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    function update() {
      if (connection) {
        setInfo({
          type: connection.type,
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData,
        });
      } else {
        setInfo(null);
      }
    }
    if (connection) {
      connection.addEventListener('change', update);
      update();
    }
    return () => {
      if (connection) connection.removeEventListener('change', update);
    };
  }, []);

  return info;
} 