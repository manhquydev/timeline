'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { MoreVertical, Shield, ShieldAlert, ShieldCheck, User, Trash2, UserCog } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface UserData {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: 'user' | 'moderator' | 'admin' | 'super_admin'
  total_uploads: number
  created_at: string
  last_sign_in_at: string | null
  email_confirmed_at: string | null
}

interface UserManagementListProps {
  users: UserData[]
  currentUserId: string
}

const roleConfig = {
  user: {
    label: 'Người Dùng',
    color: 'bg-gray-500',
    icon: User,
  },
  moderator: {
    label: 'Người Kiểm Duyệt',
    color: 'bg-blue-500',
    icon: ShieldCheck,
  },
  admin: {
    label: 'Quản Trị Viên',
    color: 'bg-purple-500',
    icon: Shield,
  },
  super_admin: {
    label: 'Quản Trị Cấp Cao',
    color: 'bg-red-500',
    icon: ShieldAlert,
  },
}

export function UserManagementList({ users, currentUserId }: UserManagementListProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const handleUpdateRole = async (userId: string, newRole: string) => {
    setLoading(userId)
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update role')
      }

      router.refresh()
    } catch (error: any) {
      alert(error.message || 'Failed to update role')
    } finally {
      setLoading(null)
    }
  }

  const handleDeleteUser = async () => {
    if (!deleteUserId) return

    setLoading(deleteUserId)
    try {
      const response = await fetch(`/api/admin/users?userId=${deleteUserId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete user')
      }

      router.refresh()
      setDeleteUserId(null)
    } catch (error: any) {
      alert(error.message || 'Failed to delete user')
    } finally {
      setLoading(null)
    }
  }

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    return email.slice(0, 2).toUpperCase()
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Chưa có'
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Tìm kiếm theo email hoặc tên..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 h-10 px-4 rounded-md border border-input bg-background"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="h-10 px-4 rounded-md border border-input bg-background"
        >
          <option value="all">Tất cả vai trò</option>
          <option value="user">Người Dùng</option>
          <option value="moderator">Người Kiểm Duyệt</option>
          <option value="admin">Quản Trị Viên</option>
          <option value="super_admin">Quản Trị Cấp Cao</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="space-y-2">
        {filteredUsers.map((user, index) => {
          const roleInfo = roleConfig[user.role]
          const RoleIcon = roleInfo.icon
          const isCurrentUser = user.id === currentUserId

          return (
            <div
              key={user.id}
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors border border-border animate-slide-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Avatar */}
              <Avatar className="w-12 h-12">
                <AvatarImage src={user.avatar_url || undefined} alt={user.full_name || user.email} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold">
                  {getInitials(user.full_name, user.email)}
                </AvatarFallback>
              </Avatar>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold truncate">
                    {user.full_name || user.email}
                    {isCurrentUser && (
                      <span className="text-xs text-muted-foreground ml-2">(Bạn)</span>
                    )}
                  </p>
                  <Badge className={`${roleInfo.color} text-white text-xs`}>
                    <RoleIcon className="w-3 h-3 mr-1" />
                    {roleInfo.label}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                  <span>{user.total_uploads} uploads</span>
                  <span>Đăng ký: {formatDate(user.created_at)}</span>
                  {user.last_sign_in_at && (
                    <span>Đăng nhập: {formatDate(user.last_sign_in_at)}</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              {!isCurrentUser && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={loading === user.id}
                      className="h-8 w-8 p-0"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Thay đổi vai trò</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleUpdateRole(user.id, 'user')}>
                      <User className="w-4 h-4 mr-2" />
                      Người Dùng
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleUpdateRole(user.id, 'moderator')}>
                      <UserCog className="w-4 h-4 mr-2" />
                      Người Kiểm Duyệt
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleUpdateRole(user.id, 'admin')}>
                      <Shield className="w-4 h-4 mr-2" />
                      Quản Trị Viên
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleUpdateRole(user.id, 'super_admin')}>
                      <ShieldAlert className="w-4 h-4 mr-2" />
                      Quản Trị Cấp Cao
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setDeleteUserId(user.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Xóa Người Dùng
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )
        })}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Không tìm thấy người dùng nào</p>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteUserId} onOpenChange={(open) => !open && setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa người dùng này?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Tất cả dữ liệu của người dùng này sẽ bị xóa vĩnh viễn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
