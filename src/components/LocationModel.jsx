import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float, Html } from '@react-three/drei';
import * as THREE from 'three';

export default function LocationModel({ locationData }) {
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  if (!locationData) return null;

  // Map location names to generic 4K drone MP4 videos
  const targetLower = (locationData.name || "").toLowerCase().replace(/\s+/g, '');
  let videoUrl = "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4"; // Default drone view
  
  if (targetLower.includes("tajmahal") || targetLower.includes("taj")) {
    videoUrl = "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"; 
  } else if (targetLower.includes("eiffel") || targetLower.includes("paris")) {
    videoUrl = "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4";
  }

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
        
        {/* Decorative 3D Frame */}
        <mesh position={[0, 0, -0.1]}>
          <planeGeometry args={[5.2, 3.2]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>

        <mesh position={[0, 0, -0.15]}>
          <planeGeometry args={[5.4, 3.4]} />
          <meshBasicMaterial color="#a855f7" transparent opacity={0.15} side={THREE.DoubleSide} />
        </mesh>

        {/* 3D Video Embed using Native HTML5 Video */}
        <Html position={[0, 0, 0]} transform scale={0.015} center>
          <div style={{
            width: '640px',
            height: '360px', 
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 40px 80px rgba(0,0,0,0.9)',
            border: '4px solid rgba(255,255,255,0.4)',
            background: 'black',
            pointerEvents: 'auto'
          }}>
            <video 
              src={videoUrl}
              autoPlay
              loop
              muted
              playsInline
              crossOrigin="anonymous"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </Html>
      </Float>
    </group>
  );
}
