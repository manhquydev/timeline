import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isCurrentUserAdmin } from '@/lib/auth-utils'
import CreateEventForm from './create-event-form'

export const metadata = {
  title: 'Tạo Sự Kiện Mới | Timeline Teky Hoàng Mai',
  description: 'Tạo sự kiện công ty mới',
}

export default async function CreateEventPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Check if user is admin - CRITICAL SECURITY CHECK
  if (!user || !(await isCurrentUserAdmin())) {
    redirect('/')
  }

  return <CreateEventForm />
}
