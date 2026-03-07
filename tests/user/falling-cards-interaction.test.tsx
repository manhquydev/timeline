import React from 'react'
import { cleanup, render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mockThreeState: {
  intersections: Array<{ object: any }>
  groups: any[]
} = {
  intersections: [],
  groups: [],
}

vi.mock('@/lib/themes/card-templates-8-3', () => ({
  CARD_TEMPLATES_8_3: [
    {
      id: 83,
      drawFront: vi.fn(),
      drawBack: vi.fn(),
    },
  ],
}))

vi.mock('three', () => {
  class Vector2 {
    x: number
    y: number
    constructor(x = 0, y = 0) {
      this.x = x
      this.y = y
    }
  }

  class Vector3 {
    x: number
    y: number
    z: number
    constructor(x = 0, y = 0, z = 0) {
      this.x = x
      this.y = y
      this.z = z
    }
    set(x: number, y: number, z: number) {
      this.x = x
      this.y = y
      this.z = z
      return this
    }
    lerp(target: Vector3, alpha: number) {
      this.x += (target.x - this.x) * alpha
      this.y += (target.y - this.y) * alpha
      this.z += (target.z - this.z) * alpha
      return this
    }
  }

  class EulerLike {
    x = 0
    y = 0
    z = 0
    set(x: number, y: number, z: number) {
      this.x = x
      this.y = y
      this.z = z
      return this
    }
  }

  class CanvasTexture {
    needsUpdate = false
    constructor(public canvas: HTMLCanvasElement) {}
  }

  class PlaneGeometry {
    dispose = vi.fn()
  }

  class MeshStandardMaterial {
    dispose = vi.fn()
    constructor(public options: Record<string, unknown>) {}
  }

  class Mesh {
    parent: any = null
    position = new Vector3()
    scale = new Vector3(1, 1, 1)
    rotation = new EulerLike()
    constructor(public geometry: any, public material: any) {}
  }

  class Group {
    children: any[] = []
    parent: any = null
    position = new Vector3()
    scale = new Vector3(1, 1, 1)
    rotation = new EulerLike()
    constructor() {
      mockThreeState.groups.push(this)
    }
    add(...objects: any[]) {
      objects.forEach((object) => {
        object.parent = this
        this.children.push(object)
      })
    }
  }

  class Scene {
    objects: any[] = []
    add(...objects: any[]) {
      this.objects.push(...objects)
    }
    remove(object: any) {
      this.objects = this.objects.filter((candidate) => candidate !== object)
    }
  }

  class OrthographicCamera {
    position = { z: 0 }
    constructor(
      public left: number,
      public right: number,
      public top: number,
      public bottom: number,
      public near: number,
      public far: number
    ) {}
    updateProjectionMatrix() {}
  }

  class AmbientLight {
    constructor(public color: number, public intensity: number) {}
  }

  class DirectionalLight {
    position = new Vector3()
    constructor(public color: number, public intensity: number) {}
  }

  class Raycaster {
    setFromCamera(_: Vector2, __: OrthographicCamera) {}
    intersectObjects(_: any[]) {
      return mockThreeState.intersections
    }
  }

  class WebGLRenderer {
    domElement: HTMLCanvasElement
    outputColorSpace = 'srgb'
    constructor(_: Record<string, unknown>) {
      this.domElement = document.createElement('canvas')
      this.domElement.getBoundingClientRect = () =>
        ({
          x: 0,
          y: 0,
          left: 0,
          top: 0,
          right: 1000,
          bottom: 800,
          width: 1000,
          height: 800,
          toJSON: () => ({}),
        } as DOMRect)
    }
    setSize(_: number, __: number) {}
    setPixelRatio(_: number) {}
    setClearColor(_: number, __: number) {}
    render(_: Scene, __: OrthographicCamera) {}
    dispose() {}
  }

  return {
    Vector2,
    Vector3,
    CanvasTexture,
    PlaneGeometry,
    MeshStandardMaterial,
    Mesh,
    Group,
    Scene,
    OrthographicCamera,
    AmbientLight,
    DirectionalLight,
    Raycaster,
    WebGLRenderer,
    SRGBColorSpace: 'srgb',
    FrontSide: 0,
    BackSide: 1,
  }
})

import { FallingCards } from '@/components/theme/falling-cards'
import {
  getPointerPointFromEvent,
  shouldIgnoreCardInteractionTarget,
} from '@/components/theme/falling-cards-interaction'

describe('falling cards interaction routing', () => {
  beforeEach(() => {
    mockThreeState.groups.length = 0
    mockThreeState.intersections = []

    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 1)
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({} as any)

    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
      configurable: true,
      get() {
        return 1000
      },
    })
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
      configurable: true,
      get() {
        return 800
      },
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    cleanup()
  })

  it('detects interactive targets and extracts pointer points safely', () => {
    const button = document.createElement('button')
    const icon = document.createElement('span')
    button.appendChild(icon)

    const neutral = document.createElement('div')
    const ignored = document.createElement('div')
    ignored.setAttribute('data-falling-cards-ignore', 'true')

    expect(shouldIgnoreCardInteractionTarget(icon)).toBe(true)
    expect(shouldIgnoreCardInteractionTarget(neutral)).toBe(false)
    expect(shouldIgnoreCardInteractionTarget(ignored)).toBe(true)

    const mousePoint = getPointerPointFromEvent(new MouseEvent('click', { clientX: 10, clientY: 20 }))
    expect(mousePoint).toEqual({ x: 10, y: 20 })

    const touchPoint = getPointerPointFromEvent({
      changedTouches: [{ clientX: 30, clientY: 40 }],
    } as unknown as TouchEvent)
    expect(touchPoint).toEqual({ x: 30, y: 40 })
  })

  it('keeps UI clicks unblocked and still allows clicking falling cards', async () => {
    const onCardClick = vi.fn()

    const { container } = render(
      <div>
        <button type="button" data-testid="ui-action">
          Open calendar
        </button>
        <div data-testid="neutral-zone">Neutral zone</div>
        <FallingCards onCardClick={onCardClick} />
      </div>
    )

    await waitFor(() => {
      expect(container.querySelector('canvas')).not.toBeNull()
      expect(mockThreeState.groups.length).toBeGreaterThan(0)
    })

    const canvas = container.querySelector('canvas') as HTMLCanvasElement
    expect(canvas.style.pointerEvents).toBe('none')

    const hit = mockThreeState.groups[0].children[0]
    mockThreeState.intersections = [{ object: hit }]

    const uiButton = container.querySelector('[data-testid="ui-action"]') as HTMLButtonElement
    uiButton.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 160, clientY: 180 }))
    expect(onCardClick).not.toHaveBeenCalled()

    const neutralZone = container.querySelector('[data-testid="neutral-zone"]') as HTMLDivElement
    neutralZone.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 200, clientY: 240 }))

    expect(onCardClick).toHaveBeenCalledTimes(1)
    expect(onCardClick).toHaveBeenCalledWith(83, undefined)
  })
})
