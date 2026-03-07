'use client'

import { useState, useEffect, useCallback } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Check, X, Trash2, RefreshCw } from 'lucide-react'

interface Greeting {
  _id: string
  id: string
  authorName: string
  authorId: string | null
  message: string
  eventTag: string
  isApproved: boolean
  createdAt: string
}

interface Pagination {
  page: number
  total: number
  totalPages: number
}

type Filter = 'pending' | 'approved' | 'all'

export function GreetingManagementList() {
  const [greetings, setGreetings] = useState<Greeting[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, total: 0, totalPages: 1 })
  const [filter, setFilter] = useState<Filter>('pending')
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)

  const fetchGreetings = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (filter === 'pending') params.set('approved', 'false')
      if (filter === 'approved') params.set('approved', 'true')

      const res = await fetch(`/api/admin/greetings?${params}`)
      const data = await res.json()
      setGreetings(data.greetings ?? [])
      setPagination(data.pagination ?? { page: 1, total: 0, totalPages: 1 })
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { fetchGreetings(1) }, [fetchGreetings])

  async function handleAction(id: string, action: 'approve' | 'reject') {
    setActionId(id)
    try {
      await fetch('/api/admin/greetings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      })
      setGreetings((prev) => prev.filter((g) => g.id !== id))
    } finally {
      setActionId(null)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Xóa vĩnh viễn lời chúc này?')) return
    setActionId(id)
    try {
      await fetch(`/api/admin/greetings?id=${id}`, { method: 'DELETE' })
      setGreetings((prev) => prev.filter((g) => g.id !== id))
    } finally {
      setActionId(null)
    }
  }

  const filterTabs: { key: Filter; label: string }[] = [
    { key: 'pending', label: '⏳ Chờ duyệt' },
    { key: 'approved', label: '✅ Đã duyệt' },
    { key: 'all', label: '📋 Tất cả' },
  ]

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === tab.key
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

      {/* Total */}
      <p className="text-sm text-gray-500">{pagination.total} lời chúc</p>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : greetings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-400">
            <p className="text-4xl mb-3">💌</p>
            <p>Không có lời chúc nào</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {greetings.map((g) => (
            <Card key={g.id} className="rounded-xl">
              <CardContent className="p-4 flex gap-4 items-start">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-700">{g.authorName}</span>
                    <Badge variant="outline" className="text-xs">
                      #{g.eventTag}
                    </Badge>
                    {g.isApproved && (
                      <Badge className="text-xs bg-green-100 text-green-700 border-0">
                        Đã duyệt
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-3">{g.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(g.createdAt).toLocaleDateString('vi-VN', {
                      day: '2-digit', month: '2-digit', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  {!g.isApproved && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 text-green-600 hover:bg-green-50 hover:border-green-300"
                      disabled={actionId === g.id}
                      onClick={() => handleAction(g.id, 'approve')}
                      title="Duyệt"
                    >
                      <Check size={14} />
                    </Button>
                  )}
                  {!g.isApproved && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 text-orange-500 hover:bg-orange-50 hover:border-orange-300"
                      disabled={actionId === g.id}
                      onClick={() => handleAction(g.id, 'reject')}
                      title="Từ chối"
                    >
                      <X size={14} />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:border-red-300"
                    disabled={actionId === g.id}
                    onClick={() => handleDelete(g.id)}
                    title="Xóa"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
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
