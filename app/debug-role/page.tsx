import { createClient } from '@/lib/supabase/server'
import { getUserRole, isCurrentUserAdmin } from '@/lib/auth-utils'

export default async function DebugRolePage() {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">🔴 Auth Error</h1>
        <pre className="bg-red-100 p-4 rounded">{JSON.stringify(userError, null, 2)}</pre>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">❌ Not Logged In</h1>
        <p>Please login first at <a href="/login" className="text-blue-500">/login</a></p>
      </div>
    )
  }

  // Check role directly
  const userRole = await getUserRole(user.id)
  const isAdmin = await isCurrentUserAdmin()

  // Try to query user_roles table directly
  const { data: roleData, error: roleError } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🔍 Debug Role Information</h1>

      <div className="space-y-6">
        {/* User Info */}
        <div className="bg-blue-50 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-3">👤 User Info</h2>
          <div className="space-y-2">
            <p><strong>User ID:</strong> <code className="bg-white px-2 py-1 rounded">{user.id}</code></p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Created At:</strong> {new Date(user.created_at || '').toLocaleString()}</p>
          </div>
        </div>

        {/* Role Check Results */}
        <div className="bg-green-50 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-3">🎭 Role Check Results</h2>
          <div className="space-y-2">
            <p><strong>getUserRole():</strong> <code className="bg-white px-2 py-1 rounded">{userRole}</code></p>
            <p><strong>isCurrentUserAdmin():</strong> <code className="bg-white px-2 py-1 rounded">{isAdmin ? '✅ TRUE' : '❌ FALSE'}</code></p>
          </div>
        </div>

        {/* Database Query */}
        <div className={`${roleError ? 'bg-red-50' : 'bg-purple-50'} p-6 rounded-lg`}>
          <h2 className="text-xl font-bold mb-3">🗄️ Direct Database Query</h2>
          {roleError ? (
            <div>
              <p className="text-red-600 font-bold mb-2">❌ Error querying user_roles table:</p>
              <pre className="bg-white p-3 rounded text-sm overflow-auto">{JSON.stringify(roleError, null, 2)}</pre>
            </div>
          ) : roleData ? (
            <div>
              <p className="text-green-600 font-bold mb-2">✅ Found role in database:</p>
              <pre className="bg-white p-3 rounded text-sm overflow-auto">{JSON.stringify(roleData, null, 2)}</pre>
            </div>
          ) : (
            <p className="text-yellow-600 font-bold">⚠️ No role found in database</p>
          )}
        </div>

        {/* All user_roles (if admin) */}
        {isAdmin && (
          <div className="bg-yellow-50 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-3">👥 All User Roles (Admin View)</h2>
            <AllRoles />
          </div>
        )}

        {/* Recommendations */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-3">💡 Recommendations</h2>
          {!isAdmin && (
            <div className="space-y-3">
              <p className="text-red-600 font-bold">❌ You are NOT an admin</p>
              <div className="bg-white p-4 rounded">
                <p className="font-bold mb-2">To fix this, run in Supabase SQL Editor:</p>
                <pre className="text-sm bg-gray-100 p-3 rounded overflow-auto">{`INSERT INTO user_roles (user_id, role, created_by)
VALUES ('${user.id}', 'admin', '${user.id}')
ON CONFLICT (user_id)
DO UPDATE SET role = 'admin', updated_at = NOW();`}</pre>
              </div>
              <p className="text-sm text-gray-600">After running the SQL, <strong>logout and login again</strong> to refresh your session.</p>
            </div>
          )}
          {isAdmin && (
            <div className="space-y-2">
              <p className="text-green-600 font-bold">✅ You are an admin!</p>
              <p>You should see the &quot;Quản Trị&quot; button in the header.</p>
              <p>Try accessing: <a href="/admin" className="text-blue-500 underline">/admin</a></p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

async function AllRoles() {
  const supabase = await createClient()

  const { data: allRoles, error } = await supabase
    .from('user_roles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return <pre className="bg-white p-3 rounded text-sm text-red-600">{JSON.stringify(error, null, 2)}</pre>
  }

  return (
    <div className="overflow-auto">
      <table className="min-w-full bg-white rounded">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 text-left">User ID</th>
            <th className="p-2 text-left">Role</th>
            <th className="p-2 text-left">Created At</th>
          </tr>
        </thead>
        <tbody>
          {allRoles?.map((role: any) => (
            <tr key={role.id} className="border-t">
              <td className="p-2 font-mono text-xs">{role.user_id.slice(0, 20)}...</td>
              <td className="p-2">
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  role.role === 'admin' || role.role === 'super_admin' ? 'bg-red-200' :
                  role.role === 'moderator' ? 'bg-blue-200' : 'bg-gray-200'
                }`}>
                  {role.role}
                </span>
              </td>
              <td className="p-2 text-sm">{new Date(role.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
