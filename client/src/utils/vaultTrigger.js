/**
 * AUREVA VAULT — Unified Intentional Trigger Utility
 *
 * Supports:
 * 1. Desktop 5-Click Interaction:
 *    5 intentional clicks within a generous 4-second sliding window.
 * 2. Long-Press / Click-and-Hold Interaction:
 *    - Desktop: Mouse click and hold for 1.2 seconds (onMouseDown / onMouseUp)
 *    - Mobile: Touch and hold for 1.2 seconds (onTouchStart / onTouchEnd)
 * 3. Keyboard Shortcut:
 *    Alt+V or Ctrl+Shift+V for instant terminal initialization.
 */

// Global event name for opening the Vault Access transition overlay
export const VAULT_TRIGGER_EVENT = 'aureva:vault-trigger'

export function triggerVaultModal() {
  window.dispatchEvent(new CustomEvent(VAULT_TRIGGER_EVENT))
}

let clickTimestamps = []
let holdTimer = null
let touchStartPos = { x: 0, y: 0 }

export function registerLogoClick(e) {
  const now = Date.now()
  // Generous 4000ms window (or consecutive clicks within 1.5s)
  clickTimestamps = clickTimestamps.filter((t) => now - t <= 4000)
  clickTimestamps.push(now)

  if (clickTimestamps.length >= 5) {
    if (e && e.preventDefault) e.preventDefault()
    clickTimestamps = []
    triggerVaultModal()
  }
}

export function startHoldTimer(e) {
  if (e && e.touches && e.touches.length > 0) {
    touchStartPos = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }

  if (holdTimer) clearTimeout(holdTimer)
  holdTimer = setTimeout(() => {
    triggerVaultModal()
    holdTimer = null
  }, 1200) // 1.2 seconds hold
}

export function cancelHoldTimer() {
  if (holdTimer) {
    clearTimeout(holdTimer)
    holdTimer = null
  }
}

export function handleTouchMoveCheck(e) {
  if (!holdTimer) return
  if (e && e.touches && e.touches.length > 0) {
    const dx = Math.abs(e.touches[0].clientX - touchStartPos.x)
    const dy = Math.abs(e.touches[0].clientY - touchStartPos.y)
    if (dx > 12 || dy > 12) {
      cancelHoldTimer()
    }
  }
}

// Convenient prop bundle to spread onto any AUREVA logo
export function getVaultTriggerProps() {
  return {
    onClick: registerLogoClick,
    onMouseDown: startHoldTimer,
    onMouseUp: cancelHoldTimer,
    onMouseLeave: cancelHoldTimer,
    onTouchStart: startHoldTimer,
    onTouchEnd: cancelHoldTimer,
    onTouchCancel: cancelHoldTimer,
    onTouchMove: handleTouchMoveCheck,
  }
}
