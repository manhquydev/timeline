# Plan: Theme 8/3 + Greeting Card System (Thiệp Chúc Mừng)

**Date:** 2026-03-07  
**Status:** 📋 Planning  
**Priority:** High — Event-based feature (8/3 Women's Day)

---

## Overview

Xây dựng hệ thống thiệp chúc mừng 8/3 tích hợp với theme system hiện tại, gồm:
1. **Theme 8/3** — Kích hoạt đổi toàn bộ màu sắc dự án sang tông hồng/tím lãng mạn
2. **Falling Cards** — Thiệp rơi 3D bằng Three.js, đẹp tốt nhất có thể
3. **Card Click Interaction** — Click vào thiệp mở animation "bóc phong bì", hiện lời chúc ngẫu nhiên
4. **Greeting System** — User viết lời chúc, hệ thống lưu và trả random cho người mở thiệp
5. **Card Templates** — Bộ khung thiệp 8/3 visual đẹp (SVG/Canvas)

---

## Phases

| Phase | Tên | Status |
|-------|-----|--------|
| [Phase 1](phase-01-theme-83.md) | Theme 8/3 & Color System | ⬜ Not Started |
| [Phase 2](phase-02-falling-cards-threejs.md) | Three.js Falling Cards Effect | ⬜ Not Started |
| [Phase 3](phase-03-card-interaction.md) | Card Click & Open Animation | ⬜ Not Started |
| [Phase 4](phase-04-greeting-data-system.md) | Greeting Data System (API + DB) | ⬜ Not Started |
| [Phase 5](phase-05-card-templates.md) | Card Frame Templates (Visual) | ⬜ Not Started |
| [Phase 6](phase-06-integration-testing.md) | Integration & Polish | ⬜ Not Started |

---

## Key Architecture Decisions

- **Three.js** cho falling cards — hardware-accelerated WebGL, không dùng CSS animation
- **Greeting** lưu vào **MongoDB** (collection mới `greetings`) — fit với architecture hiện tại
- **Card templates** dùng **SVG inline** (không cần asset load), có thể parameterize màu
- **Zero DB change** cho theme — dùng `predefined-themes.ts` + seed mechanism hiện có
- **Lazy load** Three.js với `dynamic import` — không block TTI

---

## Dependencies

```
three@^0.170.0          # Three.js renderer
@types/three            # TypeScript types
```

---

## Estimated Scope

- 8 new files (components + API + model)
- 2 modified files (predefined-themes.ts, theme-provider.tsx)
- 1 new MongoDB collection (greetings)
