'use client'

import { useState, useEffect } from 'react'
import type { Theme } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Check, Palette, Sparkles, AlertCircle, Edit2, ChevronLeft } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import ThemeEditor from './theme-editor'
import { ITheme } from '@/lib/mongodb/models/Theme'

export function ThemeManagement() {
  const [themes, setThemes] = useState<Theme[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSeeding, setIsSeeding] = useState(false)
  const [isActivating, setIsActivating] = useState<string | null>(null)
  const [isFixing, setIsFixing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [editingTheme, setEditingTheme] = useState<ITheme | null>(null)

  useEffect(() => {
    fetchThemes()
  }, [])

  const fetchThemes = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/admin/themes')
      if (!response.ok) throw new Error('Failed to fetch themes')
      const data = await response.json()
      setThemes(data.themes || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSeedThemes = async () => {
    setIsSeeding(true)
    setError(null)
    setSuccessMessage(null)
    try {
      const response = await fetch('/api/admin/themes/seed', {
        method: 'POST',
      })
      if (!response.ok) throw new Error('Failed to seed themes')
      const data = await response.json()
      setSuccessMessage(data.message)
      await fetchThemes()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSeeding(false)
    }
  }

  const handleActivateTheme = async (themeId: string) => {
    setIsActivating(themeId)
    setError(null)
    setSuccessMessage(null)
    try {
      const response = await fetch('/api/admin/themes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: themeId, action: 'activate' }),
      })
      if (!response.ok) throw new Error('Failed to activate theme')
      setSuccessMessage('Theme đã được kích hoạt thành công!')
      await fetchThemes()
      // Reload page to apply new theme
      setTimeout(() => window.location.reload(), 1000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsActivating(null)
    }
  }

  const handleFixDatabase = async () => {
    setIsFixing(true)
    setError(null)
    setSuccessMessage(null)
    try {
      const response = await fetch('/api/admin/themes/fix', {
        method: 'POST',
      })
      if (!response.ok) throw new Error('Failed to fix database')
      const data = await response.json()
      setSuccessMessage(data.message)
      await fetchThemes()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsFixing(false)
    }
  }

  const getGradientStyle = (colors: string[]) => {
    if (colors.length === 0) return {}
    return {
      background: `linear-gradient(135deg, ${colors.join(', ')})`
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (editingTheme) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setEditingTheme(null)}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách
          </Button>
          <h2 className="text-2xl font-bold">Chỉnh sửa: {editingTheme.displayName}</h2>
        </div>
        <ThemeEditor initialTheme={editingTheme} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Quản Lý Theme
              </CardTitle>
              <CardDescription>
                Quản lý và kích hoạt theme cho toàn bộ hệ thống
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleFixDatabase}
                disabled={isFixing}
                variant="outline"
                size="sm"
              >
                {isFixing ? 'Đang fix...' : 'Fix DB'}
              </Button>
              <Button
                onClick={handleSeedThemes}
                disabled={isSeeding}
                variant="outline"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {isSeeding ? 'Đang tải...' : 'Seed Themes'}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert>
              <Check className="h-4 w-4" />
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          {/* Warning if multiple themes are active */}
          {themes.filter(t => t.isActive).length > 1 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Cảnh báo:</strong> Phát hiện {themes.filter(t => t.isActive).length} themes đang active cùng lúc!
                Điều này gây lỗi hệ thống. Nhấn nút <strong>&quot;Fix DB&quot;</strong> để khắc phục.
              </AlertDescription>
            </Alert>
          )}

          {themes.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-6">
                <Palette className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-bold mb-2">Chưa Có Theme Nào</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Hệ thống chưa có theme nào. Nhấn nút <strong>&quot;Seed Themes&quot;</strong> ở góc trên bên phải để tạo 2 themes mặc định:
                </p>
                <div className="max-w-md mx-auto text-left bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-xl">🎨</span>
                    <div>
                      <p className="font-semibold">Theme Mặc Định</p>
                      <p className="text-sm text-muted-foreground">Theme chuẩn của hệ thống (xanh tím)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-xl">🌸</span>
                    <div>
                      <p className="font-semibold">Theme 20/10</p>
                      <p className="text-sm text-muted-foreground">Ngày Phụ Nữ Việt Nam (hồng lavender)</p>
                    </div>
                  </div>
                </div>
              </div>
              <Button
                onClick={handleSeedThemes}
                disabled={isSeeding}
                size="lg"
                className="mx-auto"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                {isSeeding ? 'Đang Tạo Themes...' : 'Seed Themes Ngay'}
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {themes.map((theme) => (
                <Card
                  key={theme.id}
                  className={`relative overflow-hidden transition-all hover:shadow-lg ${theme.isActive ? 'ring-2 ring-primary' : ''
                    }`}
                >
                  {/* Hero gradient preview */}
                  <div
                    className="h-24 relative"
                    style={getGradientStyle(theme.gradients.hero)}
                  >
                    {theme.isActive && (
                      <Badge className="absolute top-2 right-2 bg-white text-primary">
                        <Check className="h-3 w-3 mr-1" />
                        Đang Dùng
                      </Badge>
                    )}
                  </div>

                  <CardContent className="p-4 space-y-3">
                    <div>
                      <h3 className="font-bold text-lg">{theme.displayName}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {theme.description}
                      </p>
                    </div>

                    {/* Color palette preview */}
                    <div className="flex gap-1">
                      <div
                        className="h-8 flex-1 rounded border"
                        style={{ background: theme.colors.primary }}
                        title="Primary"
                      />
                      <div
                        className="h-8 flex-1 rounded border"
                        style={{ background: theme.colors.secondary }}
                        title="Secondary"
                      />
                      <div
                        className="h-8 flex-1 rounded border"
                        style={{ background: theme.colors.accent }}
                        title="Accent"
                      />
                    </div>

                    {/* Gradient previews */}
                    <div className="space-y-1">
                      <div
                        className="h-6 rounded"
                        style={getGradientStyle(theme.gradients.button)}
                      />
                      <div
                        className="h-6 rounded"
                        style={getGradientStyle(theme.gradients.card)}
                      />
                    </div>

                    <div className="flex gap-2">
                      {!theme.isActive && (
                        <Button
                          className="flex-1"
                          onClick={() => handleActivateTheme(theme.id)}
                          disabled={isActivating === theme.id}
                        >
                          {isActivating === theme.id ? 'Đang kích hoạt...' : 'Kích Hoạt'}
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        className={theme.isActive ? 'w-full' : ''}
                        onClick={() => setEditingTheme(theme as unknown as ITheme)}
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Chỉnh sửa
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
