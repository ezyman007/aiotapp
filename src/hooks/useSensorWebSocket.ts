import { useEffect, useRef, useState } from "react";

export function useSensorWebSocket({
  data,
  connected,
  url = "ws://localhost:8080"
}: {
  data: any;
  connected: boolean;
  url?: string;
}) {
  const [status, setStatus] = useState<"disconnected" | "connecting" | "connected" | "error">("disconnected");
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const intervalRef = useRef<any>(null);
  const dataRef = useRef(data);

  // Update data ref when data changes
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    if (connected) {
      setStatus("connecting");
      setError(null);
      wsRef.current = new WebSocket(url);
      wsRef.current.onopen = () => setStatus("connected");
      wsRef.current.onerror = (e) => {
        setStatus("error");
        setError("WebSocket error");
      };
      wsRef.current.onclose = () => setStatus("disconnected");
      intervalRef.current = setInterval(() => {
        if (wsRef.current && wsRef.current.readyState === 1) {
          wsRef.current.send(JSON.stringify(dataRef.current));
        }
      }, 200);
    } else {
      if (wsRef.current) wsRef.current.close();
      wsRef.current = null;
      setStatus("disconnected");
      setError(null);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (wsRef.current) wsRef.current.close();
      wsRef.current = null;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [connected, url]);

  return { status, error };
} 