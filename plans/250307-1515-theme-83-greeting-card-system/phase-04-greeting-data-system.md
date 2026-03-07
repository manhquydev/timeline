# Phase 4: Greeting Data System

**Priority:** High  
**Status:** ⬜ Not Started  
**Depends on:** MongoDB connection (existing)

---

## Overview

Hệ thống lưu trữ và truy vấn lời chúc 8/3 từ người dùng.  
Bất kỳ ai (đã đăng nhập hoặc ẩn danh) đều có thể gửi lời chúc.  
Khi user click thiệp → lấy 1 lời chúc ngẫu nhiên đã được duyệt.

---

## MongoDB Model — `Greeting`

### File: `lib/mongodb/models/Greeting.ts`

```typescript
export interface IGreeting {
  id: string          // nanoid()
  authorId: string | null   // Supabase user ID hoặc null nếu anon
  authorName: string        // tên hiển thị hoặc "Ẩn danh"
  message: string           // nội dung lời chúc (max 280 chars)
  eventTag: string          // '8-3' | '20-10' — cho phép multi-event sau này
  createdAt: Date
  isApproved: boolean       // admin duyệt trước khi show
  isDeleted: boolean        // soft delete
}

// Mongoose schema
const GreetingSchema = new Schema<IGreeting>({
  id: { type: String, required: true, unique: true },
  authorId: { type: String, default: null },
  authorName: { type: String, required: true, default: 'Ẩn danh' },
  message: { type: String, required: true, minlength: 1, maxlength: 280 },
  eventTag: { type: String, required: true, default: '8-3' },
  createdAt: { type: Date, default: Date.now },
  isApproved: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
})

GreetingSchema.index({ eventTag: 1, isApproved: 1, isDeleted: 1 })
```

---

## Repository — `GreetingRepository`

### File: `lib/mongodb/repositories/greeting-repository.ts`

```typescript
class GreetingRepository {
  async create(data: Pick<IGreeting, 'authorId' | 'authorName' | 'message' | 'eventTag'>): Promise<IGreeting>
  
  async findRandom(eventTag: string): Promise<IGreeting | null>
  // → aggregate $match approved+notDeleted, $sample size:1
  
  async findAll(opts: { page: number; limit: number; eventTag?: string; approved?: boolean }): Promise<{ items: IGreeting[]; total: number }>
  
  async approve(id: string): Promise<void>
  
  async reject(id: string): Promise<void>
  // → sets isDeleted: true
  
  async deleteById(id: string): Promise<void>
  // → hard delete (admin only)
}
```

---

## API Routes

### `POST /api/greetings` — Gửi lời chúc mới

```typescript
// app/api/greetings/route.ts
export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const body = await req.json()
  const { message, authorName, eventTag = '8-3' } = body
  
  // Validate
  if (!message || message.trim().length === 0) 
    return NextResponse.json({ error: 'Message required' }, { status: 400 })
  if (message.length > 280)
    return NextResponse.json({ error: 'Message too long' }, { status: 400 })
  
  // XSS sanitize message
  const sanitizedMessage = DOMPurify.sanitize(message.trim())
  
  const greeting = await greetingRepository.create({
    authorId: user?.id ?? null,
    authorName: (user ? (user.user_metadata?.display_name || user.user_metadata?.full_name) : null) || authorName?.trim() || 'Ẩn danh',
    message: sanitizedMessage,
    eventTag,
  })
  
  return NextResponse.json({ greeting, message: 'Lời chúc đã được gửi và đang chờ duyệt!' }, { status: 201 })
}
```

### `GET /api/greetings/random` — Lấy lời chúc ngẫu nhiên

```typescript
// app/api/greetings/random/route.ts
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const eventTag = searchParams.get('tag') ?? '8-3'
  
  const greeting = await greetingRepository.findRandom(eventTag)
  
  if (!greeting) {
    // Fallback lời chúc mặc định
    return NextResponse.json({
      greeting: {
        message: 'Chúc mừng ngày Quốc tế Phụ nữ 8/3! Chúc bạn luôn vui vẻ và hạnh phúc! 🌹',
        authorName: 'Team Timeline',
      }
    })
  }
  
  return NextResponse.json({ greeting })
}
```

### `GET /api/admin/greetings` — Admin quản lý

```typescript
// app/api/admin/greetings/route.ts
// GET — list with pagination + filter
// PATCH — approve/reject
// DELETE — hard delete
```

---

## Admin UI Page

### `app/admin/greetings/page.tsx`

- Table hiển thị tất cả lời chúc (pending/approved/rejected)
- Approve button → `isApproved: true`
- Delete button → hard delete
- Filter by eventTag, status

Component: `components/admin/greeting-management-list.tsx`

---

## User-Facing: Write Greeting UI

### `components/theme/greeting-write-form.tsx`

Floating button ở góc màn hình (chỉ khi theme 8/3 active):
- Click → inline form / mini form
- Input: text area (max 280 chars, char counter)
- Submit → POST /api/greetings
- Toast: "Lời chúc của bạn đã được gửi!"

### `app/api/greetings/route.ts` — cũng dùng cho GET list (public approved)

---

## Security

| Risk | Mitigation |
|------|-----------|
| XSS in message | sanitize-html hoặc DOMPurify server side |
| Spam | Rate limit per IP: max 5 greetings/hour via `lib/rate-limit.ts` |
| Inappropriate content | isApproved = false by default; admin duyệt |
| Anonymous flood | Rate limit by IP even without auth |

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `lib/mongodb/models/Greeting.ts` | CREATE | Mongoose schema + types |
| `lib/mongodb/repositories/greeting-repository.ts` | CREATE | CRUD + random query |
| `lib/mongodb/repositories/index.ts` | MODIFY | Export greetingRepository |
| `app/api/greetings/route.ts` | CREATE | POST new greeting |
| `app/api/greetings/random/route.ts` | CREATE | GET random greeting |
| `app/api/admin/greetings/route.ts` | CREATE | Admin management API |
| `app/admin/greetings/page.tsx` | CREATE | Admin management page |
| `components/admin/greeting-management-list.tsx` | CREATE | Admin table UI |
| `components/theme/greeting-write-form.tsx` | CREATE | User submit form |

---

## Success Criteria
- [ ] Lời chúc được lưu vào MongoDB
- [ ] Admin có thể approve/reject
- [ ] `/api/greetings/random` trả về lời chúc ngẫu nhiên trong approved pool
- [ ] Fallback khi pool rỗng
- [ ] Rate limiting hoạt động
- [ ] XSS không xảy ra
