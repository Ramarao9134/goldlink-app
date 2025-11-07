"use client"

import { useEffect, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Environment, MeshDistortMaterial } from "@react-three/drei"
import * as THREE from "three"

function GoldCoin() {
  const meshRef = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.2
    }
  })

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <cylinderGeometry args={[1, 1, 0.3, 64]} />
      <MeshDistortMaterial
        color="#FFD700"
        metalness={0.9}
        roughness={0.1}
        distort={0.2}
        speed={2}
      />
    </mesh>
  )
}

function Glow() {
  const meshRef = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z += 0.005
    }
  })

  return (
    <mesh ref={meshRef} position={[0, 0, -0.5]}>
      <ringGeometry args={[1.5, 2.5, 64]} />
      <meshBasicMaterial color="#FFD700" opacity={0.3} transparent />
    </mesh>
  )
}

export function ThreeDScene() {
  return (
    <div className="w-full h-full bg-gradient-to-br from-amber-900 via-yellow-900 to-orange-900">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-5, -5, -5]} intensity={0.5} color="#FFD700" />
        <GoldCoin />
        <Glow />
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
        <Environment preset="sunset" />
      </Canvas>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center text-white/80">
          <h2 className="text-4xl font-bold mb-2 drop-shadow-lg">GoldLink</h2>
          <p className="text-lg drop-shadow">Secure Gold Lending</p>
        </div>
      </div>
    </div>
  )
}

