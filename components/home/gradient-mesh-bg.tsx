'use client'

import { cn } from '@/lib/utils'

interface GradientMeshBgProps {
  className?: string
}

/**
 * GradientMeshBg - Animated gradient mesh background
 * Features:
 * - 4 mesh blobs with different colors
 * - CSS animation (no WebGL for performance)
 * - Subtle movement, 15-20s loop
 * - Supports prefers-reduced-motion
 */
export function GradientMeshBg({ className }: GradientMeshBgProps) {
  return (
    <div className={cn('absolute inset-0 overflow-hidden', className)}>
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/70" />

      {/* Mesh blob 1 - Purple/Violet */}
      <div
        className={cn(
          'absolute w-[600px] h-[600px] rounded-full',
          'bg-gradient-to-br from-violet-500/40 to-purple-600/30',
          'blur-[100px] animate-mesh-1',
          'motion-reduce:animate-none'
        )}
        style={{ top: '-10%', left: '-5%' }}
      />

      {/* Mesh blob 2 - Coral/Orange */}
      <div
        className={cn(
          'absolute w-[500px] h-[500px] rounded-full',
          'bg-gradient-to-tl from-coral/40 to-orange-400/30',
          'blur-[120px] animate-mesh-2',
          'motion-reduce:animate-none'
        )}
        style={{ top: '20%', right: '-10%' }}
      />

      {/* Mesh blob 3 - Blue/Cyan */}
      <div
        className={cn(
          'absolute w-[450px] h-[450px] rounded-full',
          'bg-gradient-to-r from-blue-400/30 to-cyan-400/25',
          'blur-[90px] animate-mesh-3',
          'motion-reduce:animate-none'
        )}
        style={{ bottom: '10%', left: '20%' }}
      />

      {/* Mesh blob 4 - Pink/Rose */}
      <div
        className={cn(
          'absolute w-[400px] h-[400px] rounded-full',
          'bg-gradient-to-bl from-pink-400/35 to-rose-500/25',
          'blur-[80px] animate-mesh-4',
          'motion-reduce:animate-none'
        )}
        style={{ bottom: '-5%', right: '15%' }}
      />

      {/* Noise texture overlay for depth */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  )
}
