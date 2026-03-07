# Phase 2: Three.js Falling Cards Effect

**Priority:** High  
**Status:** ⬜ Not Started  
**Depends on:** Phase 1 (`cardEffectType` field)

---

## Overview

Xây dựng component `FallingCards` dùng Three.js tạo hiệu ứng thiệp rơi 3D đẹp nhất.  
Mỗi thiệp là một **PlaneGeometry** có texture SVG/Canvas, rơi với physics-like motion, sway nhẹ theo gió, rotate 3D tự nhiên.  
Khi user **hover** → thiệp slow down + glow.  
Khi user **click** → trigger Phase 3 (open card animation).

---

## Technical Architecture

### Rendering Strategy
```
Three.js Scene (WebGL)
  ├── Orthographic Camera (2D-like, fixed perspective)
  ├── AmbientLight + DirectionalLight (for card depth/shadow)
  ├── 15-25 Card Meshes (PlaneGeometry + MeshStandardMaterial)
  │     ├── Texture: SVG-to-Canvas-to-Texture (card front)
  │     └── Texture: Solid color (card back)
  └── Raycaster (for click/hover detection)
```

### Card Physics (Pseudo-physics, no library needed)
```
Each card has:
  position: { x, y, z }
  velocity: { x, y }       — wind drift + sway
  rotation: { x, y, z }    — tumble in 3D
  rotationVelocity: { ... }
  swayPhase: number         — sine wave offset (each card different)
  speed: number             — fall speed (random 40-80% of base)
  
Per frame update:
  y -= speed * deltaTime
  x += sin(time * freq + swayPhase) * swayAmp * deltaTime   — pendulum sway
  rx += rotVelocity.x * deltaTime
  ry += rotVelocity.y * deltaTime
  rz += rotVelocity.z * deltaTime
  
  if (y < -screenBottom) → reset to top (y = screenTop + random)
```

### Card Templates (Phase 5 detail)
5 template designs, rendered as Canvas → Three.js Texture:
- Template A: Hoa hồng đỏ nền trắng (classic)
- Template B: Gradient hồng-tím với lá vàng (elegant)
- Template C: Minimalist — chữ "8/3" dạng typography
- Template D: Hiraki-style với cherry blossom
- Template E: Heartfelt — tim đỏ nền kem

---

## File: `components/theme/falling-cards.tsx`

```typescript
'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useTheme } from '@/lib/themes/theme-provider'
import * as THREE from 'three'
import { CARD_TEMPLATES } from './card-templates'

interface CardState {
  mesh: THREE.Mesh
  velocity: { x: number; y: number }
  rotVel: { x: number; y: number; z: number }
  swayPhase: number
  swayFreq: number
  swayAmp: number
  speed: number
  templateId: number
  isHovered: boolean
  clickable: boolean  // linked to greeting data
}

export function FallingCards({ onCardClick }: { onCardClick?: (cardIndex: number) => void }) {
  const { theme } = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<{ renderer: THREE.WebGLRenderer; scene: THREE.Scene; ... } | null>(null)
  
  const isActive = theme?.effects?.cardEffectType === 'falling-cards-8-3'

  useEffect(() => {
    if (!isActive || !containerRef.current) return
    
    // 1. Init Three.js
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)  // transparent background
    renderer.setSize(window.innerWidth, window.innerHeight)
    containerRef.current.appendChild(renderer.domElement)
    
    // 2. Scene + Camera (Orthographic for consistent card sizes)
    const scene = new THREE.Scene()
    const aspect = window.innerWidth / window.innerHeight
    const frustumSize = 10
    const camera = new THREE.OrthographicCamera(
      -frustumSize * aspect / 2,
       frustumSize * aspect / 2,
       frustumSize / 2,
      -frustumSize / 2,
      0.1, 100
    )
    camera.position.z = 10
    
    // 3. Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.8))
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.5)
    dirLight.position.set(5, 5, 5)
    scene.add(dirLight)
    
    // 4. Create cards
    const cardCount = window.innerWidth < 768 ? 12 : 20
    const cards: CardState[] = []
    
    for (let i = 0; i < cardCount; i++) {
      const templateId = i % CARD_TEMPLATES.length
      const texture = CARD_TEMPLATES[templateId].texture
      
      const geo = new THREE.PlaneGeometry(0.7, 1.0, 1, 1)  // card aspect ratio
      const mat = new THREE.MeshStandardMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide,
        roughness: 0.3,
        metalness: 0.1,
      })
      const mesh = new THREE.Mesh(geo, mat)
      
      // Random initial position scattered in view
      const x = (Math.random() - 0.5) * frustumSize * aspect
      const y = frustumSize / 2 + Math.random() * frustumSize  // above screen
      mesh.position.set(x, y, Math.random() * -2)
      mesh.rotation.set(
        Math.random() * Math.PI * 0.3,
        Math.random() * Math.PI,
        Math.random() * Math.PI * 0.3
      )
      
      scene.add(mesh)
      cards.push({
        mesh,
        velocity: { x: (Math.random() - 0.5) * 0.5, y: -(0.8 + Math.random() * 0.8) },
        rotVel: { x: 0.3 + Math.random() * 0.5, y: 0.4 + Math.random() * 0.6, z: 0.2 + Math.random() * 0.3 },
        swayPhase: Math.random() * Math.PI * 2,
        swayFreq: 0.3 + Math.random() * 0.5,
        swayAmp: 0.3 + Math.random() * 0.5,
        speed: 0.6 + Math.random() * 0.8,
        templateId,
        isHovered: false,
        clickable: true,
      })
    }
    
    // 5. Raycaster for interaction
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()
    let hoveredCard: CardState | null = null
    
    const onMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
    }
    
    const onClick = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObjects(cards.map(c => c.mesh))
      if (intersects.length > 0) {
        const hitCard = cards.find(c => c.mesh === intersects[0].object)
        if (hitCard) onCardClick?.(hitCard.templateId)
      }
    }
    
    window.addEventListener('mousemove', onMouseMove)
    renderer.domElement.addEventListener('click', onClick)
    
    // 6. Animation loop
    let animId: number
    let lastTime = 0
    
    const animate = (time: number) => {
      animId = requestAnimationFrame(animate)
      const delta = Math.min((time - lastTime) / 1000, 0.05)
      lastTime = time
      
      // Update raycaster for hover
      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObjects(cards.map(c => c.mesh))
      const hoveredMesh = intersects.length > 0 ? intersects[0].object : null
      
      cards.forEach((card) => {
        const isHov = card.mesh === hoveredMesh
        card.isHovered = isHov
        
        const speedFactor = isHov ? 0.2 : 1.0  // slow down on hover
        const t = time / 1000
        
        // Sway (pendulum effect)
        card.velocity.x = Math.sin(t * card.swayFreq + card.swayPhase) * card.swayAmp * delta
        
        // Fall
        card.mesh.position.y -= card.speed * speedFactor * delta
        card.mesh.position.x += card.velocity.x
        
        // Rotation (tumble naturally in 3D)
        card.mesh.rotation.x += card.rotVel.x * speedFactor * delta
        card.mesh.rotation.y += card.rotVel.y * speedFactor * delta
        card.mesh.rotation.z += card.rotVel.z * speedFactor * delta
        
        // Glow effect on hover (scale up slightly)
        const targetScale = isHov ? 1.15 : 1.0
        card.mesh.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)
        
        // Reset to top when off screen
        if (card.mesh.position.y < -(frustumSize / 2 + 1.5)) {
          card.mesh.position.y = frustumSize / 2 + 1 + Math.random() * 3
          card.mesh.position.x = (Math.random() - 0.5) * frustumSize * aspect
          card.mesh.rotation.set(
            Math.random() * Math.PI * 0.3,
            Math.random() * Math.PI,
            Math.random() * Math.PI * 0.3
          )
        }
      })
      
      // Cursor changes
      renderer.domElement.style.cursor = hoveredMesh ? 'pointer' : 'default'
      
      renderer.render(scene, camera)
    }
    
    animId = requestAnimationFrame(animate)
    
    // Resize handler
    const onResize = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      renderer.setSize(w, h)
      const a = w / h
      camera.left = -frustumSize * a / 2
      camera.right = frustumSize * a / 2
      camera.updateProjectionMatrix()
    }
    window.addEventListener('resize', onResize)
    
    // Cleanup
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      renderer.domElement.removeEventListener('click', onClick)
      renderer.dispose()
      cards.forEach(c => { c.mesh.geometry.dispose(); (c.mesh.material as THREE.Material).dispose() })
      if (containerRef.current?.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement)
      }
    }
  }, [isActive, onCardClick])

  if (!isActive) return null
  
  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-auto z-[50]"
      aria-hidden="true"
    />
  )
}
```

---

## Performance Targets

| Metric | Target |
|--------|--------|
| FPS | 60fps desktop, 30fps mobile |
| Card count | 20 desktop, 12 mobile |
| Memory | < 50MB GPU |
| Load time | < 200ms (lazy import) |

### Optimizations
- `THREE.WebGLRenderer({ alpha: true })` — transparent canvas overlays page content
- `pointer-events-auto` trên container nhưng `pointer-events-none` nếu không hover card → page vẫn scrollable
- `devicePixelRatio` capped at 2
- Dispose textures properly on cleanup
- `lodash.throttle` cho raycaster (16ms interval)

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `components/theme/falling-cards.tsx` | CREATE — main component |
| `components/theme/card-templates.ts` | CREATE — 5 SVG card templates |
| `app/layout.tsx` | MODIFY — lazy import + render FallingCards |

---

## Success Criteria
- [ ] 20 thiệp rơi mượt 60fps trên desktop
- [ ] Sway animation tự nhiên (không đều máy móc)
- [ ] Hover → thiệp chậm lại + scale up
- [ ] Click → trigger callback cho Phase 3
- [ ] Mobile 12 thiệp, 30fps+
- [ ] Không block scroll hay interaction trang chính
