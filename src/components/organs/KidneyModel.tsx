import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

interface KidneyModelProps {
  riskLevel: 'low' | 'moderate' | 'high';
  isHighlighted: boolean;
  onClick?: () => void;
}

const KidneyGeometry: React.FC<KidneyModelProps> = ({ riskLevel, isHighlighted, onClick }) => {
  const leftKidneyRef = useRef<THREE.Mesh>(null);
  const rightKidneyRef = useRef<THREE.Mesh>(null);

  // Color based on risk level
  const getColor = () => {
    switch (riskLevel) {
      case 'low': return '#22c55e'; // Green
      case 'moderate': return '#f59e0b'; // Orange
      case 'high': return '#ef4444'; // Red
      default: return '#dc2626';
    }
  };

  // Animation
  useFrame((state) => {
    if (leftKidneyRef.current && rightKidneyRef.current) {
      const time = state.clock.elapsedTime;
      
      // Gentle floating animation
      leftKidneyRef.current.position.y = Math.sin(time * 0.8) * 0.1;
      rightKidneyRef.current.position.y = Math.sin(time * 0.8 + Math.PI) * 0.1;
      
      if (isHighlighted) {
        const scale = 1 + Math.sin(time * 3) * 0.05;
        leftKidneyRef.current.scale.setScalar(scale);
        rightKidneyRef.current.scale.setScalar(scale);
      } else {
        leftKidneyRef.current.scale.setScalar(1);
        rightKidneyRef.current.scale.setScalar(1);
      }
    }
  });

  return (
    <group onClick={onClick}>
      {/* Left Kidney */}
      <mesh ref={leftKidneyRef} position={[-1.5, 0, 0]}>
        <sphereGeometry args={[0.8, 16, 12]} />
        <meshStandardMaterial 
          color={getColor()} 
          metalness={0.1} 
          roughness={0.8}
          transparent
          opacity={isHighlighted ? 0.9 : 0.8}
        />
      </mesh>
      
      {/* Right Kidney */}
      <mesh ref={rightKidneyRef} position={[1.5, 0, 0]}>
        <sphereGeometry args={[0.8, 16, 12]} />
        <meshStandardMaterial 
          color={getColor()} 
          metalness={0.1} 
          roughness={0.8}
          transparent
          opacity={isHighlighted ? 0.9 : 0.8}
        />
      </mesh>

      {/* Renal arteries */}
      <mesh position={[-1.5, 0.3, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.6]} />
        <meshStandardMaterial color="#dc2626" />
      </mesh>
      <mesh position={[1.5, 0.3, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.6]} />
        <meshStandardMaterial color="#dc2626" />
      </mesh>

      {/* Ureters */}
      <mesh position={[-1.5, -0.8, 0]} rotation={[0, 0, 0.2]}>
        <cylinderGeometry args={[0.03, 0.03, 1.2]} />
        <meshStandardMaterial color="#fbbf24" />
      </mesh>
      <mesh position={[1.5, -0.8, 0]} rotation={[0, 0, -0.2]}>
        <cylinderGeometry args={[0.03, 0.03, 1.2]} />
        <meshStandardMaterial color="#fbbf24" />
      </mesh>

      {/* Risk level indicator */}
      <Text
        position={[0, 2, 0]}
        fontSize={0.3}
        color={getColor()}
        anchorX="center"
        anchorY="middle"
      >
        Renal System
      </Text>
    </group>
  );
};

const KidneyModel: React.FC<KidneyModelProps> = (props) => {
  return (
    <div className="w-full h-64 bg-gradient-to-b from-blue-50 to-blue-100 rounded-lg overflow-hidden">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />
        <pointLight position={[-10, -10, -5]} intensity={0.3} />
        
        <KidneyGeometry {...props} />
        
        <OrbitControls 
          enableZoom={true}
          enablePan={false}
          enableRotate={true}
          autoRotate={!props.isHighlighted}
          autoRotateSpeed={1}
        />
      </Canvas>
    </div>
  );
};

export default KidneyModel;

