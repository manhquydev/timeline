import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isCurrentUserAdmin, getUserRole } from '@/lib/auth-utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Users, Shield, UserCog } from 'lucide-react'
import Link from 'next/link'
import { UserManagementList } from '@/components/admin/user-management-list'
import { AdminBottomNav } from '@/components/admin/admin-bottom-nav'

export const metadata = {
  title: 'Quản Lý Người Dùng | Timeline Teky Hoàng Mai',
  description: 'Quản lý người dùng và phân quyền',
}

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Check if user is admin
  if (!user || !(await isCurrentUserAdmin())) {
    redirect('/')
  }

  // Get current user's role for permission checks
  const currentUserRole = await getUserRole(user.id)

  // Use admin client for privileged operations
  const adminClient = createAdminClient()

  // Fetch user profiles and roles separately (no foreign key relationship required)
  const [
    { data: profiles, error: profilesError },
    { data: roles, error: rolesError },
    { data: { users: authUsers }, error: authError }
  ] = await Promise.all([
    supabase.from('user_profiles').select('*').order('created_at', { ascending: false }),
    supabase.from('user_roles').select('*'),
    adminClient.auth.admin.listUsers()
  ])

  if (profilesError) {
    console.error('Error fetching profiles:', profilesError)
  }
  if (rolesError) {
    console.error('Error fetching roles:', rolesError)
  }
  if (authError) {
    console.error('Error fetching auth users:', authError)
  }

  // Create lookup maps for efficient joining
  const authUsersMap = new Map(authUsers?.map(u => [u.id, u]) || [])
  const rolesMap = new Map(roles?.map((r: any) => [r.user_id, r]) || [])

  // Combine data with JavaScript joins
  const usersWithDetails = profiles?.map((profile: any) => {
    const authUser = authUsersMap.get(profile.id)
    const userRole = rolesMap.get(profile.id)

    return {
      id: profile.id,
      email: authUser?.email || profile.email || 'N/A',
      full_name: profile.full_name,
      avatar_url: profile.avatar_url,
      role: userRole?.role || 'user',
      total_uploads: profile.total_uploads,
      created_at: profile.created_at,
      last_sign_in_at: authUser?.last_sign_in_at || null,
      email_confirmed_at: authUser?.email_confirmed_at || null,
    }
  }) || []

  // Calculate stats
  const totalUsers = usersWithDetails.length
  const adminCount = usersWithDetails.filter(u => u.role === 'admin' || u.role === 'super_admin').length
  const moderatorCount = usersWithDetails.filter(u => u.role === 'moderator').length
  const activeUsersCount = usersWithDetails.filter(u => u.total_uploads > 0).length

  const stats = [
    {
      title: 'Tổng Người Dùng',
      value: totalUsers,
      icon: Users,
      gradient: 'gradient-1',
    },
    {
      title: 'Quản Trị Viên',
      value: adminCount,
      icon: Shield,
      gradient: 'gradient-2',
    },
    {
      title: 'Người Kiểm Duyệt',
      value: moderatorCount,
      icon: UserCog,
      gradient: 'gradient-3',
    },
    {
      title: 'Người Dùng Tích Cực',
      value: activeUsersCount,
      icon: Users,
      gradient: 'gradient-4',
    },
  ]

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
          <h1 className="admin-header-mobile font-bold mb-2">Quản Lý Người Dùng</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Xem, chỉnh sửa vai trò và quản lý người dùng trong hệ thống
          </p>
        </div>

        {/* Stats Grid */}
        <div className="admin-stats-grid mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card
                key={index}
                className="overflow-hidden hover-lift border-0 shadow-lg animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {stat.title}
                      </p>
                      <h3 className="text-3xl font-bold">{stat.value}</h3>
                    </div>
                    <div className={`w-12 h-12 rounded-xl ${stat.gradient} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Users List */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Danh Sách Người Dùng
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!usersWithDetails || usersWithDetails.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Chưa có người dùng nào</h3>
                <p className="text-muted-foreground">
                  Người dùng sẽ xuất hiện sau khi đăng ký
                </p>
              </div>
            ) : (
              <UserManagementList
                users={usersWithDetails}
                currentUserId={user.id}
                currentUserRole={currentUserRole}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Mobile Bottom Navigation */}
      <AdminBottomNav />
    </main>
  )
}
