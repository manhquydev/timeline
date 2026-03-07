'use client'

import { useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'
import { CARD_TEMPLATES_8_3, type CardTemplate } from '@/lib/themes/card-templates-8-3'

const CARD_W = 0.7
const CARD_H = 1.0
const CANVAS_SIZE = { w: 512, h: 720 }

interface CardData {
  mesh: THREE.Mesh
  templateId: number
  velocity: { x: number; y: number; z: number }
  rotationSpeed: { x: number; y: number; z: number }
  swayOffset: number
  swaySpeed: number
}

interface FallingCardsProps {
  onCardClick: (templateId: number) => void
}

function createCardTexture(template: CardTemplate, side: 'front' | 'back'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = CANVAS_SIZE.w
  canvas.height = CANVAS_SIZE.h
  const ctx = canvas.getContext('2d')!
  if (side === 'front') template.drawFront(ctx, CANVAS_SIZE.w, CANVAS_SIZE.h)
  else template.drawBack(ctx, CANVAS_SIZE.w, CANVAS_SIZE.h)
  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

function spawnCard(
  scene: THREE.Scene,
  frustumW: number,
  frustumH: number,
  preflight = false
): CardData {
  const template = CARD_TEMPLATES_8_3[Math.floor(Math.random() * CARD_TEMPLATES_8_3.length)]

  const frontTex = createCardTexture(template, 'front')
  const backTex = createCardTexture(template, 'back')

  // DoubleSide with front/back texture via custom material array
  const geometry = new THREE.PlaneGeometry(CARD_W, CARD_H)
  const frontMat = new THREE.MeshStandardMaterial({
    map: frontTex,
    transparent: true,
    side: THREE.FrontSide,
  })
  const backMat = new THREE.MeshStandardMaterial({
    map: backTex,
    transparent: true,
    side: THREE.BackSide,
  })

  // Two meshes combined in a group acting as single card
  const frontMesh = new THREE.Mesh(geometry, frontMat)
  const backMesh = new THREE.Mesh(geometry, backMat)
  const group = new THREE.Group()
  group.add(frontMesh, backMesh)

  const x = (Math.random() - 0.5) * frustumW * 1.2
  const y = preflight
    ? (Math.random() - 0.5) * frustumH  // start scattered for initial fill
    : frustumH / 2 + CARD_H             // spawn above visible area

  group.position.set(x, y, (Math.random() - 0.5) * 1.5)
  group.rotation.set(
    Math.random() * 0.3 - 0.15,
    Math.random() * Math.PI * 2,
    Math.random() * 0.4 - 0.2
  )

  scene.add(group as unknown as THREE.Object3D)

  return {
    mesh: group as unknown as THREE.Mesh,
    templateId: template.id,
    velocity: {
      x: (Math.random() - 0.5) * 0.01,
      y: -(0.008 + Math.random() * 0.01),
      z: 0,
    },
    rotationSpeed: {
      x: (Math.random() - 0.5) * 0.008,
      y: (Math.random() - 0.5) * 0.01,
      z: (Math.random() - 0.5) * 0.006,
    },
    swayOffset: Math.random() * Math.PI * 2,
    swaySpeed: 0.3 + Math.random() * 0.4,
  }
}

export function FallingCards({ onCardClick }: FallingCardsProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<{
    renderer: THREE.WebGLRenderer
    scene: THREE.Scene
    camera: THREE.OrthographicCamera
    cards: CardData[]
    frustumW: number
    frustumH: number
    raycaster: THREE.Raycaster
    mouse: THREE.Vector2
    hoveredMesh: THREE.Object3D | null
    animId: number
  } | null>(null)

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const MAX_CARDS = isMobile ? 10 : 18

  const getClickedTemplateId = useCallback((event: MouseEvent | TouchEvent) => {
    const s = sceneRef.current
    if (!s) return null

    const rect = s.renderer.domElement.getBoundingClientRect()
    let clientX: number, clientY: number
    if ('touches' in event) {
      clientX = event.touches[0]?.clientX ?? 0
      clientY = event.touches[0]?.clientY ?? 0
    } else {
      clientX = event.clientX
      clientY = event.clientY
    }

    s.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1
    s.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1
    s.raycaster.setFromCamera(s.mouse, s.camera)

    const meshChildren: THREE.Object3D[] = []
    s.cards.forEach(c => {
      meshChildren.push(...(c.mesh as unknown as THREE.Group).children)
    })
    const intersects = s.raycaster.intersectObjects(meshChildren)

    if (intersects.length > 0) {
      const hitChild = intersects[0].object
      const parentGroup = hitChild.parent
      const card = s.cards.find(c => c.mesh === (parentGroup as unknown as THREE.Mesh))
      return card?.templateId ?? null
    }
    return null
  }, [])

  useEffect(() => {
    if (!mountRef.current) return

    const container = mountRef.current
    const W = container.clientWidth
    const H = container.clientHeight
    const aspect = W / H
    const frustumH = 12
    const frustumW = frustumH * aspect

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    renderer.domElement.style.pointerEvents = 'auto'
    container.appendChild(renderer.domElement)

    // Camera
    const camera = new THREE.OrthographicCamera(
      -frustumW / 2, frustumW / 2,
      frustumH / 2, -frustumH / 2,
      0.1, 100
    )
    camera.position.z = 10

    // Scene
    const scene = new THREE.Scene()

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 1.2)
    scene.add(ambient)
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6)
    dirLight.position.set(5, 10, 5)
    scene.add(dirLight)

    // Raycaster
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    // Spawn initial cards (preflight = scattered)
    const cards: CardData[] = []
    for (let i = 0; i < MAX_CARDS; i++) {
      cards.push(spawnCard(scene, frustumW, frustumH, true))
    }

    let hoveredMesh: THREE.Object3D | null = null
    let animId = 0
    let elapsed = 0

    const animate = () => {
      animId = requestAnimationFrame(animate)
      elapsed += 0.016

      cards.forEach(card => {
        const group = card.mesh as unknown as THREE.Group

        // Gravity + sway
        group.position.x += card.velocity.x + Math.sin(elapsed * card.swaySpeed + card.swayOffset) * 0.003
        group.position.y += card.velocity.y

        // Tumble rotation
        group.rotation.x += card.rotationSpeed.x
        group.rotation.y += card.rotationSpeed.y
        group.rotation.z += card.rotationSpeed.z

        // Recycle when below screen
        if (group.position.y < -frustumH / 2 - CARD_H) {
          const nx = (Math.random() - 0.5) * frustumW * 1.2
          group.position.set(nx, frustumH / 2 + CARD_H + Math.random() * 2, group.position.z)
          group.rotation.set(
            Math.random() * 0.3 - 0.15,
            Math.random() * Math.PI * 2,
            Math.random() * 0.4 - 0.2
          )
        }

        // Hover scale effect
        const isHovered = hoveredMesh !== null && hoveredMesh.parent === group
        const targetScale = isHovered ? 1.15 : 1.0
        group.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)
      })

      renderer.render(scene, camera)
    }
    animate()

    // Hover detection
    const onMouseMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect()
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(mouse, camera)

      const meshChildren: THREE.Object3D[] = []
      cards.forEach(c => meshChildren.push(...(c.mesh as unknown as THREE.Group).children))
      const hits = raycaster.intersectObjects(meshChildren)
      hoveredMesh = hits.length > 0 ? hits[0].object : null
      renderer.domElement.style.cursor = hoveredMesh ? 'pointer' : 'default'
    }

    const onClick = (e: MouseEvent) => {
      const templateId = getClickedTemplateId(e)
      if (templateId !== null) onCardClick(templateId)
    }

    const onTouchEnd = (e: TouchEvent) => {
      // Use changedTouches for touchend
      const touch = e.changedTouches[0]
      if (!touch) return
      const rect = renderer.domElement.getBoundingClientRect()
      const mx = ((touch.clientX - rect.left) / rect.width) * 2 - 1
      const my = -((touch.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(new THREE.Vector2(mx, my), camera)
      const meshChildren: THREE.Object3D[] = []
      cards.forEach(c => meshChildren.push(...(c.mesh as unknown as THREE.Group).children))
      const hits = raycaster.intersectObjects(meshChildren)
      if (hits.length > 0) {
        const hit = hits[0].object
        const card = cards.find(c => c.mesh === (hit.parent as unknown as THREE.Mesh))
        if (card) onCardClick(card.templateId)
      }
    }

    renderer.domElement.addEventListener('mousemove', onMouseMove)
    renderer.domElement.addEventListener('click', onClick)
    renderer.domElement.addEventListener('touchend', onTouchEnd)

    // Resize
    const onResize = () => {
      const nW = container.clientWidth
      const nH = container.clientHeight
      renderer.setSize(nW, nH)
      const nAspect = nW / nH
      const nFrustumW = frustumH * nAspect
      camera.left = -nFrustumW / 2
      camera.right = nFrustumW / 2
      camera.updateProjectionMatrix()
    }
    window.addEventListener('resize', onResize)

    sceneRef.current = {
      renderer, scene, camera, cards, frustumW, frustumH, raycaster, mouse, hoveredMesh, animId,
    }

    return () => {
      cancelAnimationFrame(animId)
      renderer.domElement.removeEventListener('mousemove', onMouseMove)
      renderer.domElement.removeEventListener('click', onClick)
      renderer.domElement.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('resize', onResize)
      cards.forEach(c => {
        const group = c.mesh as unknown as THREE.Group
        group.children.forEach(child => {
          const mesh = child as THREE.Mesh
          if (Array.isArray(mesh.material)) mesh.material.forEach(m => m.dispose())
          else mesh.material.dispose()
          mesh.geometry.dispose()
        })
        scene.remove(group as unknown as THREE.Object3D)
      })
      renderer.dispose()
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
    }
  }, [MAX_CARDS, getClickedTemplateId, onCardClick])

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className="fixed inset-0 z-10"
      style={{ pointerEvents: 'none' }}
    />
  )
}
