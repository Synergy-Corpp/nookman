import React, { useRef, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { FieldEvent } from '../types'

interface FieldVisualizerProps {
  events: FieldEvent[]
}

const FieldVisualizer: React.FC<FieldVisualizerProps> = ({ events }) => {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene>()
  const rendererRef = useRef<THREE.WebGLRenderer>()
  const cameraRef = useRef<THREE.PerspectiveCamera>()
  const particleSystemRef = useRef<THREE.Points>()
  const animationIdRef = useRef<number>()

  // Create fractal geometry
  const createFractalGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry()
    const vertices = []
    const colors = []

    // Generate fractal pattern
    for (let i = 0; i < 5000; i++) {
      const x = (Math.random() - 0.5) * 20
      const y = (Math.random() - 0.5) * 20
      const z = (Math.random() - 0.5) * 20

      // Add fractal positioning
      const scale = Math.sin(i * 0.1) * Math.cos(i * 0.05)
      vertices.push(x + scale, y + scale, z + scale)

      // Green gradient colors
      const intensity = Math.random()
      colors.push(0, intensity * 0.8 + 0.2, intensity * 0.3)
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))

    return geometry
  }, [])

  useEffect(() => {
    if (!mountRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000000)
    sceneRef.current = scene

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    camera.position.z = 15
    cameraRef.current = camera

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ alpha: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    rendererRef.current = renderer

    mountRef.current.appendChild(renderer.domElement)

    // Particle system
    const material = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    })

    const particleSystem = new THREE.Points(createFractalGeometry, material)
    particleSystemRef.current = particleSystem
    scene.add(particleSystem)

    // Add ambient lighting
    const ambientLight = new THREE.AmbientLight(0x00ff88, 0.3)
    scene.add(ambientLight)

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0x00ffaa, 0.5)
    directionalLight.position.set(5, 5, 5)
    scene.add(directionalLight)

    // Create field grid
    const gridGeometry = new THREE.PlaneGeometry(40, 40, 50, 50)
    const gridMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      wireframe: true,
      transparent: true,
      opacity: 0.1
    })
    const grid = new THREE.Mesh(gridGeometry, gridMaterial)
    grid.rotation.x = -Math.PI / 2
    grid.position.y = -10
    scene.add(grid)

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate)

      if (particleSystemRef.current) {
        // Rotate particle system
        particleSystemRef.current.rotation.x += 0.001
        particleSystemRef.current.rotation.y += 0.002

        // Pulse effect based on events
        const time = Date.now() * 0.001
        const scale = 1 + Math.sin(time * 2) * 0.1
        particleSystemRef.current.scale.setScalar(scale)
      }

      // Camera orbit
      if (cameraRef.current) {
        const time = Date.now() * 0.0005
        cameraRef.current.position.x = Math.cos(time) * 20
        cameraRef.current.position.z = Math.sin(time) * 20
        cameraRef.current.lookAt(0, 0, 0)
      }

      renderer.render(scene, camera)
    }

    animate()

    // Handle resize
    const handleResize = () => {
      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight
        cameraRef.current.updateProjectionMatrix()
        rendererRef.current.setSize(window.innerWidth, window.innerHeight)
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [createFractalGeometry])

  // React to field events
  useEffect(() => {
    if (!particleSystemRef.current) return

    events.forEach(event => {
      const material = particleSystemRef.current?.material as THREE.PointsMaterial
      if (material) {
        // Pulse effect
        if (event.type === 'buy') {
          material.opacity = Math.min(1, material.opacity + event.intensity * 0.1)
          material.size = Math.min(0.2, material.size + event.intensity * 0.01)
        } else if (event.type === 'sell') {
          material.opacity = Math.max(0.3, material.opacity - event.intensity * 0.05)
        } else if (event.type === 'pulse') {
          // Fractal ripple effect
          material.size = 0.3
          setTimeout(() => {
            if (material) material.size = 0.05
          }, 1000)
        }
      }
    })
  }, [events])

  return (
    <div 
      ref={mountRef} 
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ background: 'radial-gradient(circle at center, #001122 0%, #000000 70%)' }}
    />
  )
}

export default FieldVisualizer