import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

interface BrainModelProps {
  riskLevel: 'low' | 'moderate' | 'high';
  isHighlighted: boolean;
  onClick?: () => void;
}

const BrainGeometry: React.FC<BrainModelProps> = ({ riskLevel, isHighlighted, onClick }) => {
  const brainRef = useRef<THREE.Mesh>(null);
  const leftHemisphereRef = useRef<THREE.Mesh>(null);
  const rightHemisphereRef = useRef<THREE.Mesh>(null);
  const neuronsRef = useRef<THREE.Group>(null);

  // Color based on risk level
  const getColor = () => {
    switch (riskLevel) {
      case 'low': return '#22c55e'; // Green
      case 'moderate': return '#f59e0b'; // Orange
      case 'high': return '#ef4444'; // Red
      default: return '#dc2626';
    }
  };

  // Animation - neural activity simulation
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (leftHemisphereRef.current && rightHemisphereRef.current) {
      // Subtle pulsing to simulate brain activity
      const pulse = Math.sin(time * 2) * 0.02 + 1;
      leftHemisphereRef.current.scale.setScalar(pulse);
      rightHemisphereRef.current.scale.setScalar(pulse);
      
      if (isHighlighted) {
        const highlight = 1 + Math.sin(time * 5) * 0.05;
        leftHemisphereRef.current.scale.multiplyScalar(highlight);
        rightHemisphereRef.current.scale.multiplyScalar(highlight);
      }
    }

    // Animate neural connections
    if (neuronsRef.current) {
      neuronsRef.current.children.forEach((child, index) => {
        if (child instanceof THREE.Mesh) {
          const offset = index * 0.5;
          child.material.opacity = 0.3 + Math.sin(time * 3 + offset) * 0.2;
        }
      });
    }
  });

  return (
    <group onClick={onClick}>
      {/* Left Hemisphere */}
      <mesh ref={leftHemisphereRef} position={[-0.6, 0, 0]}>
        <sphereGeometry args={[1, 16, 12]} />
        <meshStandardMaterial 
          color={getColor()} 
          metalness={0.2} 
          roughness={0.8}
          transparent
          opacity={isHighlighted ? 0.9 : 0.8}
        />
      </mesh>
      
      {/* Right Hemisphere */}
      <mesh ref={rightHemisphereRef} position={[0.6, 0, 0]}>
        <sphereGeometry args={[1, 16, 12]} />
        <meshStandardMaterial 
          color={getColor()} 
          metalness={0.2} 
          roughness={0.8}
          transparent
          opacity={isHighlighted ? 0.9 : 0.8}
        />
      </mesh>

      {/* Corpus Callosum (connection between hemispheres) */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 1.2]} />
        <meshStandardMaterial color="#f3f4f6" />
      </mesh>

      {/* Brain Stem */}
      <mesh position={[0, -1.2, 0]}>
        <cylinderGeometry args={[0.3, 0.2, 0.8]} />
        <meshStandardMaterial color="#d1d5db" />
      </mesh>

      {/* Cerebellum */}
      <mesh position={[0, -0.5, -0.8]}>
        <sphereGeometry args={[0.4, 12, 8]} />
        <meshStandardMaterial color="#9ca3af" />
      </mesh>

      {/* Neural Networks Visualization */}
      <group ref={neuronsRef}>
        {Array.from({ length: 30 }, (_, i) => {
          const phi = Math.acos(-1 + (2 * i) / 30);
          const theta = Math.sqrt(30 * Math.PI) * phi;
          const radius = 1.2;
          
          const x = radius * Math.cos(theta) * Math.sin(phi);
          const y = radius * Math.sin(theta) * Math.sin(phi);
          const z = radius * Math.cos(phi);
          
          return (
            <mesh key={i} position={[x, y, z]}>
              <sphereGeometry args={[0.02, 6, 6]} />
              <meshStandardMaterial 
                color="#fbbf24" 
                transparent 
                opacity={0.5}
                emissive="#fbbf24"
                emissiveIntensity={0.2}
              />
            </mesh>
          );
        })}

        {/* Neural connections */}
        {Array.from({ length: 15 }, (_, i) => {
          const startAngle = (i / 15) * Math.PI * 2;
          const endAngle = ((i + 3) / 15) * Math.PI * 2;
          const radius = 1.1;
          
          const startX = Math.cos(startAngle) * radius;
          const startY = Math.sin(startAngle) * radius * 0.5;
          const endX = Math.cos(endAngle) * radius;
          const endY = Math.sin(endAngle) * radius * 0.5;
          
          const midX = (startX + endX) / 2;
          const midY = (startY + endY) / 2;
          const length = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
          const angle = Math.atan2(endY - startY, endX - startX);
          
          return (
            <mesh 
              key={`connection-${i}`} 
              position={[midX, midY, 0]} 
              rotation={[0, 0, angle]}
            >
              <cylinderGeometry args={[0.005, 0.005, length]} />
              <meshStandardMaterial 
                color="#60a5fa" 
                transparent 
                opacity={0.4}
                emissive="#60a5fa"
                emissiveIntensity={0.1}
              />
            </mesh>
          );
        })}
      </group>

      {/* Brain regions labels */}
      <group>
        {/* Frontal Lobe */}
        <mesh position={[0, 0.5, 0.8]}>
          <sphereGeometry args={[0.15, 8, 6]} />
          <meshStandardMaterial color="#8b5cf6" transparent opacity={0.6} />
        </mesh>
        
        {/* Parietal Lobe */}
        <mesh position={[0, 0.8, -0.3]}>
          <sphereGeometry args={[0.12, 8, 6]} />
          <meshStandardMaterial color="#06b6d4" transparent opacity={0.6} />
        </mesh>
        
        {/* Temporal Lobe */}
        <mesh position={[-0.8, -0.2, 0]}>
          <sphereGeometry args={[0.1, 8, 6]} />
          <meshStandardMaterial color="#f59e0b" transparent opacity={0.6} />
        </mesh>
        <mesh position={[0.8, -0.2, 0]}>
          <sphereGeometry args={[0.1, 8, 6]} />
          <meshStandardMaterial color="#f59e0b" transparent opacity={0.6} />
        </mesh>
        
        {/* Occipital Lobe */}
        <mesh position={[0, 0.2, -1]}>
          <sphereGeometry args={[0.1, 8, 6]} />
          <meshStandardMaterial color="#ec4899" transparent opacity={0.6} />
        </mesh>
      </group>

      {/* Risk level indicator */}
      <Text
        position={[0, 2.2, 0]}
        fontSize={0.3}
        color={getColor()}
        anchorX="center"
        anchorY="middle"
      >
        Neurological System
      </Text>
    </group>
  );
};

const BrainModel: React.FC<BrainModelProps> = (props) => {
  return (
    <div className="w-full h-64 bg-gradient-to-b from-purple-50 to-purple-100 rounded-lg overflow-hidden">
      <Canvas camera={{ position: [0, 0, 4], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={0.7} />
        <pointLight position={[-10, -10, -5]} intensity={0.4} />
        <spotLight position={[0, 5, 2]} intensity={0.6} angle={0.4} />
        
        <BrainGeometry {...props} />
        
        <OrbitControls 
          enableZoom={true}
          enablePan={false}
          enableRotate={true}
          autoRotate={!props.isHighlighted}
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
};

export default BrainModel;

