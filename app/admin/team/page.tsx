import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isCurrentUserAdmin } from '@/lib/auth-utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Users } from 'lucide-react'
import Link from 'next/link'
import { TeamManagementList } from '@/components/admin/team-management-list'
import { AdminBottomNav } from '@/components/admin/admin-bottom-nav'
import { teamMemberRepository } from '@/lib/mongodb/repositories'

export const metadata = {
  title: 'Quản Lý Team | Timeline Teky Hoàng Mai',
  description: 'Quản lý thành viên đội ngũ phát triển',
}

export const dynamic = 'force-dynamic'

export default async function AdminTeamPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Check if user is admin
  if (!user || !(await isCurrentUserAdmin())) {
    redirect('/')
  }

  // Fetch team members from MongoDB (already plain objects from lean query)
  const members = await teamMemberRepository.findAll()

  // Map to serializable format for Client Component
  const teamMembers = members.map(member => ({
    id: member.id,
    name: member.name,
    role: member.role,
    avatar_url: member.avatar_url ?? null,
    description: member.description ?? null,
    bio: member.bio ?? null,
    order: member.order,
    social_links: member.social_links ? {
      github: member.social_links.github ?? null,
      linkedin: member.social_links.linkedin ?? null,
      email: member.social_links.email ?? null,
      facebook: member.social_links.facebook ?? null,
    } : undefined,
    is_active: member.is_active,
    created_at: member.created_at instanceof Date ? member.created_at.toISOString() : String(member.created_at),
    updated_at: member.updated_at instanceof Date ? member.updated_at.toISOString() : String(member.updated_at),
  }))

  const stats = {
    total: members.length,
    active: members.filter(m => m.is_active).length,
    inactive: members.filter(m => !m.is_active).length,
  }

  return (
    <main className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8 admin-content-mobile">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin" className="hidden lg:block">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại Dashboard
            </Button>
          </Link>
          <h1 className="admin-header-mobile font-bold mb-2">Quản Lý Team</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Quản lý thông tin đội ngũ phát triển sản phẩm
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Tổng số</p>
                <h3 className="text-2xl font-bold">{stats.total}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Hiển thị</p>
                <h3 className="text-2xl font-bold text-green-600">{stats.active}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Ẩn</p>
                <h3 className="text-2xl font-bold text-gray-400">{stats.inactive}</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Team Members List */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Danh Sách Thành Viên
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TeamManagementList members={teamMembers} />
          </CardContent>
        </Card>
      </div>

      {/* Mobile Bottom Navigation */}
      <AdminBottomNav />
    </main>
  )
}
