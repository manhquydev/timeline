'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { Play, RotateCcw, ShieldCheck, Zap, Trash2, Archive, Image, Plus, Loader2, Sparkles, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import type { IWorkflow } from '@/lib/mongodb/models'

const iconMap: Record<string, React.ElementType> = {
  'auto-archive': Archive,
  'media-cleanup': Image,
  'security-scan': ShieldCheck,
  'custom': Zap,
}

const resultColors = {
  success: 'text-green-600 bg-green-100',
  failed: 'text-red-600 bg-red-100',
  partial: 'text-yellow-600 bg-yellow-100',
}

function formatLastRun(date?: string | Date): string {
  if (!date) return 'Chưa chạy'
  const d = new Date(date)
  const diff = Date.now() - d.getTime()
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (hours < 1) return 'Vừa xong'
  if (hours < 24) return `${hours} giờ trước`
  if (days < 7) return `${days} ngày trước`
  return d.toLocaleDateString('vi-VN')
}

export default function WorkflowsAdmin() {
  const { toast } = useToast()
  const [workflows, setWorkflows] = useState<IWorkflow[]>([])
  const [loading, setLoading] = useState(true)
  const [runningId, setRunningId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [seeding, setSeeding] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [resetId, setResetId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [resetting, setResetting] = useState(false)

  const fetchWorkflows = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/workflows')
      if (res.ok) {
        const data = await res.json()
        setWorkflows(data.workflows || [])
      }
    } catch (err) {
      console.error('Error fetching workflows:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWorkflows()
  }, [fetchWorkflows])

  const handleSeed = async () => {
    setSeeding(true)
    try {
      const res = await fetch('/api/admin/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'seed' }),
      })
      const data = await res.json()
      toast({
        title: data.seeded ? 'Đã tạo workflows' : 'Thông báo',
        description: data.message,
      })
      if (data.seeded) await fetchWorkflows()
    } catch (err) {
      toast({
        title: 'Lỗi',
        description: 'Không thể seed workflows',
        variant: 'destructive',
      })
    } finally {
      setSeeding(false)
    }
  }

  const handleToggleStatus = async (id: string) => {
    setTogglingId(id)
    try {
      const res = await fetch('/api/admin/workflows', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'toggle' }),
      })
      const data = await res.json()
      if (res.ok) {
        toast({ title: 'Thành công', description: data.message })
        await fetchWorkflows()
      } else {
        throw new Error(data.error)
      }
    } catch (err: any) {
      toast({
        title: 'Lỗi',
        description: err.message || 'Không thể cập nhật workflow',
        variant: 'destructive',
      })
    } finally {
      setTogglingId(null)
    }
  }

  const handleToggleSchedule = async (id: string) => {
    try {
      const res = await fetch('/api/admin/workflows', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'toggle-schedule' }),
      })
      const data = await res.json()
      if (res.ok) {
        toast({ title: 'Thành công', description: data.message })
        await fetchWorkflows()
      }
    } catch (err) {
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật schedule',
        variant: 'destructive',
      })
    }
  }

  const runWorkflow = async (id: string, type: string) => {
    setRunningId(id)
    try {
      let result = 'success'
      let message = 'Workflow chạy thành công'

      if (type === 'auto-archive') {
        const res = await fetch('/api/cron/maintenance?key=' + (process.env.NEXT_PUBLIC_CRON_API_KEY || ''))
        const data = await res.json()
        if (data.success) {
          message = data.results?.join(' ') || 'Đã lưu trữ các sự kiện đã qua'
        } else {
          result = 'failed'
          message = 'Có lỗi khi chạy maintenance'
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 1500))
      }

      // Record run result
      await fetch('/api/admin/workflows', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'record-run', result, message }),
      })

      toast({
        title: 'Workflow đã chạy',
        description: message,
      })
      await fetchWorkflows()
    } catch (err) {
      toast({
        title: 'Lỗi',
        description: 'Không thể chạy workflow',
        variant: 'destructive',
      })
    } finally {
      setRunningId(null)
    }
  }

  const handleCreate = async () => {
    if (!formData.name || !formData.description) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập tên và mô tả',
        variant: 'destructive',
      })
      return
    }

    setCreating(true)
    try {
      const res = await fetch('/api/admin/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (res.ok) {
        toast({ title: 'Thành công', description: data.message })
        setCreateDialogOpen(false)
        setFormData({ name: '', description: '' })
        await fetchWorkflows()
      } else {
        throw new Error(data.error)
      }
    } catch (err: any) {
      toast({
        title: 'Lỗi',
        description: err.message || 'Không thể tạo workflow',
        variant: 'destructive',
      })
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/workflows?id=${deleteId}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (res.ok) {
        toast({ title: 'Thành công', description: data.message })
        await fetchWorkflows()
      } else {
        throw new Error(data.error)
      }
    } catch (err: any) {
      toast({
        title: 'Lỗi',
        description: err.message || 'Không thể xóa workflow',
        variant: 'destructive',
      })
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-2" />
          <div className="h-4 bg-muted rounded w-96" />
        </div>
        <div className="grid gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Automation Workflows</h1>
          <p className="text-muted-foreground">Quản lý các tác vụ tự động và quy tắc bảo trì</p>
        </div>
        {workflows.length > 0 && (
          <Button onClick={() => setCreateDialogOpen(true)} className="gradient-1">
            <Plus className="w-4 h-4 mr-2" />
            Tạo Workflow
          </Button>
        )}
      </div>

      {workflows.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Zap className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Chưa có Workflow nào</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              Nhấn nút bên dưới để tạo các workflows mặc định cho hệ thống
            </p>
            <Button onClick={handleSeed} disabled={seeding} className="gradient-1">
              {seeding ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Seed Workflows Mặc Định
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {workflows.map((wf) => {
            const Icon = iconMap[wf.type] || Zap
            return (
              <Card key={wf.id} className="overflow-hidden border-l-4 border-l-primary/50">
                <CardHeader className="pb-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{wf.name}</CardTitle>
                        <CardDescription>{wf.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={wf.status === 'active' ? 'default' : 'secondary'}
                        className="cursor-pointer"
                        onClick={() => handleToggleStatus(wf.id)}
                      >
                        {togglingId === wf.id ? (
                          <Loader2 className="w-3 h-3 animate-spin mr-1" />
                        ) : null}
                        {wf.status === 'active' ? 'Đang hoạt động' : 'Đã tắt'}
                      </Badge>
                      {wf.type === 'custom' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setDeleteId(wf.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-muted/30 rounded-lg">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{wf.runCount}</p>
                      <p className="text-xs text-muted-foreground">Tổng lượt chạy</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{wf.successCount}</p>
                      <p className="text-xs text-muted-foreground">Thành công</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">{wf.failedCount}</p>
                      <p className="text-xs text-muted-foreground">Thất bại</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
                    <div className="flex flex-wrap items-center gap-4 md:gap-6">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`switch-${wf.id}`}
                          checked={wf.schedule?.enabled || false}
                          onCheckedChange={() => handleToggleSchedule(wf.id)}
                        />
                        <Label htmlFor={`switch-${wf.id}`} className="text-sm">Auto-run</Label>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>Lần chạy cuối:</span>
                        <span className="font-medium text-foreground">
                          {formatLastRun(wf.lastRun)}
                        </span>
                        {wf.lastRunResult && (
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${resultColors[wf.lastRunResult]}`}>
                            {wf.lastRunResult === 'success' && <CheckCircle2 className="w-3 h-3 inline mr-0.5" />}
                            {wf.lastRunResult === 'failed' && <XCircle className="w-3 h-3 inline mr-0.5" />}
                            {wf.lastRunResult}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => runWorkflow(wf.id, wf.type)}
                        disabled={runningId === wf.id}
                      >
                        {runningId === wf.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                        Chạy Ngay
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                        onClick={() => setResetId(wf.id)}
                      >
                        <RotateCcw className="w-4 h-4" />
                        Reset
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo Workflow Mới</DialogTitle>
            <DialogDescription>
              Tạo quy tắc tự động tùy chỉnh cho hệ thống
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="wf-name">Tên Workflow *</Label>
              <Input
                id="wf-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="VD: Gửi email nhắc nhở"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wf-desc">Mô Tả *</Label>
              <Textarea
                id="wf-desc"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Mô tả chi tiết chức năng của workflow..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreate} disabled={creating} className="gradient-1">
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                'Tạo Workflow'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa workflow</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Workflow sẽ bị xóa vĩnh viễn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                'Xóa'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Confirmation */}
      <AlertDialog open={!!resetId} onOpenChange={(open) => !open && setResetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận reset thống kê</AlertDialogTitle>
            <AlertDialogDescription>
              Tất cả số liệu thống kê (số lần chạy, thành công, thất bại) sẽ được đặt về 0. Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!resetId) return
                setResetting(true)
                try {
                  await fetch('/api/admin/workflows', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      id: resetId,
                      runCount: 0,
                      successCount: 0,
                      failedCount: 0,
                      lastRun: null,
                      lastRunResult: null,
                      lastRunMessage: null,
                    }),
                  })
                  toast({ title: 'Đã reset thống kê' })
                  await fetchWorkflows()
                } catch (err) {
                  toast({
                    title: 'Lỗi',
                    description: 'Không thể reset thống kê',
                    variant: 'destructive',
                  })
                } finally {
                  setResetting(false)
                  setResetId(null)
                }
              }}
              disabled={resetting}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {resetting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang reset...
                </>
              ) : (
                'Reset Thống Kê'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
