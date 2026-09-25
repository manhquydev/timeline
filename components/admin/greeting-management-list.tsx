'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Check,
  Pencil,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Trash2,
  Undo2,
  X,
} from 'lucide-react'

interface Greeting {
  _id: string
  id: string
  authorName: string
  authorId: string | null
  message: string
  eventTag: string
  eventId?: string | null
  eventSlug?: string | null
  templateId?: number | null
  isApproved: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt?: string
}

interface Pagination {
  page: number
  total: number
  totalPages: number
}

type StatusFilter = 'pending' | 'approved' | 'rejected' | 'all'
type ActionType = 'approve' | 'unapprove' | 'reject' | 'restore'

interface EditState {
  authorName: string
  message: string
  eventTag: string
  eventId: string
  eventSlug: string
  templateId: string
}

function statusLabel(item: Greeting) {
  if (item.isDeleted) return 'Đã từ chối'
  if (item.isApproved) return 'Đã duyệt'
  return 'Chờ duyệt'
}

function statusBadgeClass(item: Greeting) {
  if (item.isDeleted) return 'bg-orange-100 text-orange-700 border-0'
  if (item.isApproved) return 'bg-green-100 text-green-700 border-0'
  return 'bg-gray-100 text-gray-700 border-0'
}

export function GreetingManagementList() {
  const [greetings, setGreetings] = useState<Greeting[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, total: 0, totalPages: 1 })
  const [status, setStatus] = useState<StatusFilter>('pending')
  const [queryDraft, setQueryDraft] = useState('')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<EditState | null>(null)

  const hasFilters = useMemo(() => query.trim().length > 0 || status !== 'pending', [query, status])

  const fetchGreetings = useCallback(
    async (page = 1) => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: '20',
          status,
        })
        if (query.trim()) params.set('q', query.trim())

        const res = await fetch(`/api/admin/greetings?${params.toString()}`)
        const data = await res.json()
        setGreetings(data.greetings ?? [])
        setPagination(data.pagination ?? { page: 1, total: 0, totalPages: 1 })
      } finally {
        setLoading(false)
      }
    },
    [query, status]
  )

  useEffect(() => {
    fetchGreetings(1)
  }, [fetchGreetings])

  async function runAction(id: string, action: ActionType) {
    setActionId(id)
    try {
      await fetch('/api/admin/greetings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      })
      await fetchGreetings(pagination.page)
    } finally {
      setActionId(null)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Xóa vĩnh viễn thiệp này? Hành động không thể hoàn tác.')) return
    setActionId(id)
    try {
      await fetch(`/api/admin/greetings?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
      const targetPage = greetings.length === 1 && pagination.page > 1 ? pagination.page - 1 : pagination.page
      await fetchGreetings(targetPage)
    } finally {
      setActionId(null)
    }
  }

  function startEdit(item: Greeting) {
    setEditingId(item.id)
    setEditForm({
      authorName: item.authorName ?? '',
      message: item.message ?? '',
      eventTag: item.eventTag ?? '',
      eventId: item.eventId ?? '',
      eventSlug: item.eventSlug ?? '',
      templateId: item.templateId === null || item.templateId === undefined ? '' : String(item.templateId),
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setEditForm(null)
  }

  async function saveEdit(id: string) {
    if (!editForm) return
    const trimmedMessage = editForm.message.trim()
    if (!trimmedMessage) return

    setActionId(id)
    try {
      const templateIdNumber =
        editForm.templateId.trim().length > 0 ? Number(editForm.templateId.trim()) : null
      await fetch('/api/admin/greetings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          action: 'update',
          authorName: editForm.authorName,
          message: trimmedMessage,
          eventTag: editForm.eventTag,
          eventId: editForm.eventId,
          eventSlug: editForm.eventSlug,
          templateId: Number.isFinite(templateIdNumber as number) ? templateIdNumber : null,
        }),
      })
      cancelEdit()
      await fetchGreetings(pagination.page)
    } finally {
      setActionId(null)
    }
  }

  const filterTabs: { key: StatusFilter; label: string }[] = [
    { key: 'pending', label: '⏳ Chờ duyệt' },
    { key: 'approved', label: '✅ Đã duyệt' },
    { key: 'rejected', label: '🚫 Đã từ chối' },
    { key: 'all', label: '📋 Tất cả' },
  ]

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-white p-3 sm:p-4 space-y-3">
        <div className="flex gap-2 flex-wrap">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatus(tab.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                status === tab.key
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <button
            onClick={() => fetchGreetings(pagination.page)}
            className="ml-auto p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
            aria-label="Tải lại"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              value={queryDraft}
              onChange={(e) => setQueryDraft(e.target.value)}
              placeholder="Tìm theo tên, nội dung, event tag..."
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setQuery(queryDraft)}
            disabled={loading}
          >
            Tìm
          </Button>
          {hasFilters && (
            <Button
              variant="ghost"
              onClick={() => {
                setStatus('pending')
                setQuery('')
                setQueryDraft('')
              }}
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-500">{pagination.total} thiệp</p>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : greetings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-400">
            <p className="text-4xl mb-3">💌</p>
            <p>Không có thiệp nào với bộ lọc hiện tại</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {greetings.map((g) => {
            const isEditing = editingId === g.id && !!editForm
            return (
              <Card key={g.id} className="rounded-xl">
                <CardContent className="p-4">
                  <div className="flex gap-3 items-start">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-sm font-medium text-gray-700">{g.authorName}</span>
                        <Badge variant="outline" className="text-xs">
                          #{g.eventTag}
                        </Badge>
                        <Badge className={`text-xs ${statusBadgeClass(g)}`}>{statusLabel(g)}</Badge>
                      </div>

                      {isEditing && editForm ? (
                        <div className="space-y-2">
                          <Input
                            value={editForm.authorName}
                            onChange={(e) => setEditForm({ ...editForm, authorName: e.target.value })}
                            placeholder="Tên người gửi"
                          />
                          <Textarea
                            value={editForm.message}
                            onChange={(e) => setEditForm({ ...editForm, message: e.target.value })}
                            rows={4}
                            placeholder="Nội dung thiệp"
                          />
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <Input
                              value={editForm.eventTag}
                              onChange={(e) => setEditForm({ ...editForm, eventTag: e.target.value })}
                              placeholder="eventTag"
                            />
                            <Input
                              value={editForm.eventId}
                              onChange={(e) => setEditForm({ ...editForm, eventId: e.target.value })}
                              placeholder="eventId"
                            />
                            <Input
                              value={editForm.eventSlug}
                              onChange={(e) => setEditForm({ ...editForm, eventSlug: e.target.value })}
                              placeholder="eventSlug"
                            />
                          </div>
                          <div className="w-full sm:w-40">
                            <Input
                              value={editForm.templateId}
                              onChange={(e) => setEditForm({ ...editForm, templateId: e.target.value })}
                              placeholder="templateId"
                            />
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm text-gray-600 whitespace-pre-wrap">{g.message}</p>
                          <div className="text-xs text-gray-400 mt-2 space-y-1">
                            <p>
                              Tạo lúc:{' '}
                              {new Date(g.createdAt).toLocaleString('vi-VN', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                            <p>
                              eventId: {g.eventId || 'null'} | eventSlug: {g.eventSlug || 'null'} | templateId:{' '}
                              {g.templateId ?? 'null'}
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5 shrink-0 justify-end">
                      {!g.isDeleted && !g.isApproved && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 text-green-600 hover:bg-green-50 hover:border-green-300"
                          disabled={actionId === g.id}
                          onClick={() => runAction(g.id, 'approve')}
                          title="Duyệt"
                        >
                          <Check size={14} />
                        </Button>
                      )}
                      {!g.isDeleted && g.isApproved && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 text-amber-600 hover:bg-amber-50 hover:border-amber-300"
                          disabled={actionId === g.id}
                          onClick={() => runAction(g.id, 'unapprove')}
                          title="Chuyển về chờ duyệt"
                        >
                          <Undo2 size={14} />
                        </Button>
                      )}
                      {!g.isDeleted && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 text-orange-500 hover:bg-orange-50 hover:border-orange-300"
                          disabled={actionId === g.id}
                          onClick={() => runAction(g.id, 'reject')}
                          title="Từ chối / Ẩn"
                        >
                          <X size={14} />
                        </Button>
                      )}
                      {g.isDeleted && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                          disabled={actionId === g.id}
                          onClick={() => runAction(g.id, 'restore')}
                          title="Khôi phục"
                        >
                          <RotateCcw size={14} />
                        </Button>
                      )}

                      {!isEditing ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300"
                          disabled={actionId === g.id}
                          onClick={() => startEdit(g)}
                          title="Sửa"
                        >
                          <Pencil size={14} />
                        </Button>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 text-green-600 hover:bg-green-50 hover:border-green-300"
                            disabled={actionId === g.id}
                            onClick={() => saveEdit(g.id)}
                            title="Lưu"
                          >
                            <Save size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                            disabled={actionId === g.id}
                            onClick={cancelEdit}
                            title="Hủy sửa"
                          >
                            <X size={14} />
                          </Button>
                        </>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:border-red-300"
                        disabled={actionId === g.id}
                        onClick={() => handleDelete(g.id)}
                        title="Xóa vĩnh viễn"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-2">
          {[...Array(pagination.totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => fetchGreetings(i + 1)}
              className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                pagination.page === i + 1
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
