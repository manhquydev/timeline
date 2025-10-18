import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isCurrentUserAdmin } from '@/lib/auth-utils'
import EditEventForm from './edit-event-form'

export const metadata = {
  title: 'Chỉnh Sửa Sự Kiện | Timeline Teky Hoàng Mai',
  description: 'Chỉnh sửa thông tin sự kiện',
}

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function EditEventPage({ params }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Check if user is admin - CRITICAL SECURITY CHECK
  if (!user || !(await isCurrentUserAdmin())) {
    redirect('/')
  }

  const resolvedParams = await params

  return <EditEventForm slug={resolvedParams.slug} />
}
