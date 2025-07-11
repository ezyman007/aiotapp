"use client";
import { Canvas } from "@react-three/fiber";

interface AmbientLight3DProps {
  lux: number | null;
}

export function AmbientLight3D({ lux }: AmbientLight3DProps) {
  const isOn = lux !== null && lux > 50;
  return (
    <Canvas camera={{ position: [0, 0, 3], fov: 60 }} style={{ width: "100%", height: "100%", background: "#f1f5f9" }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 2, 2]} intensity={isOn ? 2 : 0.2} color={isOn ? "#fbbf24" : "#64748b"} />
      <mesh>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshStandardMaterial
          color={isOn ? "#fde68a" : "#64748b"}
          emissive={isOn ? "#fbbf24" : "#64748b"}
          emissiveIntensity={isOn ? 1.5 : 0.1}
          metalness={0.2}
          roughness={0.4}
        />
      </mesh>
    </Canvas>
  );
} 