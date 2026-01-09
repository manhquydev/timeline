import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users } from 'lucide-react'
import { TeamManagementList } from '@/components/admin/team-management-list'
import { teamMemberRepository } from '@/lib/mongodb/repositories'

export const metadata = {
  title: 'Quản Lý Team | Timeline Teky Hoàng Mai',
  description: 'Quản lý thành viên đội ngũ phát triển',
}

export const dynamic = 'force-dynamic'

export default async function AdminTeamPage() {
  // Auth check handled in layout.tsx

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
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-8 admin-content-mobile">
        {/* Header */}
        <div className="mb-8">
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
    </main>
  )
}
