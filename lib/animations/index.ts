import { Variants, Transition } from 'framer-motion'

/**
 * Common transition presets
 */
export const transitions = {
  spring: {
    type: 'spring',
    stiffness: 300,
    damping: 30,
  } as Transition,

  springBouncy: {
    type: 'spring',
    stiffness: 400,
    damping: 25,
  } as Transition,

  smooth: {
    duration: 0.2,
    ease: 'easeInOut',
  } as Transition,

  smoothSlow: {
    duration: 0.4,
    ease: 'easeInOut',
  } as Transition,

  snappy: {
    duration: 0.15,
    ease: [0.4, 0, 0.2, 1],
  } as Transition,
}

/**
 * Fade animation variants
 */
export const fadeVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

/**
 * Slide up animation variants
 */
export const slideUpVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
}

/**
 * Slide down animation variants
 */
export const slideDownVariants: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
}

/**
 * Scale animation variants
 */
export const scaleVariants: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
}

/**
 * Scale with spring for buttons/interactive elements
 */
export const scaleSpringVariants: Variants = {
  initial: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
}

/**
 * Pop animation for notifications/badges
 */
export const popVariants: Variants = {
  initial: { opacity: 0, scale: 0.5 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 25,
    },
  },
  exit: { opacity: 0, scale: 0.5 },
}

/**
 * Stagger children container variants
 */
export const staggerContainerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
}

/**
 * Stagger children container (fast)
 */
export const staggerFastVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.03,
    },
  },
}

/**
 * List item animation variants
 */
export const listItemVariants: Variants = {
  initial: { opacity: 0, x: -10 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 10 },
}

/**
 * Card hover animation
 */
export const cardHoverVariants: Variants = {
  initial: { y: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  hover: {
    y: -4,
    boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
    transition: transitions.smooth,
  },
}

/**
 * Pulse animation for loading states
 */
export const pulseVariants: Variants = {
  initial: { opacity: 1 },
  animate: {
    opacity: [1, 0.5, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

/**
 * Shake animation for errors
 */
export const shakeVariants: Variants = {
  initial: { x: 0 },
  shake: {
    x: [-10, 10, -10, 10, 0],
    transition: { duration: 0.4 },
  },
}

/**
 * Success checkmark animation
 */
export const checkmarkVariants: Variants = {
  initial: { pathLength: 0, opacity: 0 },
  animate: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 0.3, ease: 'easeOut' },
      opacity: { duration: 0.1 },
    },
  },
}

/**
 * Modal/Dialog animation
 */
export const modalVariants: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 10 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: transitions.spring,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: transitions.smooth,
  },
}

/**
 * Backdrop animation
 */
export const backdropVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

/**
 * Slide from right (for sheets/drawers)
 */
export const slideRightVariants: Variants = {
  initial: { x: '100%' },
  animate: { x: 0, transition: transitions.spring },
  exit: { x: '100%', transition: transitions.smooth },
}

/**
 * Slide from bottom (for mobile sheets)
 */
export const slideBottomVariants: Variants = {
  initial: { y: '100%' },
  animate: { y: 0, transition: transitions.spring },
  exit: { y: '100%', transition: transitions.smooth },
}
