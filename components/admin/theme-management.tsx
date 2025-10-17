'use client'

import { useState, useEffect } from 'react'
import type { Theme } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Check, Palette, Sparkles, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function ThemeManagement() {
  const [themes, setThemes] = useState<Theme[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSeeding, setIsSeeding] = useState(false)
  const [isActivating, setIsActivating] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

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
            <Button
              onClick={handleSeedThemes}
              disabled={isSeeding}
              variant="outline"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isSeeding ? 'Đang tải...' : 'Seed Themes'}
            </Button>
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

          {themes.length === 0 ? (
            <div className="text-center py-12">
              <Palette className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                Chưa có theme nào. Nhấn &quot;Seed Themes&quot; để tạo theme mặc định.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {themes.map((theme) => (
                <Card
                  key={theme.id}
                  className={`relative overflow-hidden transition-all hover:shadow-lg ${
                    theme.isActive ? 'ring-2 ring-primary' : ''
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

                    {!theme.isActive && (
                      <Button
                        className="w-full"
                        onClick={() => handleActivateTheme(theme.id)}
                        disabled={isActivating === theme.id}
                      >
                        {isActivating === theme.id ? 'Đang kích hoạt...' : 'Kích Hoạt Theme'}
                      </Button>
                    )}
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
