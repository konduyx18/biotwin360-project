import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

interface HeartModelProps {
  riskLevel: 'low' | 'moderate' | 'high';
  isHighlighted: boolean;
  onClick?: () => void;
}

const HeartGeometry: React.FC<HeartModelProps> = ({ riskLevel, isHighlighted, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Heart shape using mathematical formula
  const heartShape = new THREE.Shape();
  const x = 0, y = 0;
  heartShape.moveTo(x + 5, y + 5);
  heartShape.bezierCurveTo(x + 5, y + 5, x + 4, y, x, y);
  heartShape.bezierCurveTo(x - 6, y, x - 6, y + 3.5, x - 6, y + 3.5);
  heartShape.bezierCurveTo(x - 6, y + 5.5, x - 4, y + 7.7, x, y + 10);
  heartShape.bezierCurveTo(x + 4, y + 7.7, x + 6, y + 5.5, x + 6, y + 3.5);
  heartShape.bezierCurveTo(x + 6, y + 3.5, x + 6, y, x, y);

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
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      if (isHighlighted) {
        meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.05);
      } else {
        meshRef.current.scale.setScalar(1);
      }
    }
  });

  return (
    <group onClick={onClick}>
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <extrudeGeometry
          args={[
            heartShape,
            {
              depth: 1,
              bevelEnabled: true,
              bevelSegments: 2,
              steps: 2,
              bevelSize: 0.1,
              bevelThickness: 0.1,
            },
          ]}
        />
        <meshStandardMaterial
          color={getColor()}
          metalness={0.3}
          roughness={0.4}
          emissive={isHighlighted ? getColor() : '#000000'}
          emissiveIntensity={isHighlighted ? 0.2 : 0}
        />
      </mesh>
      
      {/* Heart label */}
      <Text
        position={[0, -8, 0]}
        fontSize={1.5}
        color="#374151"
        anchorX="center"
        anchorY="middle"
      >
        Heart
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

const HeartModel: React.FC<HeartModelProps> = (props) => {
  return (
    <div className="w-full h-96 bg-gradient-to-b from-blue-50 to-white rounded-xl overflow-hidden">
      <Canvas camera={{ position: [0, 0, 20], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />
        
        <HeartGeometry {...props} />
        
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          enableRotate={true}
          autoRotate={!props.isHighlighted}
          autoRotateSpeed={2}
          maxDistance={30}
          minDistance={10}
        />
      </Canvas>
    </div>
  );
};

export default HeartModel;

