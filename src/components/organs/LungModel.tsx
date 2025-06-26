import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

interface LungModelProps {
  riskLevel: 'low' | 'moderate' | 'high';
  isHighlighted: boolean;
  onClick?: () => void;
}

const LungGeometry: React.FC<LungModelProps> = ({ riskLevel, isHighlighted, onClick }) => {
  const leftLungRef = useRef<THREE.Mesh>(null);
  const rightLungRef = useRef<THREE.Mesh>(null);
  const tracheaRef = useRef<THREE.Mesh>(null);
  const bronchiRef = useRef<THREE.Group>(null);

  // Color based on risk level
  const getColor = () => {
    switch (riskLevel) {
      case 'low': return '#22c55e'; // Green
      case 'moderate': return '#f59e0b'; // Orange
      case 'high': return '#ef4444'; // Red
      default: return '#dc2626';
    }
  };

  // Animation - breathing effect
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const breathingCycle = Math.sin(time * 1.5) * 0.1 + 1; // Breathing rhythm
    
    if (leftLungRef.current && rightLungRef.current) {
      // Breathing expansion/contraction
      leftLungRef.current.scale.set(breathingCycle, breathingCycle, breathingCycle);
      rightLungRef.current.scale.set(breathingCycle, breathingCycle, breathingCycle);
      
      if (isHighlighted) {
        const highlight = 1 + Math.sin(time * 4) * 0.08;
        leftLungRef.current.scale.multiplyScalar(highlight);
        rightLungRef.current.scale.multiplyScalar(highlight);
      }
    }

    if (tracheaRef.current) {
      tracheaRef.current.rotation.z = Math.sin(time * 2) * 0.02;
    }
  });

  return (
    <group onClick={onClick}>
      {/* Trachea */}
      <mesh ref={tracheaRef} position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 1]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>

      {/* Left Lung */}
      <mesh ref={leftLungRef} position={[-1.2, 0, 0]}>
        <sphereGeometry args={[1, 12, 8]} />
        <meshStandardMaterial 
          color={getColor()} 
          metalness={0.1} 
          roughness={0.9}
          transparent
          opacity={isHighlighted ? 0.85 : 0.75}
        />
      </mesh>
      
      {/* Right Lung (slightly larger) */}
      <mesh ref={rightLungRef} position={[1.2, 0, 0]}>
        <sphereGeometry args={[1.1, 12, 8]} />
        <meshStandardMaterial 
          color={getColor()} 
          metalness={0.1} 
          roughness={0.9}
          transparent
          opacity={isHighlighted ? 0.85 : 0.75}
        />
      </mesh>

      {/* Bronchi */}
      <group ref={bronchiRef}>
        {/* Left main bronchus */}
        <mesh position={[-0.6, 0.8, 0]} rotation={[0, 0, -0.3]}>
          <cylinderGeometry args={[0.08, 0.08, 0.8]} />
          <meshStandardMaterial color="#9ca3af" />
        </mesh>
        
        {/* Right main bronchus */}
        <mesh position={[0.6, 0.8, 0]} rotation={[0, 0, 0.3]}>
          <cylinderGeometry args={[0.08, 0.08, 0.8]} />
          <meshStandardMaterial color="#9ca3af" />
        </mesh>

        {/* Secondary bronchi - Left */}
        <mesh position={[-1, 0.3, 0]} rotation={[0, 0, -0.5]}>
          <cylinderGeometry args={[0.05, 0.05, 0.5]} />
          <meshStandardMaterial color="#9ca3af" />
        </mesh>
        <mesh position={[-1.3, -0.2, 0]} rotation={[0, 0, -0.7]}>
          <cylinderGeometry args={[0.05, 0.05, 0.5]} />
          <meshStandardMaterial color="#9ca3af" />
        </mesh>

        {/* Secondary bronchi - Right */}
        <mesh position={[1, 0.3, 0]} rotation={[0, 0, 0.5]}>
          <cylinderGeometry args={[0.05, 0.05, 0.5]} />
          <meshStandardMaterial color="#9ca3af" />
        </mesh>
        <mesh position={[1.3, -0.2, 0]} rotation={[0, 0, 0.7]}>
          <cylinderGeometry args={[0.05, 0.05, 0.5]} />
          <meshStandardMaterial color="#9ca3af" />
        </mesh>
        <mesh position={[1.1, -0.6, 0]} rotation={[0, 0, 0.3]}>
          <cylinderGeometry args={[0.05, 0.05, 0.4]} />
          <meshStandardMaterial color="#9ca3af" />
        </mesh>
      </group>

      {/* Alveoli representation (small spheres) */}
      {Array.from({ length: 20 }, (_, i) => {
        const angle = (i / 20) * Math.PI * 2;
        const radius = 0.8;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const side = i < 10 ? -1.2 : 1.2;
        
        return (
          <mesh key={i} position={[side + x * 0.3, z * 0.5, x * 0.2]}>
            <sphereGeometry args={[0.03, 6, 6]} />
            <meshStandardMaterial 
              color={getColor()} 
              transparent 
              opacity={0.6}
            />
          </mesh>
        );
      })}

      {/* Risk level indicator */}
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.3}
        color={getColor()}
        anchorX="center"
        anchorY="middle"
      >
        Pulmonary System
      </Text>
    </group>
  );
};

const LungModel: React.FC<LungModelProps> = (props) => {
  return (
    <div className="w-full h-64 bg-gradient-to-b from-cyan-50 to-cyan-100 rounded-lg overflow-hidden">
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />
        <pointLight position={[-10, -10, -5]} intensity={0.3} />
        <spotLight position={[0, 5, 0]} intensity={0.5} angle={0.3} />
        
        <LungGeometry {...props} />
        
        <OrbitControls 
          enableZoom={true}
          enablePan={false}
          enableRotate={true}
          autoRotate={!props.isHighlighted}
          autoRotateSpeed={0.8}
        />
      </Canvas>
    </div>
  );
};

export default LungModel;

