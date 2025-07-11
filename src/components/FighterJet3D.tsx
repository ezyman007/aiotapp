"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sky, Cloud, useGLTF } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

interface FighterJet3DProps {
  roll: number;
  pitch: number;
  yaw: number;
}

function FighterJetModel() {
  const { scene } = useGLTF("/fighterold.glb");

  return (
    <primitive object={scene} scale={[0.5, 0.5, 0.5]} />
  );
}

export function FighterJet3D({ roll, pitch, yaw }: FighterJet3DProps) {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 75 }} style={{ width: "100%", height: "100%", background: "#87CEEB" }}>
      <Sky sunPosition={[100, 20, 100]} turbidity={8} rayleigh={6} mieCoefficient={0.005} mieDirectionalG={0.8} inclination={0.5} azimuth={0.25} />
      
      {/* Less dense, white clouds scattered around the scene */}
      <Cloud position={[-10, 3, -5]} scale={[2, 1.2, 2]} opacity={0.3} speed={0.1} />
      <Cloud position={[8, -2, -3]} scale={[1.5, 0.8, 1.5]} opacity={0.25} speed={0.08} />
      <Cloud position={[-6, 5, -6]} scale={[1.8, 1, 1.8]} opacity={0.2} speed={0.12} />
      <Cloud position={[12, 1, -2]} scale={[2.2, 1.4, 2.2]} opacity={0.35} speed={0.15} />
      <Cloud position={[-4, -3, -7]} scale={[1.6, 1.1, 1.6]} opacity={0.18} speed={0.09} />
      <Cloud position={[6, 4, -4]} scale={[1.3, 0.7, 1.3]} opacity={0.22} speed={0.11} />
      <Cloud position={[-8, 0, -3]} scale={[1.9, 1.3, 1.9]} opacity={0.28} speed={0.13} />
      <Cloud position={[3, -4, -5]} scale={[2.1, 1.5, 2.1]} opacity={0.32} speed={0.14} />
      
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      {/* Fighter Jet */}
      <group
        position={[0, 0, 0]}
        rotation={[
          (pitch * Math.PI) / 180,
          (yaw * Math.PI) / 180,
          (roll * Math.PI) / 180
        ]}
      >
        <FighterJetModel />
      </group>
      <OrbitControls enablePan={false} enableZoom={false} enableRotate={false} />
    </Canvas>
  );
}

// Preload the model
useGLTF.preload("/fighterold.glb"); 