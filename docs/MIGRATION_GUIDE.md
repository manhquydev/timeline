# 🚀 Hướng Dẫn Migration: Supabase SQL → MongoDB NoSQL

## 📋 Tổng Quan

Dự án này đã được chuyển đổi từ kiến trúc **Supabase PostgreSQL (SQL)** sang **Hybrid Architecture** với:
- ✅ **Supabase Auth**: Xác thực, phân quyền, user management
- ✅ **Supabase Storage**: Lưu trữ media files (ảnh/video)
- ✅ **MongoDB Atlas**: Lưu trữ data (events, posts) - NoSQL

## 🎯 Lý Do Chuyển Đổi

### Ưu Điểm MongoDB cho Use Case này:

1. **Flexible Schema**: Dễ dàng thêm/sửa fields mà không cần migration
2. **Performance**: Queries nhanh hơn cho timeline/grid views
3. **Scalability**: Scale horizontal tốt hơn cho big data
4. **Denormalization**: Giảm joins, tăng tốc độ read
5. **Document-based**: Phù hợp với cấu trúc events + posts

### Giữ Nguyên Supabase Auth vì:

1. ✅ Built-in Magic Link authentication
2. ✅ Row Level Security (RLS) cho phân quyền
3. ✅ Managed service, không cần maintain
4. ✅ Integration sẵn có với Next.js

---

## 🏗️ Kiến Trúc Mới

```
┌─────────────────────────────────────────┐
│         Next.js 15 Frontend             │
│      (React Server Components)          │
└──────────────┬──────────────────────────┘
               │
   ┌───────────┴──────────┐
   │                      │
   ▼                      ▼
┌──────────────┐   ┌─────────────────┐
│  Supabase    │   │  MongoDB Atlas  │
│              │   │                 │
│ • Auth       │   │ • Events        │
│ • Storage    │   │ • Posts         │
│ • Roles      │   │ • Stats         │
└──────────────┘   └─────────────────┘
```

---

## 📦 Cài Đặt & Setup

### 1. Cài đặt Dependencies

```bash
npm install mongodb mongoose
npm install --save-dev @types/mongoose
```

### 2. Setup MongoDB Atlas

1. Đăng ký tài khoản tại [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Tạo cluster mới (Free tier M0 hoặc Shared M2)
3. Tạo database user với username/password
4. Whitelist IP address (hoặc cho phép tất cả: `0.0.0.0/0`)
5. Copy connection string

### 3. Cấu hình Environment Variables

Tạo file `.env.local`:

```bash
# Supabase (giữ nguyên)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# MongoDB (thêm mới)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/timeline?retryWrites=true&w=majority
```

⚠️ **Lưu ý**: Thay thế `username`, `password`, `cluster`, và `timeline` bằng thông tin thực tế của bạn.

---

## 🔄 Migration Data

### Bước 1: Backup Data từ Supabase

```bash
# Backup qua Supabase Dashboard
# Settings → Database → Backups → Create backup
```

### Bước 2: Run Migration Scripts

```bash
# Migration tất cả data
npm run migrate

# Hoặc từng bước:
npx tsx scripts/migrate.ts
```

Script sẽ:
1. ✅ Migrate tất cả events từ Supabase → MongoDB
2. ✅ Migrate tất cả posts từ Supabase → MongoDB
3. ✅ Update event statistics (photos, videos, contributors)
4. ✅ Validate data integrity

### Bước 3: Verify Migration

```bash
# Kiểm tra data đã migrate đúng chưa
npx tsx scripts/verify-migration.ts
```

Kết quả mong đợi:
```
✅ Migration verification PASSED!
Events: 50
Posts: 1234
Stats correct: 50/50
Orphaned posts: 0
```

### Bước 4: Rollback (Nếu cần)

```bash
# Xóa tất cả data MongoDB (CẢNH BÁO: Nguy hiểm!)
npx tsx scripts/migrate.ts rollback
```

---

## 📁 Cấu Trúc Mới

### Thư mục MongoDB

```
lib/mongodb/
├── connection.ts              # MongoDB connection với pooling
├── index.ts                   # Export chính
├── models/
│   ├── Event.ts              # Event schema & model
│   ├── Post.ts               # Post schema & model
│   └── index.ts              # Export models
└── repositories/
    ├── EventRepository.ts    # CRUD operations cho events
    ├── PostRepository.ts     # CRUD operations cho posts
    └── index.ts              # Export repositories
```

### Migration Scripts

```
scripts/
├── migrate.ts                # Main migration script
├── migrate-events.ts         # Migrate events
├── migrate-posts.ts          # Migrate posts
└── verify-migration.ts       # Verify data integrity
```

---

## 🔧 Các Thay Đổi Code

### 1. API Routes

#### Trước (Supabase):
```typescript
const { data: events } = await supabase
  .from('events')
  .select('*')
  .eq('status', 'open')
```

#### Sau (MongoDB):
```typescript
import { eventRepository } from '@/lib/mongodb/repositories'

const events = await eventRepository.findByStatus('open')
```

### 2. Server Components

#### Trước (Supabase):
```typescript
export default async function Page() {
  const supabase = await createClient()
  const { data } = await supabase.from('events').select('*')

  return <EventList events={data} />
}
```

#### Sau (MongoDB):
```typescript
import { eventRepository } from '@/lib/mongodb/repositories'

export default async function Page() {
  const events = await eventRepository.findAll()

  // Convert MongoDB docs to plain objects
  const plainEvents = events.map(e => ({
    id: e.id,
    title: e.title,
    // ... other fields
  }))

  return <EventList events={plainEvents} />
}
```

### 3. Authentication (Không đổi)

```typescript
// Vẫn dùng Supabase Auth
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()

// Check roles từ Supabase
const isAdmin = await isCurrentUserAdmin()
```

---

## 📊 MongoDB Schemas

### Event Schema

```typescript
{
  id: string,                    // UUID từ Supabase
  title: string,
  description: string | null,
  slug: string,                  // Indexed
  event_date: Date,
  start_date: Date,
  end_date: Date | null,
  status: "draft" | "open" | "closed" | "archived",
  allow_upload: boolean,
  allow_wishes: boolean,
  cover_image_url: string | null,
  stats: {
    total_photos: number,
    total_videos: number,
    total_contributors: number
  },
  created_at: Date,
  updated_at: Date
}
```

### Post Schema

```typescript
{
  id: string,                    // UUID từ Supabase
  event_id: string,              // Indexed
  user_id: string | null,        // Reference to Supabase user
  media_type: "image" | "video",
  media_url: string,
  thumbnail_url: string | null,
  blurhash: string | null,
  dimensions: {
    width: number | null,
    height: number | null
  },
  file_size: number | null,
  wish_text: string | null,
  uploaded_at: Date,
  view_count: number,
  status: "pending" | "approved" | "rejected",
  user_name: string | null       // Denormalized
}
```

### Indexes

```typescript
// Event indexes
{ slug: 1 } - unique
{ status: 1, event_date: -1 }
{ created_at: -1 }

// Post indexes
{ event_id: 1, uploaded_at: -1 }
{ event_id: 1, status: 1, uploaded_at: -1 }
{ user_id: 1, uploaded_at: -1 }
```

---

## 🎯 Repository Pattern

### Event Repository Methods

```typescript
// CRUD
create(data)
findById(id)
findBySlug(slug)
findPublic()
findByStatus(status)
findAll()
update(id, data)
delete(id)

// Stats
incrementPhotoCount(id, count)
incrementVideoCount(id, count)
incrementContributorCount(id, count)
updateStats(id, stats)

// Utilities
isSlugAvailable(slug)
countByStatus(status)
count()
```

### Post Repository Methods

```typescript
// CRUD
create(data)
findById(id)
findByEvent(eventId, status?)
findApprovedByEvent(eventId)
findByUser(userId)
findAllApproved(limit?)
update(id, data)
delete(id)
deleteByEvent(eventId)

// Moderation
approve(id)
reject(id)
bulkApprove(ids)
bulkReject(ids)

// Stats
countByEvent(eventId, status?)
countByMediaType(eventId, mediaType)
getUniqueContributors(eventId)
getEventStats(eventId)
incrementViewCount(id)

// Pagination
findWithPagination(eventId, page, limit, status)
```

---

## 🧪 Testing

### Test Connection

```typescript
import { connectToDatabase, getConnectionStatus } from '@/lib/mongodb'

async function testConnection() {
  await connectToDatabase()
  console.log('Status:', getConnectionStatus())
}
```

### Test Repositories

```typescript
import { eventRepository } from '@/lib/mongodb/repositories'

async function testRepo() {
  // Create
  const event = await eventRepository.create({
    title: 'Test Event',
    slug: 'test-event',
    // ...
  })

  // Read
  const found = await eventRepository.findBySlug('test-event')

  // Update
  await eventRepository.update(event.id, { title: 'Updated' })

  // Delete
  await eventRepository.delete(event.id)
}
```

---

## ⚠️ Lưu Ý Quan Trọng

### 1. Connection Pooling

MongoDB connection được cache trong development để tránh hot reload issues:

```typescript
// lib/mongodb/connection.ts sử dụng global cache
global.mongoose = { conn: null, promise: null }
```

### 2. Serialization

Server Components cần convert MongoDB documents sang plain objects:

```typescript
// ❌ Sai
return <Component data={mongoDoc} />

// ✅ Đúng
const plainData = {
  id: mongoDoc.id,
  title: mongoDoc.title,
  // ... serialize các fields
}
return <Component data={plainData} />
```

### 3. Dates

MongoDB trả về Date objects, cần convert sang ISO strings:

```typescript
event_date: event.event_date.toISOString()
```

### 4. Stats Denormalization

Event stats được denormalize để tránh aggregate queries:

```typescript
// Update stats khi tạo post mới
await eventRepository.incrementPhotoCount(eventId)
```

---

## 🚀 Deployment

### Vercel

1. Add environment variables trong Vercel dashboard:
   - `MONGODB_URI`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. Deploy:
```bash
vercel deploy
```

### MongoDB Atlas

1. Whitelist Vercel IP ranges (hoặc `0.0.0.0/0`)
2. Enable connection from anywhere
3. Monitor trong Atlas dashboard

---

## 📈 Performance Tips

### 1. Indexes

Đảm bảo indexes đã được tạo:

```typescript
// Check indexes
db.events.getIndexes()
db.posts.getIndexes()
```

### 2. Connection Pooling

Sử dụng connection pooling:

```typescript
maxPoolSize: 10,
minPoolSize: 2,
```

### 3. Lean Queries

Sử dụng `.lean()` khi không cần Mongoose documents:

```typescript
const events = await Event.find().lean()
```

### 4. Pagination

Luôn sử dụng pagination cho large datasets:

```typescript
const { posts, hasMore } = await postRepository.findWithPagination(
  eventId,
  page,
  limit
)
```

---

## 🐛 Troubleshooting

### Lỗi: "MongoServerError: Authentication failed"

**Giải pháp**:
- Kiểm tra username/password trong `MONGODB_URI`
- Verify database user trong MongoDB Atlas
- Check IP whitelist

### Lỗi: "Cannot read properties of undefined"

**Giải pháp**:
- Serialize MongoDB documents thành plain objects
- Check field names (MongoDB dùng `_id`, code dùng `id`)

### Lỗi: "Connection timeout"

**Giải pháp**:
- Check network connectivity
- Verify MongoDB Atlas cluster status
- Increase `serverSelectionTimeoutMS`

---

## 📚 Tài Liệu Tham Khảo

- [MongoDB Docs](https://docs.mongodb.com/)
- [Mongoose Docs](https://mongoosejs.com/docs/)
- [Next.js + MongoDB](https://www.mongodb.com/developer/languages/javascript/nextjs-with-mongodb/)
- [Supabase Auth](https://supabase.com/docs/guides/auth)

---

## ✅ Checklist Migration

- [ ] Setup MongoDB Atlas cluster
- [ ] Cấu hình environment variables
- [ ] Run migration scripts
- [ ] Verify data integrity
- [ ] Test authentication vẫn hoạt động
- [ ] Test file upload/download
- [ ] Test admin functions
- [ ] Update deployment environment variables
- [ ] Monitor performance sau migration
- [ ] Backup Supabase data trước khi tắt

---

## 🎉 Kết Luận

Migration hoàn tất! Bạn giờ đây có:

✅ **Hybrid Architecture** linh hoạt
✅ **MongoDB** cho data layer nhanh & scalable
✅ **Supabase** cho auth & storage đơn giản
✅ **Clean Architecture** với Repository Pattern
✅ **Type Safety** đầy đủ với TypeScript

**Happy Coding!** 🚀
