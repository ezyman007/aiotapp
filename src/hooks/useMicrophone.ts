import { useEffect, useRef, useState } from "react";

export function useMicrophone() {
  const [volume, setVolume] = useState(0);
  const [freqData, setFreqData] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const permissionGrantedRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    let animationId: number;
    let stream: MediaStream;

    async function setup() {
      try {
        // Check if getUserMedia is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setError("Microphone not supported in this browser");
          return;
        }

        // Request microphone permission
        stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false
          } 
        });
        
        permissionGrantedRef.current = true;
        setError(null);

        // Create audio context
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContext();
        
        const source = audioContextRef.current.createMediaStreamSource(stream);
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 64;
        dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
        source.connect(analyserRef.current);

        function update() {
          if (analyserRef.current && dataArrayRef.current && permissionGrantedRef.current) {
            analyserRef.current.getByteFrequencyData(dataArrayRef.current);
            setFreqData(Array.from(dataArrayRef.current));
            
            // Calculate RMS volume
            const rms = Math.sqrt(
              dataArrayRef.current.reduce((sum, v) => sum + v * v, 0) / dataArrayRef.current.length
            );
            setVolume(rms);
          }
          animationId = requestAnimationFrame(update);
        }
        update();
      } catch (e: any) {
        console.error("Microphone error:", e);
        if (e.name === 'NotAllowedError') {
          setError("Microphone permission denied. Please allow microphone access.");
        } else if (e.name === 'NotFoundError') {
          setError("No microphone found on this device.");
        } else {
          setError(e.message || "Failed to access microphone");
        }
      }
    }

    setup();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  return { volume, freqData, error, permissionGranted: permissionGrantedRef.current };
} 