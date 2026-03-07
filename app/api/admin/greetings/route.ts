import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isCurrentUserAdmin } from '@/lib/auth-utils'
import { greetingRepository } from '@/lib/mongodb/repositories'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await isCurrentUserAdmin())) return null
  return user
}

export async function GET(req: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = parseInt(searchParams.get('limit') ?? '20')
  const eventTag = searchParams.get('eventTag') ?? undefined
  const approvedParam = searchParams.get('approved')
  const approved = approvedParam === null ? undefined : approvedParam === 'true'

  const result = await greetingRepository.findAll({ page, limit, eventTag, approved })
  return NextResponse.json(result)
}

export async function PATCH(req: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const body = await req.json()
  const { id, action } = body

  if (!id || !action) return NextResponse.json({ error: 'id and action required' }, { status: 400 })

  if (action === 'approve') {
    await greetingRepository.approve(id)
    return NextResponse.json({ success: true, message: 'Đã duyệt lời chúc' })
  } else if (action === 'reject') {
    await greetingRepository.reject(id)
    return NextResponse.json({ success: true, message: 'Đã từ chối lời chúc' })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}

export async function DELETE(req: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  await greetingRepository.deleteById(id)
  return NextResponse.json({ success: true, message: 'Đã xóa lời chúc' })
}
