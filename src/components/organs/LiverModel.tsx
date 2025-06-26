import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

interface LiverModelProps {
  riskLevel: 'low' | 'moderate' | 'high';
  isHighlighted: boolean;
  onClick?: () => void;
}

const LiverGeometry: React.FC<LiverModelProps> = ({ riskLevel, isHighlighted, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Color based on risk level
  const getColor = () => {
    switch (riskLevel) {
      case 'low': return '#22c55e'; // Green
      case 'moderate': return '#f59e0b'; // Orange
      case 'high': return '#ef4444'; // Red
      default: return '#8b4513'; // Brown
    }
  };

  // Animation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
      if (isHighlighted) {
        meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.05);
      } else {
        meshRef.current.scale.setScalar(1);
      }
    }
  });

  return (
    <group onClick={onClick}>
      {/* Main liver body - irregular shape */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <sphereGeometry args={[4, 16, 12]} />
        <meshStandardMaterial
          color={getColor()}
          metalness={0.2}
          roughness={0.6}
          emissive={isHighlighted ? getColor() : '#000000'}
          emissiveIntensity={isHighlighted ? 0.2 : 0}
        />
      </mesh>
      
      {/* Right lobe */}
      <mesh position={[3, -1, 0]}>
        <sphereGeometry args={[2.5, 12, 10]} />
        <meshStandardMaterial
          color={getColor()}
          metalness={0.2}
          roughness={0.6}
          emissive={isHighlighted ? getColor() : '#000000'}
          emissiveIntensity={isHighlighted ? 0.2 : 0}
        />
      </mesh>
      
      {/* Left lobe */}
      <mesh position={[-2, 0.5, 0]}>
        <sphereGeometry args={[3, 14, 11]} />
        <meshStandardMaterial
          color={getColor()}
          metalness={0.2}
          roughness={0.6}
          emissive={isHighlighted ? getColor() : '#000000'}
          emissiveIntensity={isHighlighted ? 0.2 : 0}
        />
      </mesh>
      
      {/* Liver label */}
      <Text
        position={[0, -8, 0]}
        fontSize={1.5}
        color="#374151"
        anchorX="center"
        anchorY="middle"
      >
        Liver
      </Text>
      
      {/* Risk level indicator */}
      <Text
        position={[0, -10, 0]}
        fontSize={1}
        color={getColor()}
        anchorX="center"
        anchorY="middle"
      >
        Risk: {riskLevel.toUpperCase()}
      </Text>
    </group>
  );
};

const LiverModel: React.FC<LiverModelProps> = (props) => {
  return (
    <div className="w-full h-96 bg-gradient-to-b from-green-50 to-white rounded-xl overflow-hidden">
      <Canvas camera={{ position: [0, 0, 20], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />
        
        <LiverGeometry {...props} />
        
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          enableRotate={true}
          autoRotate={!props.isHighlighted}
          autoRotateSpeed={1.5}
          maxDistance={30}
          minDistance={10}
        />
      </Canvas>
    </div>
  );
};

export default LiverModel;

