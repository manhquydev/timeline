'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { MoreVertical, Plus, Edit, Trash2, Eye, EyeOff, Upload, Github, Linkedin, Mail, Facebook, Users, ChevronUp, ChevronDown, GripVertical } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { InlineSpinner } from '@/components/ui/loading-skeleton'

interface SocialLinks {
  github?: string | null
  linkedin?: string | null
  email?: string | null
  facebook?: string | null
}

interface TeamMember {
  id: string
  name: string
  role: string
  avatar_url?: string | null
  description?: string | null
  bio?: string | null
  order: number
  social_links?: SocialLinks
  is_active: boolean
  created_at: string
  updated_at: string
}

interface TeamManagementListProps {
  members: TeamMember[]
}

export function TeamManagementList({ members }: TeamManagementListProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [editMember, setEditMember] = useState<TeamMember | null>(null)
  const [deleteMemberId, setDeleteMemberId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [reordering, setReordering] = useState<string | null>(null)

  // Sort members by order
  const sortedMembers = [...members].sort((a, b) => a.order - b.order)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    avatar_url: '',
    description: '',
    bio: '',
    social_links: {
      github: '',
      linkedin: '',
      email: '',
      facebook: '',
    },
  })

  const resetForm = () => {
    setFormData({
      name: '',
      role: '',
      avatar_url: '',
      description: '',
      bio: '',
      social_links: {
        github: '',
        linkedin: '',
        email: '',
        facebook: '',
      },
    })
  }

  const openCreateDialog = () => {
    resetForm()
    setIsCreating(true)
  }

  const openEditDialog = (member: TeamMember) => {
    setFormData({
      name: member.name,
      role: member.role,
      avatar_url: member.avatar_url || '',
      description: member.description || '',
      bio: member.bio || '',
      social_links: {
        github: member.social_links?.github || '',
        linkedin: member.social_links?.linkedin || '',
        email: member.social_links?.email || '',
        facebook: member.social_links?.facebook || '',
      },
    })
    setEditMember(member)
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingAvatar(true)
    try {
      const formData = new FormData()
      formData.append('avatar', file)

      const response = await fetch('/api/admin/team/upload-avatar', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload avatar')
      }

      setFormData(prev => ({ ...prev, avatar_url: data.avatar_url }))
    } catch (error: any) {
      alert(error.message || 'Failed to upload avatar')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleCreate = async () => {
    if (!formData.name || !formData.role) {
      alert('Vui lòng nhập tên và vai trò')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/admin/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          social_links: {
            github: formData.social_links.github || null,
            linkedin: formData.social_links.linkedin || null,
            email: formData.social_links.email || null,
            facebook: formData.social_links.facebook || null,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create team member')
      }

      router.refresh()
      setIsCreating(false)
      resetForm()
    } catch (error: any) {
      alert(error.message || 'Failed to create team member')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async () => {
    if (!editMember) return

    setLoading(true)
    try {
      const response = await fetch('/api/admin/team', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editMember.id,
          ...formData,
          social_links: {
            github: formData.social_links.github || null,
            linkedin: formData.social_links.linkedin || null,
            email: formData.social_links.email || null,
            facebook: formData.social_links.facebook || null,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update team member')
      }

      router.refresh()
      setEditMember(null)
      resetForm()
    } catch (error: any) {
      alert(error.message || 'Failed to update team member')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteMemberId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/team?id=${deleteMemberId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete team member')
      }

      router.refresh()
      setDeleteMemberId(null)
    } catch (error: any) {
      alert(error.message || 'Failed to delete team member')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/team', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          is_active: !currentStatus,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to toggle visibility')
      }

      router.refresh()
    } catch (error: any) {
      alert(error.message || 'Failed to toggle visibility')
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = sortedMembers.findIndex(m => m.id === id)
    if (currentIndex === -1) return
    if (direction === 'up' && currentIndex === 0) return
    if (direction === 'down' && currentIndex === sortedMembers.length - 1) return

    setReordering(id)
    try {
      const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
      const current = sortedMembers[currentIndex]
      const swap = sortedMembers[swapIndex]

      // Swap orders
      await Promise.all([
        fetch('/api/admin/team', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: current.id, order: swap.order }),
        }),
        fetch('/api/admin/team', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: swap.id, order: current.order }),
        }),
      ])

      router.refresh()
    } catch (error: any) {
      alert(error.message || 'Không thể thay đổi thứ tự')
    } finally {
      setReordering(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Create Button */}
      <div className="flex justify-end mb-4">
        <Button onClick={openCreateDialog} className="gradient-1">
          <Plus className="w-4 h-4 mr-2" />
          Thêm Thành Viên
        </Button>
      </div>

      {/* Members List */}
      {members.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Chưa có thành viên nào</h3>
          <p className="text-muted-foreground mb-4">
            Thêm thành viên đội ngũ phát triển
          </p>
          <Button onClick={openCreateDialog} className="gradient-1">
            <Plus className="w-4 h-4 mr-2" />
            Thêm Thành Viên Đầu Tiên
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedMembers.map((member, index) => (
            <div
              key={member.id}
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors border border-border"
            >
              {/* Reorder Controls */}
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => handleReorder(member.id, 'up')}
                  disabled={index === 0 || reordering === member.id}
                  className="p-1 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Di chuyển lên"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <GripVertical className="w-4 h-4 text-muted-foreground mx-auto" />
                <button
                  onClick={() => handleReorder(member.id, 'down')}
                  disabled={index === sortedMembers.length - 1 || reordering === member.id}
                  className="p-1 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Di chuyển xuống"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* Avatar */}
              <Avatar className="w-16 h-16">
                <AvatarImage src={member.avatar_url || undefined} alt={member.name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold text-lg">
                  {getInitials(member.name)}
                </AvatarFallback>
              </Avatar>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-lg">{member.name}</p>
                  <Badge variant={member.is_active ? 'default' : 'secondary'}>
                    {member.is_active ? 'Hiển thị' : 'Ẩn'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{member.role}</p>
                {member.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{member.description}</p>
                )}
                {/* Social Links */}
                {member.social_links && (
                  <div className="flex items-center gap-2 mt-2">
                    {member.social_links.github && (
                      <a href={member.social_links.github} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                    {member.social_links.linkedin && (
                      <a href={member.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                        <Linkedin className="w-4 h-4" />
                      </a>
                    )}
                    {member.social_links.email && (
                      <a href={`mailto:${member.social_links.email}`} className="text-muted-foreground hover:text-foreground">
                        <Mail className="w-4 h-4" />
                      </a>
                    )}
                    {member.social_links.facebook && (
                      <a href={member.social_links.facebook} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                        <Facebook className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => openEditDialog(member)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Chỉnh sửa
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleToggleActive(member.id, member.is_active)}>
                    {member.is_active ? (
                      <>
                        <EyeOff className="w-4 h-4 mr-2" />
                        Ẩn
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        Hiển thị
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setDeleteMemberId(member.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Xóa
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isCreating || !!editMember} onOpenChange={(open) => {
        if (!open) {
          setIsCreating(false)
          setEditMember(null)
          resetForm()
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isCreating ? 'Thêm Thành Viên Mới' : 'Chỉnh Sửa Thành Viên'}
            </DialogTitle>
            <DialogDescription>
              Điền thông tin thành viên đội ngũ phát triển
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={formData.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-2xl">
                  {formData.name ? getInitials(formData.name) : '?'}
                </AvatarFallback>
              </Avatar>
              <div>
                <Label htmlFor="avatar-upload" className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                    {uploadingAvatar ? (
                      <>
                        <InlineSpinner size="sm" />
                        Đang tải...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Tải lên Avatar
                      </>
                    )}
                  </div>
                </Label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={uploadingAvatar}
                />
              </div>
            </div>

            {/* Name */}
            <div>
              <Label htmlFor="name">Tên *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="VD: Nguyễn Văn A"
              />
            </div>

            {/* Role */}
            <div>
              <Label htmlFor="role">Vai trò *</Label>
              <Input
                id="role"
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                placeholder="VD: Lead Developer, UI/UX Designer"
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Mô tả ngắn</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="VD: Chuyên gia về React và Node.js"
              />
            </div>

            {/* Bio */}
            <div>
              <Label htmlFor="bio">Giới thiệu chi tiết</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Giới thiệu chi tiết về thành viên..."
                rows={4}
              />
            </div>

            {/* Social Links */}
            <div className="space-y-3">
              <Label>Liên kết mạng xã hội</Label>

              <div className="flex items-center gap-2">
                <Github className="w-4 h-4 text-muted-foreground" />
                <Input
                  value={formData.social_links.github}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    social_links: { ...prev.social_links, github: e.target.value }
                  }))}
                  placeholder="https://github.com/username"
                />
              </div>

              <div className="flex items-center gap-2">
                <Linkedin className="w-4 h-4 text-muted-foreground" />
                <Input
                  value={formData.social_links.linkedin}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    social_links: { ...prev.social_links, linkedin: e.target.value }
                  }))}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>

              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <Input
                  value={formData.social_links.email}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    social_links: { ...prev.social_links, email: e.target.value }
                  }))}
                  placeholder="email@example.com"
                  type="email"
                />
              </div>

              <div className="flex items-center gap-2">
                <Facebook className="w-4 h-4 text-muted-foreground" />
                <Input
                  value={formData.social_links.facebook}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    social_links: { ...prev.social_links, facebook: e.target.value }
                  }))}
                  placeholder="https://facebook.com/username"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreating(false)
              setEditMember(null)
              resetForm()
            }}>
              Hủy
            </Button>
            <Button
              onClick={isCreating ? handleCreate : handleUpdate}
              disabled={loading || !formData.name || !formData.role}
              className="gradient-1"
            >
              {loading ? (
                <>
                  <InlineSpinner size="sm" className="mr-2" />
                  Đang xử lý...
                </>
              ) : (
                isCreating ? 'Tạo Mới' : 'Cập Nhật'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteMemberId} onOpenChange={(open) => !open && setDeleteMemberId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa thành viên</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Thành viên sẽ bị xóa vĩnh viễn khỏi danh sách.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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
