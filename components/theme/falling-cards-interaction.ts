'use client'

const INTERACTIVE_TARGET_SELECTOR = [
  'a[href]',
  'button',
  'input',
  'select',
  'textarea',
  'label',
  'summary',
  '[role="button"]',
  '[role="link"]',
  '[role="menuitem"]',
  '[contenteditable="true"]',
  '[data-card-interaction-block]',
  '[data-radix-collection-item]',
].join(',')

export function shouldIgnoreCardInteractionTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false

  if (target.closest('[data-falling-cards-ignore="true"]')) {
    return true
  }

  return Boolean(target.closest(INTERACTIVE_TARGET_SELECTOR))
}

export function getPointerPointFromEvent(event: MouseEvent | TouchEvent): { x: number; y: number } | null {
  if ('changedTouches' in event) {
    const touch = event.changedTouches?.[0] ?? event.touches?.[0]
    if (!touch) return null
    return { x: touch.clientX, y: touch.clientY }
  }

  return { x: event.clientX, y: event.clientY }
}
