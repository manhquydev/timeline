'use client'

import { animate, type DOMKeyframesDefinition, type AnimationOptions } from 'motion'
import { useCallback } from 'react'

/**
 * Motion One utility hook for performant WAAPI-based animations
 * Uses framer-motion/dom under the hood for compositor-thread animations
 */
export function useMotion() {
  const fadeIn = useCallback((element: Element, delay = 0) => {
    const keyframes: DOMKeyframesDefinition = {
      opacity: [0, 1],
      transform: ['translateY(20px)', 'translateY(0)']
    }
    const options: AnimationOptions = {
      duration: 0.5,
      delay,
      ease: [0.34, 1.56, 0.64, 1]
    }
    return animate(element, keyframes, options)
  }, [])

  const scaleIn = useCallback((element: Element, delay = 0) => {
    const keyframes: DOMKeyframesDefinition = {
      opacity: [0, 1],
      transform: ['scale(0.9)', 'scale(1)']
    }
    const options: AnimationOptions = {
      duration: 0.4,
      delay,
      ease: [0.34, 1.56, 0.64, 1]
    }
    return animate(element, keyframes, options)
  }, [])

  const slideInLeft = useCallback((element: Element, delay = 0) => {
    const keyframes: DOMKeyframesDefinition = {
      opacity: [0, 1],
      transform: ['translateX(-30px)', 'translateX(0)']
    }
    const options: AnimationOptions = {
      duration: 0.5,
      delay,
      ease: [0.34, 1.56, 0.64, 1]
    }
    return animate(element, keyframes, options)
  }, [])

  const slideInRight = useCallback((element: Element, delay = 0) => {
    const keyframes: DOMKeyframesDefinition = {
      opacity: [0, 1],
      transform: ['translateX(30px)', 'translateX(0)']
    }
    const options: AnimationOptions = {
      duration: 0.5,
      delay,
      ease: [0.34, 1.56, 0.64, 1]
    }
    return animate(element, keyframes, options)
  }, [])

  const staggerReveal = useCallback((elements: Element[], staggerMs = 75) => {
    return elements.map((el, i) => {
      const keyframes: DOMKeyframesDefinition = {
        opacity: [0, 1],
        transform: ['translateY(20px)', 'translateY(0)']
      }
      const options: AnimationOptions = {
        duration: 0.5,
        delay: i * (staggerMs / 1000),
        ease: [0.34, 1.56, 0.64, 1]
      }
      return animate(el, keyframes, options)
    })
  }, [])

  const pulse = useCallback((element: Element) => {
    const keyframes: DOMKeyframesDefinition = {
      transform: ['scale(1)', 'scale(1.05)', 'scale(1)']
    }
    const options: AnimationOptions = {
      duration: 0.3,
      ease: 'easeInOut'
    }
    return animate(element, keyframes, options)
  }, [])

  return { fadeIn, scaleIn, slideInLeft, slideInRight, staggerReveal, pulse }
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
