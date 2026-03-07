'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { RefreshCw, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const UPDATE_CHECK_INTERVAL_MS = 5 * 60 * 1000
const VERSION_CHECK_INTERVAL_MS = 60 * 1000
const FALLBACK_RELOAD_DELAY_MS = 3500

export function AppUpdatePrompt() {
  const [hasUpdate, setHasUpdate] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const hasUpdateRef = useRef(false)
  const applyingUpdateRef = useRef(false)
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null)
  const waitingWorkerRef = useRef<ServiceWorker | null>(null)
  const currentBuildIdRef = useRef<string | null>(null)
  const updateFoundHandlerRef = useRef<(() => void) | null>(null)
  const fallbackReloadTimerRef = useRef<number | null>(null)

  const markUpdateAvailable = useCallback((worker?: ServiceWorker | null) => {
    if (worker) {
      waitingWorkerRef.current = worker
    }

    if (!hasUpdateRef.current) {
      hasUpdateRef.current = true
      setHasUpdate(true)
    }
  }, [])

  const watchInstallingWorker = useCallback(
    (worker: ServiceWorker | null | undefined, registration: ServiceWorkerRegistration) => {
      if (!worker) return

      const onStateChange = () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) {
          worker.removeEventListener('statechange', onStateChange)
          markUpdateAvailable(registration.waiting ?? worker)
        } else if (worker.state === 'redundant') {
          worker.removeEventListener('statechange', onStateChange)
        }
      }

      worker.addEventListener('statechange', onStateChange)
    },
    [markUpdateAvailable]
  )

  const bindRegistration = useCallback(
    (registration: ServiceWorkerRegistration) => {
      if (registrationRef.current === registration && updateFoundHandlerRef.current) {
        if (registration.waiting) {
          markUpdateAvailable(registration.waiting)
        }
        return
      }

      if (registrationRef.current && updateFoundHandlerRef.current) {
        registrationRef.current.removeEventListener('updatefound', updateFoundHandlerRef.current)
      }

      const onUpdateFound = () => {
        watchInstallingWorker(registration.installing, registration)
      }

      registration.addEventListener('updatefound', onUpdateFound)
      registrationRef.current = registration
      updateFoundHandlerRef.current = onUpdateFound

      if (registration.waiting) {
        markUpdateAvailable(registration.waiting)
      }
      watchInstallingWorker(registration.installing, registration)
    },
    [markUpdateAvailable, watchInstallingWorker]
  )

  const checkForUpdates = useCallback(async () => {
    if (!('serviceWorker' in navigator)) return

    try {
      const registration = await navigator.serviceWorker.getRegistration()
      if (!registration) return

      bindRegistration(registration)
      await registration.update()

      if (registration.waiting) {
        markUpdateAvailable(registration.waiting)
      }
    } catch (error) {
      console.warn('PWA update check failed:', error)
    }
  }, [bindRegistration, markUpdateAvailable])

  const getLatestBuildId = useCallback(async () => {
    try {
      const response = await fetch(`/api/version?ts=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      })
      if (!response.ok) return null

      const payload = (await response.json()) as { buildId?: string }
      return typeof payload.buildId === 'string' ? payload.buildId : null
    } catch (error) {
      console.warn('Version check failed:', error)
      return null
    }
  }, [])

  const checkBuildVersion = useCallback(async () => {
    const latestBuildId = await getLatestBuildId()
    if (!latestBuildId) return

    if (!currentBuildIdRef.current) {
      currentBuildIdRef.current = latestBuildId
      return
    }

    if (currentBuildIdRef.current !== latestBuildId) {
      markUpdateAvailable()
    }
  }, [getLatestBuildId, markUpdateAvailable])

  const applyUpdate = useCallback(async () => {
    if (isUpdating) return

    setIsUpdating(true)
    applyingUpdateRef.current = true

    const waitingWorker = waitingWorkerRef.current ?? registrationRef.current?.waiting ?? null
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' })
      fallbackReloadTimerRef.current = window.setTimeout(() => {
        window.location.reload()
      }, FALLBACK_RELOAD_DELAY_MS)
      return
    }

    try {
      await registrationRef.current?.update()

      if ('caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)))
      }
    } catch (error) {
      console.warn('Manual update fallback failed:', error)
    }

    window.location.reload()
  }, [isUpdating])

  useEffect(() => {
    void checkBuildVersion()

    const intervalId = window.setInterval(() => {
      void checkBuildVersion()
    }, VERSION_CHECK_INTERVAL_MS)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [checkBuildVersion])

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    const hadControllerAtMount = Boolean(navigator.serviceWorker.controller)

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void checkForUpdates()
        void checkBuildVersion()
      }
    }

    const onControllerChange = () => {
      if (applyingUpdateRef.current) {
        window.location.reload()
        return
      }

      if (hadControllerAtMount) {
        markUpdateAvailable()
      }
    }

    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange)
    document.addEventListener('visibilitychange', onVisibilityChange)

    const intervalId = window.setInterval(() => {
      void checkForUpdates()
    }, UPDATE_CHECK_INTERVAL_MS)

    void checkForUpdates()

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.clearInterval(intervalId)

      if (registrationRef.current && updateFoundHandlerRef.current) {
        registrationRef.current.removeEventListener('updatefound', updateFoundHandlerRef.current)
      }
      if (fallbackReloadTimerRef.current) {
        window.clearTimeout(fallbackReloadTimerRef.current)
      }
    }
  }, [checkBuildVersion, checkForUpdates, markUpdateAvailable])

  if (!hasUpdate) {
    return null
  }

  return (
    <div className="pointer-events-none fixed inset-x-3 fab-bottom-tertiary z-[70] md:inset-x-auto md:bottom-4 md:right-4 md:w-[360px]">
      <div className="pointer-events-auto glass-enhanced animate-slide-up rounded-2xl border border-primary/25 p-4 shadow-[0_20px_40px_rgba(0,0,0,0.18)]">
        <div className="mb-3 flex items-start gap-3">
          <div className="rounded-xl bg-primary/10 p-2 text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold leading-tight">Phiên bản mới đã sẵn sàng</p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Cập nhật để nhận giao diện và tính năng mới, tránh lỗi do cache bản cũ.
            </p>
          </div>
        </div>

        <Button onClick={() => void applyUpdate()} disabled={isUpdating} className="w-full touch-target">
          <RefreshCw className={cn('h-4 w-4', isUpdating && 'animate-spin')} />
          {isUpdating ? 'Đang cập nhật...' : 'Cập nhật ngay'}
        </Button>
      </div>
    </div>
  )
}
