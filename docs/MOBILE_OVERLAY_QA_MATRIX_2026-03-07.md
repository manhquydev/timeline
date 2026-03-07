# Mobile Overlay QA Matrix (2026-03-07)

Viewport used for visual check:
- Width: `390`
- Height: `844`
- Browser: Playwright Chromium screenshot CLI

Routes covered:
- `/`
- `/events/quoc-te-phu-nu-2026`
- `/admin`
- `/moderator`
- `/login`

## Visual QA Results (current local state)

1. `/`
- Overlay seen: `GreetingWriteForm` floating button.
- Result: No overlap with header or bottom edge.

2. `/events/quoc-te-phu-nu-2026`
- Overlay seen: `EventSocialBar` at mobile bottom area.
- Result: Bar renders above bottom edge and remains readable; no collision with right-side FAB in current unauth state.

3. `/admin`
- Current unauth local state is redirected flow, so admin dedicated bottom nav is not rendered in screenshot.
- Code validation: `MobileBottomNav` is hidden on `/admin`; admin uses dedicated `AdminBottomNav`.

4. `/moderator`
- Current unauth local state is redirected flow.
- Code validation: `MobileBottomNav` remains available (not force-hidden) to avoid removing navigation where no dedicated moderator bottom nav exists.

5. `/login`
- Overlay seen: none of bottom floating overlays.
- Result: Clean layout, no bottom overlay collision.

## Normalization Rules Applied

- `fab-bottom-primary`: `calc(env(safe-area-inset-bottom) + 5rem)`
- `fab-bottom-secondary`: `calc(env(safe-area-inset-bottom) + 9.5rem)`
- `fab-bottom-tertiary`: `calc(env(safe-area-inset-bottom) + 13.5rem)`

Applied to:
- `UploadFAB`
- `StickyUploadFab`
- `GreetingWriteForm`
- `EventSocialBar`
- `AppUpdatePrompt`
- Home admin mobile FAB

