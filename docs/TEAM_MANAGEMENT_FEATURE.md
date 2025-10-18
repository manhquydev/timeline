# Team Management Feature Documentation

## Overview

Tính năng quản lý đội ngũ phát triển - cho phép admin quản lý thông tin các thành viên đội ngũ và hiển thị trang "Về Chúng Tôi" công khai.

**Version**: 1.0.0
**Date**: 2024-10-18

## Features

### 1. **Admin - Quản Lý Team Members** (`/admin/team`)

Admin có thể:
- ✅ Thêm thành viên mới
- ✅ Chỉnh sửa thông tin thành viên
- ✅ Tải lên avatar (tự động resize 400x400, format WebP)
- ✅ Quản lý thứ tự hiển thị
- ✅ Ẩn/Hiện thành viên
- ✅ Xóa thành viên
- ✅ Quản lý social links (GitHub, LinkedIn, Email, Facebook)

### 2. **Public - Trang Giới Thiệu** (`/about`)

Trang công khai hiển thị:
- ✅ Thông tin về dự án Timeline
- ✅ Danh sách team members (chỉ active)
- ✅ Avatar, tên, vai trò, mô tả
- ✅ Social links của từng thành viên
- ✅ Tech stack được sử dụng
- ✅ Responsive design (mobile-first)

## Database Schema

### MongoDB Collection: `team_members`

```typescript
interface ITeamMember {
  id: string                    // nanoid() - unique identifier
  name: string                  // Tên thành viên
  role: string                  // Vai trò (VD: "Lead Developer")
  avatar_url?: string | null    // URL avatar trên Supabase Storage
  description?: string | null   // Mô tả ngắn (1 dòng)
  bio?: string | null          // Mô tả chi tiết (nhiều dòng)
  order: number                 // Thứ tự hiển thị (0, 1, 2...)
  social_links?: {
    github?: string | null
    linkedin?: string | null
    email?: string | null
    facebook?: string | null
  }
  is_active: boolean           // Hiển thị/Ẩn
  created_at: Date
  updated_at: Date
}
```

### Indexes

```javascript
TeamMemberSchema.index({ order: 1 })
TeamMemberSchema.index({ is_active: 1, order: 1 })
TeamMemberSchema.index({ created_at: -1 })
```

## API Routes

### Admin APIs (require `isCurrentUserAdmin()`)

#### 1. **GET /api/admin/team**
Lấy danh sách team members

**Query Parameters:**
- `active` (optional): `true` để chỉ lấy members đang hiển thị

**Response:**
```json
{
  "members": [
    {
      "id": "abc123",
      "name": "Nguyễn Văn A",
      "role": "Lead Developer",
      "avatar_url": "https://...",
      "description": "Chuyên gia về React và Node.js",
      "bio": "...",
      "order": 0,
      "social_links": {
        "github": "https://github.com/...",
        "linkedin": "...",
        "email": "...",
        "facebook": "..."
      },
      "is_active": true,
      "created_at": "2024-10-18T...",
      "updated_at": "2024-10-18T..."
    }
  ],
  "total": 5
}
```

#### 2. **POST /api/admin/team**
Tạo team member mới

**Body:**
```json
{
  "name": "Nguyễn Văn A",
  "role": "Lead Developer",
  "avatar_url": "https://...",
  "description": "Chuyên gia về React",
  "bio": "Mô tả chi tiết...",
  "order": 0,
  "social_links": {
    "github": "https://github.com/..."
  },
  "is_active": true
}
```

**Response:**
```json
{
  "success": true,
  "member": {
    "id": "abc123",
    "name": "Nguyễn Văn A",
    "role": "Lead Developer",
    "order": 0
  }
}
```

#### 3. **PATCH /api/admin/team**
Cập nhật team member

**Body:**
```json
{
  "id": "abc123",
  "name": "Nguyễn Văn B",
  "role": "Senior Developer"
}
```

#### 4. **DELETE /api/admin/team?id=abc123**
Xóa team member

#### 5. **POST /api/admin/team/upload-avatar**
Upload avatar cho team member

**Body:** FormData with `avatar` file

**Response:**
```json
{
  "success": true,
  "avatar_url": "https://..."
}
```

**Note**: Avatar được tự động resize về 400x400px và convert sang WebP format.

#### 6. **POST /api/admin/team/reorder**
Cập nhật thứ tự hiển thị (drag & drop)

**Body:**
```json
{
  "orders": [
    { "id": "abc123", "order": 0 },
    { "id": "def456", "order": 1 }
  ]
}
```

## File Structure

```
lib/mongodb/
├── models/
│   ├── TeamMember.ts           # Mongoose model
│   └── index.ts                # Export model
├── repositories/
│   ├── TeamMemberRepository.ts # Data access layer
│   └── index.ts                # Export repository

app/
├── admin/team/
│   └── page.tsx                # Admin management page
├── about/
│   └── page.tsx                # Public about page
└── api/admin/team/
    ├── route.ts                # CRUD operations
    ├── reorder/route.ts        # Update orders
    └── upload-avatar/route.ts  # Avatar upload

components/
├── admin/
│   ├── team-management-list.tsx  # Admin component
│   └── admin-bottom-nav.tsx      # Updated with team link
└── ui/
    └── textarea.tsx              # New UI component
```

## Usage Guide

### Admin - Thêm Thành Viên Mới

1. Truy cập `/admin/team`
2. Click "Thêm Thành Viên"
3. Điền thông tin:
   - **Tên** (required): Họ tên đầy đủ
   - **Vai trò** (required): VD: "Lead Developer", "UI/UX Designer"
   - **Avatar**: Upload ảnh (tự động resize)
   - **Mô tả ngắn**: 1 dòng mô tả vai trò
   - **Giới thiệu chi tiết**: Mô tả đầy đủ hơn
   - **Social Links**: GitHub, LinkedIn, Email, Facebook URLs
4. Click "Tạo Mới"

### Admin - Chỉnh Sửa Thành Viên

1. Click menu (⋮) bên cạnh thành viên
2. Chọn "Chỉnh sửa"
3. Cập nhật thông tin
4. Click "Cập Nhật"

### Admin - Ẩn/Hiện Thành Viên

- Click menu (⋮) → "Ẩn" hoặc "Hiển thị"
- Thành viên bị ẩn sẽ không xuất hiện trên trang `/about`

### Admin - Sắp Xếp Thứ Tự

- **TODO**: Tính năng drag & drop chưa implement UI
- Hiện tại dùng API `/api/admin/team/reorder` để cập nhật

## Navigation

### Header
- Link "Về Chúng Tôi" đã được thêm vào navigation chính
- Hiển thị cho cả guest và logged-in users

### Admin Bottom Nav (Mobile)
- Tab "Team" đã được thêm vào bottom navigation
- Icon: Users
- Path: `/admin/team`

### Admin Dashboard
- Desktop: Button "Quản Lý Team" trong action buttons
- Mobile: Dropdown menu item "Quản Lý Team"

## Best Practices

### 1. **Avatar Images**
- Khuyến nghị: 400x400px, square format
- Auto-resize: Ảnh upload sẽ tự động crop về 400x400
- Format: WebP (tự động convert)
- Storage: Supabase Storage bucket `event-media/avatars/`

### 2. **Social Links**
- Sử dụng full URL (VD: `https://github.com/username`)
- Email có thể nhập trực tiếp (VD: `email@example.com`)
- Để trống nếu không có link

### 3. **Order Management**
- Order bắt đầu từ 0
- Tự động tăng khi thêm member mới
- Sort: ASC (0 → 1 → 2...)

### 4. **Active Status**
- Mặc định: `true` (hiển thị)
- Nên ẩn thay vì xóa nếu member tạm thời không active

## Technical Details

### Repository Pattern

```typescript
import { teamMemberRepository } from '@/lib/mongodb/repositories'

// Find all active members
const members = await teamMemberRepository.findActive()

// Create new member
const member = await teamMemberRepository.create({
  name: 'John Doe',
  role: 'Developer',
  order: 0,
  is_active: true
})

// Update member
await teamMemberRepository.update(id, {
  name: 'Jane Doe'
})

// Delete member
await teamMemberRepository.delete(id)
```

### Static Methods

```typescript
// Get next order number
const nextOrder = await TeamMember.getNextOrder()

// Find active members (model method)
const members = await TeamMember.findActive()
```

### Image Upload Flow

1. Client uploads image → `/api/admin/team/upload-avatar`
2. Server uses Sharp to resize (400x400, cover fit)
3. Convert to WebP (quality: 90)
4. Upload to Supabase Storage
5. Return public URL
6. Client updates `avatar_url` in form

## Migration Guide

Nếu bạn muốn migrate data từ source khác:

```typescript
import { teamMemberRepository } from '@/lib/mongodb/repositories'

const members = [
  {
    name: 'Nguyễn Văn A',
    role: 'Lead Developer',
    avatar_url: 'https://...',
    description: 'Chuyên gia về React',
    order: 0,
    is_active: true,
  },
  // ... more members
]

for (const data of members) {
  await teamMemberRepository.create(data)
}
```

## Future Enhancements

### Planned Features
- [ ] Drag & drop reordering UI
- [ ] Bulk import from CSV
- [ ] Team member statistics (contributions, posts)
- [ ] Integration with user profiles
- [ ] Activity timeline
- [ ] Export team data

### UI Improvements
- [ ] Grid/List view toggle
- [ ] Search and filter
- [ ] Advanced sorting
- [ ] Batch operations
- [ ] Preview before publish

## Troubleshooting

### Build Errors

**Error**: `Property 'getNextOrder' does not exist`
**Fix**: Đảm bảo đã define `ITeamMemberModel` interface với static methods

**Error**: `Module not found: '@/components/ui/textarea'`
**Fix**: Component đã được tạo trong `components/ui/textarea.tsx`

### Runtime Issues

**Avatar không hiển thị**
- Check Supabase Storage permissions
- Verify URL format
- Check network tab trong DevTools

**Không thể xóa member**
- Verify admin permissions
- Check API logs
- Ensure MongoDB connection

## Support

Nếu gặp vấn đề:
1. Check MongoDB connection: `npm run test:mongodb`
2. Review API logs trong browser DevTools
3. Verify admin role: `/debug-role`
4. Check Supabase Storage permissions

## Credits

Developed by Team Giảng Viên Teky Hoàng Mai
Version: 1.0.0
Date: 2024-10-18
