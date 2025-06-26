import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

interface MusculoskeletalModelProps {
  riskLevel: 'low' | 'moderate' | 'high';
  isHighlighted: boolean;
  onClick?: () => void;
}

const MusculoskeletalGeometry: React.FC<MusculoskeletalModelProps> = ({ riskLevel, isHighlighted, onClick }) => {
  const spineRef = useRef<THREE.Group>(null);
  const musclesRef = useRef<THREE.Group>(null);
  const jointsRef = useRef<THREE.Group>(null);

  // Color based on risk level
  const getColor = () => {
    switch (riskLevel) {
      case 'low': return '#22c55e'; // Green
      case 'moderate': return '#f59e0b'; // Orange
      case 'high': return '#ef4444'; // Red
      default: return '#dc2626';
    }
  };

  // Animation - muscle contraction and joint movement
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (spineRef.current) {
      // Subtle spine movement
      spineRef.current.rotation.z = Math.sin(time * 0.5) * 0.05;
      
      if (isHighlighted) {
        const highlight = 1 + Math.sin(time * 4) * 0.03;
        spineRef.current.scale.setScalar(highlight);
      } else {
        spineRef.current.scale.setScalar(1);
      }
    }

    // Animate muscle fibers
    if (musclesRef.current) {
      musclesRef.current.children.forEach((child, index) => {
        if (child instanceof THREE.Mesh) {
          const offset = index * 0.3;
          const contraction = Math.sin(time * 2 + offset) * 0.02 + 1;
          child.scale.y = contraction;
        }
      });
    }

    // Animate joints
    if (jointsRef.current) {
      jointsRef.current.children.forEach((child, index) => {
        if (child instanceof THREE.Mesh) {
          const rotation = Math.sin(time * 1.5 + index) * 0.1;
          child.rotation.x = rotation;
        }
      });
    }
  });

  return (
    <group onClick={onClick}>
      {/* Spine/Vertebral Column */}
      <group ref={spineRef}>
        {Array.from({ length: 12 }, (_, i) => (
          <mesh key={`vertebra-${i}`} position={[0, 1.5 - i * 0.25, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 0.2]} />
            <meshStandardMaterial color="#f3f4f6" />
          </mesh>
        ))}
        
        {/* Spinal cord */}
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 3]} />
          <meshStandardMaterial color="#fbbf24" />
        </mesh>
      </group>

      {/* Major Muscle Groups */}
      <group ref={musclesRef}>
        {/* Trapezius */}
        <mesh position={[0, 1.2, -0.3]}>
          <boxGeometry args={[1.5, 0.8, 0.2]} />
          <meshStandardMaterial 
            color={getColor()} 
            transparent 
            opacity={0.7}
          />
        </mesh>
        
        {/* Latissimus Dorsi */}
        <mesh position={[0, 0.5, -0.25]} rotation={[0, 0, 0]}>
          <boxGeometry args={[1.8, 1.2, 0.15]} />
          <meshStandardMaterial 
            color={getColor()} 
            transparent 
            opacity={0.6}
          />
        </mesh>
        
        {/* Erector Spinae */}
        <mesh position={[-0.3, 0.5, -0.15]}>
          <cylinderGeometry args={[0.08, 0.08, 2.5]} />
          <meshStandardMaterial color={getColor()} />
        </mesh>
        <mesh position={[0.3, 0.5, -0.15]}>
          <cylinderGeometry args={[0.08, 0.08, 2.5]} />
          <meshStandardMaterial color={getColor()} />
        </mesh>
        
        {/* Quadriceps */}
        <mesh position={[-0.4, -1.5, 0.2]}>
          <cylinderGeometry args={[0.12, 0.12, 1]} />
          <meshStandardMaterial color={getColor()} />
        </mesh>
        <mesh position={[0.4, -1.5, 0.2]}>
          <cylinderGeometry args={[0.12, 0.12, 1]} />
          <meshStandardMaterial color={getColor()} />
        </mesh>
        
        {/* Hamstrings */}
        <mesh position={[-0.4, -1.5, -0.2]}>
          <cylinderGeometry args={[0.1, 0.1, 1]} />
          <meshStandardMaterial color={getColor()} />
        </mesh>
        <mesh position={[0.4, -1.5, -0.2]}>
          <cylinderGeometry args={[0.1, 0.1, 1]} />
          <meshStandardMaterial color={getColor()} />
        </mesh>
        
        {/* Biceps */}
        <mesh position={[-0.8, 0.8, 0.3]} rotation={[0, 0, -0.3]}>
          <cylinderGeometry args={[0.08, 0.08, 0.8]} />
          <meshStandardMaterial color={getColor()} />
        </mesh>
        <mesh position={[0.8, 0.8, 0.3]} rotation={[0, 0, 0.3]}>
          <cylinderGeometry args={[0.08, 0.08, 0.8]} />
          <meshStandardMaterial color={getColor()} />
        </mesh>
      </group>

      {/* Major Joints */}
      <group ref={jointsRef}>
        {/* Shoulder joints */}
        <mesh position={[-0.8, 1.2, 0]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial color="#dc2626" />
        </mesh>
        <mesh position={[0.8, 1.2, 0]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial color="#dc2626" />
        </mesh>
        
        {/* Hip joints */}
        <mesh position={[-0.3, -0.5, 0]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color="#dc2626" />
        </mesh>
        <mesh position={[0.3, -0.5, 0]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color="#dc2626" />
        </mesh>
        
        {/* Knee joints */}
        <mesh position={[-0.4, -1.8, 0]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#dc2626" />
        </mesh>
        <mesh position={[0.4, -1.8, 0]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#dc2626" />
        </mesh>
        
        {/* Elbow joints */}
        <mesh position={[-0.8, 0.4, 0.3]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#dc2626" />
        </mesh>
        <mesh position={[0.8, 0.4, 0.3]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#dc2626" />
        </mesh>
      </group>

      {/* Bone Structure */}
      <group>
        {/* Femur bones */}
        <mesh position={[-0.4, -1, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 1.2]} />
          <meshStandardMaterial color="#f9fafb" />
        </mesh>
        <mesh position={[0.4, -1, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 1.2]} />
          <meshStandardMaterial color="#f9fafb" />
        </mesh>
        
        {/* Tibia bones */}
        <mesh position={[-0.4, -2.3, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 1]} />
          <meshStandardMaterial color="#f9fafb" />
        </mesh>
        <mesh position={[0.4, -2.3, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 1]} />
          <meshStandardMaterial color="#f9fafb" />
        </mesh>
        
        {/* Humerus bones */}
        <mesh position={[-0.8, 0.8, 0.3]} rotation={[0, 0, -0.3]}>
          <cylinderGeometry args={[0.04, 0.04, 0.8]} />
          <meshStandardMaterial color="#f9fafb" />
        </mesh>
        <mesh position={[0.8, 0.8, 0.3]} rotation={[0, 0, 0.3]}>
          <cylinderGeometry args={[0.04, 0.04, 0.8]} />
          <meshStandardMaterial color="#f9fafb" />
        </mesh>
        
        {/* Pelvis */}
        <mesh position={[0, -0.5, 0]}>
          <boxGeometry args={[0.8, 0.3, 0.4]} />
          <meshStandardMaterial color="#f9fafb" />
        </mesh>
        
        {/* Ribcage */}
        {Array.from({ length: 8 }, (_, i) => (
          <mesh 
            key={`rib-${i}`} 
            position={[0, 1.2 - i * 0.15, 0]} 
            rotation={[0, 0, Math.sin(i * 0.5) * 0.2]}
          >
            <torusGeometry args={[0.4 + i * 0.02, 0.02, 4, 12]} />
            <meshStandardMaterial color="#f9fafb" />
          </mesh>
        ))}
      </group>

      {/* Muscle fiber details */}
      <group>
        {Array.from({ length: 20 }, (_, i) => {
          const angle = (i / 20) * Math.PI * 2;
          const radius = 0.6;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          
          return (
            <mesh key={`fiber-${i}`} position={[x, 0.5, z]} rotation={[0, angle, 0]}>
              <cylinderGeometry args={[0.01, 0.01, 0.3]} />
              <meshStandardMaterial 
                color={getColor()} 
                transparent 
                opacity={0.4}
              />
            </mesh>
          );
        })}
      </group>

      {/* Risk level indicator */}
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.3}
        color={getColor()}
        anchorX="center"
        anchorY="middle"
      >
        Musculoskeletal System
      </Text>
    </group>
  );
};

const MusculoskeletalModel: React.FC<MusculoskeletalModelProps> = (props) => {
  return (
    <div className="w-full h-64 bg-gradient-to-b from-amber-50 to-amber-100 rounded-lg overflow-hidden">
      <Canvas camera={{ position: [2, 0, 4], fov: 60 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />
        <pointLight position={[-10, -10, -5]} intensity={0.4} />
        <spotLight position={[5, 5, 5]} intensity={0.5} angle={0.3} />
        
        <MusculoskeletalGeometry {...props} />
        
        <OrbitControls 
          enableZoom={true}
          enablePan={false}
          enableRotate={true}
          autoRotate={!props.isHighlighted}
          autoRotateSpeed={0.6}
        />
      </Canvas>
    </div>
  );
};

export default MusculoskeletalModel;

