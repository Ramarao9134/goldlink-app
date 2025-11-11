"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

export function Scene3D() {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<{
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer
    coin: THREE.Mesh
    particles: THREE.Points
    biscuits: THREE.Mesh[]
    animationId: number
  } | null>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    mount.appendChild(renderer.domElement)

    // Create gold coin with better details
    const geometry = new THREE.CylinderGeometry(1.2, 1.2, 0.15, 64)
    const material = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.95,
      roughness: 0.05,
      emissive: 0x332200,
      emissiveIntensity: 0.2,
    })
    const coin = new THREE.Mesh(geometry, material)
    scene.add(coin)

    // Add inner ring for detail
    const innerRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.8, 0.05, 16, 64),
      new THREE.MeshStandardMaterial({
        color: 0xffaa00,
        metalness: 0.9,
        roughness: 0.1,
      })
    )
    innerRing.rotation.x = Math.PI / 2
    coin.add(innerRing)

    // Create enhanced particle system for sparkles
    const particleCount = 500
    const particles = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 30
      positions[i + 1] = (Math.random() - 0.5) * 30
      positions[i + 2] = (Math.random() - 0.5) * 30

      // Vary colors between gold shades
      const goldShade = Math.random() > 0.5 ? 0xffd700 : (Math.random() > 0.5 ? 0xffaa00 : 0xffed4e)
      const color = new THREE.Color(goldShade)
      colors[i] = color.r
      colors[i + 1] = color.g
      colors[i + 2] = color.b
      
      sizes[i / 3] = Math.random() * 0.3 + 0.1
    }

    particles.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    particles.setAttribute("color", new THREE.BufferAttribute(colors, 3))
    particles.setAttribute("size", new THREE.BufferAttribute(sizes, 1))

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.2,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    })

    const particleSystem = new THREE.Points(particles, particleMaterial)
    scene.add(particleSystem)

    // Create gold biscuits (small gold bars)
    const biscuits: THREE.Mesh[] = []
    for (let i = 0; i < 15; i++) {
      const biscuitGeometry = new THREE.BoxGeometry(0.3, 0.1, 0.5)
      const biscuitMaterial = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        metalness: 0.9,
        roughness: 0.1,
        emissive: 0x332200,
        emissiveIntensity: 0.1,
      })
      const biscuit = new THREE.Mesh(biscuitGeometry, biscuitMaterial)
      biscuit.position.set(
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 10
      )
      biscuit.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      )
      scene.add(biscuit)
      biscuits.push(biscuit)
    }

    // Enhanced lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    scene.add(ambientLight)

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight1.position.set(5, 5, 5)
    scene.add(directionalLight1)

    const directionalLight2 = new THREE.DirectionalLight(0xffd700, 0.5)
    directionalLight2.position.set(-5, -5, -5)
    scene.add(directionalLight2)

    // Point lights for glow
    const pointLight1 = new THREE.PointLight(0xffd700, 2, 50)
    pointLight1.position.set(3, 3, 5)
    scene.add(pointLight1)

    const pointLight2 = new THREE.PointLight(0xffaa00, 1.5, 50)
    pointLight2.position.set(-3, -3, 5)
    scene.add(pointLight2)

    // Add subtle fog
    scene.fog = new THREE.FogExp2(0x000000, 0.05)

    camera.position.z = 5
    camera.position.y = 0.5

    let time = 0

    // Animation
    const animate = () => {
      const id = requestAnimationFrame(animate)
      time += 0.01

      // Rotate coin with smooth animation
      coin.rotation.x = Math.sin(time * 0.5) * 0.2
      coin.rotation.y += 0.015
      coin.rotation.z = Math.cos(time * 0.3) * 0.1

      // Animate particles with more dynamic movement
      const positions = particleSystem.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += Math.sin(time * 0.5 + i * 0.01) * 0.02
        positions[i + 1] += Math.cos(time * 0.7 + i * 0.01) * 0.02
        positions[i + 2] += Math.sin(time * 0.3 + i * 0.01) * 0.01
        
        // Wrap around
        if (positions[i] > 15) positions[i] = -15
        if (positions[i] < -15) positions[i] = 15
        if (positions[i + 1] > 15) positions[i + 1] = -15
        if (positions[i + 1] < -15) positions[i + 1] = 15
      }
      particleSystem.geometry.attributes.position.needsUpdate = true

      // Animate gold biscuits
      if (sceneRef.current?.biscuits) {
        sceneRef.current.biscuits.forEach((biscuit, idx) => {
          biscuit.rotation.x += 0.005 + idx * 0.001
          biscuit.rotation.y += 0.008 + idx * 0.001
          biscuit.position.y += Math.sin(time * 0.5 + idx) * 0.01
        })
      }

      // Animate lights
      pointLight1.position.x = Math.sin(time) * 3
      pointLight1.position.y = Math.cos(time) * 3
      pointLight2.position.x = Math.cos(time * 0.7) * 3
      pointLight2.position.y = Math.sin(time * 0.7) * 3

      // Camera subtle movement
      camera.position.x = Math.sin(time * 0.2) * 0.5
      camera.position.y = Math.cos(time * 0.15) * 0.3
      camera.lookAt(0, 0, 0)

      renderer.render(scene, camera)
      if (sceneRef.current) {
        sceneRef.current.animationId = id
      }
    }
    animate()

    sceneRef.current = { scene, camera, renderer, coin, particles: particleSystem, biscuits, animationId: 0 }

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.animationId)
        renderer.dispose()
        geometry.dispose()
        material.dispose()
        particles.dispose()
        particleMaterial.dispose()
        // Dispose biscuits
        if (sceneRef.current.biscuits) {
          sceneRef.current.biscuits.forEach(biscuit => {
            biscuit.geometry.dispose()
            if (Array.isArray(biscuit.material)) {
              biscuit.material.forEach(mat => mat.dispose())
            } else {
              biscuit.material.dispose()
            }
          })
        }
      }
      if (mount && mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <>
      <div
        className="absolute inset-0 -z-20"
        style={{ 
          background: "radial-gradient(ellipse at center, rgba(255,215,0,0.3) 0%, rgba(184,134,11,0.6) 30%, rgba(139,69,19,0.85) 60%, rgba(0,0,0,0.95) 100%)"
        }}
      />
      {/* Animated gold particles and sparkles background */}
      <div className="absolute inset-0 -z-15 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-yellow-400 opacity-30 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 3 + 1}s`,
              boxShadow: `0 0 ${Math.random() * 10 + 5}px rgba(255, 215, 0, 0.5)`,
            }}
          />
        ))}
        {/* Gold sparkles */}
        {[...Array(30)].map((_, i) => (
          <div
            key={`sparkle-${i}`}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: '4px',
              height: '4px',
              background: 'radial-gradient(circle, rgba(255,215,0,1) 0%, rgba(255,215,0,0) 70%)',
              borderRadius: '50%',
              animation: `sparkle ${Math.random() * 2 + 1}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
      <style jsx>{`
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>
      <div
        ref={mountRef}
        className="absolute inset-0 -z-10"
        style={{ 
          background: "transparent"
        }}
      />
    </>
  )
}

