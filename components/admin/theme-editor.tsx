'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Save, RotateCcw, Palette, Type, Sparkles } from 'lucide-react'
import { ITheme } from '@/lib/mongodb/models/Theme'

export default function ThemeEditor({ initialTheme }: { initialTheme: ITheme }) {
    const [theme, setTheme] = useState<ITheme>(initialTheme)
    const [isSaving, setIsSaving] = useState(false)
    const { toast } = useToast()

    // Apply preview to DOM in real-time
    useEffect(() => {
        const root = document.documentElement

        // Colors
        Object.entries(theme.colors).forEach(([key, value]) => {
            const kebabKey = key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
            if (value.startsWith('hsl(')) {
                const hslContent = value.replace(/hsl\((.*)\)/, '$1')
                root.style.setProperty(`--${kebabKey}`, hslContent)
            } else {
                root.style.setProperty(`--${kebabKey}`, value)
            }
        })

        // Typography
        if (theme.typography) {
            root.style.setProperty('--font-sans', theme.typography.fontSans)
            root.style.setProperty('--font-header', theme.typography.fontHeader)
            root.style.setProperty('--radius', theme.typography.borderRadius)
        }

        // Gradients
        const setGradient = (name: string, colors: string[]) => {
            if (colors && colors.length > 0) {
                root.style.setProperty(`--gradient-${name}`, colors.join(', '))
            }
        }
        setGradient('hero', theme.gradients.hero)
        setGradient('card', theme.gradients.card)
        setGradient('button', theme.gradients.button)
        setGradient('accent', theme.gradients.accent)

        // Effects
        root.setAttribute('data-glass-effect', theme.effects.enableGlassEffect ? 'true' : 'false')
    }, [theme])

    const handleColorChange = (key: keyof typeof theme.colors, value: string) => {
        setTheme(prev => ({
            ...prev,
            colors: { ...prev.colors, [key]: value }
        }))
    }

    const handleTypographyChange = (key: keyof typeof theme.typography, value: string) => {
        setTheme(prev => ({
            ...prev,
            typography: { ...prev.typography, [key]: value }
        }))
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const response = await fetch(`/api/admin/themes/${theme.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(theme)
            })

            if (!response.ok) throw new Error('Failed to save theme')

            toast({
                title: 'Success',
                description: 'Theme settings updated successfully.'
            })

            // Notify other components (like ThemeProvider)
            window.dispatchEvent(new CustomEvent('theme-changed'))
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message
            })
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Editor Controls */}
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Palette className="w-5 h-5 text-primary" />
                            Theme Editor
                        </CardTitle>
                        <CardDescription>
                            Customize the look and feel of your platform.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Theme Name</Label>
                                <Input
                                    value={theme.displayName}
                                    onChange={(e) => setTheme(prev => ({ ...prev, displayName: e.target.value }))}
                                />
                            </div>

                            <Tabs defaultValue="colors">
                                <TabsList className="grid grid-cols-3">
                                    <TabsTrigger value="colors"><Palette className="w-4 h-4 mr-2" />Colors</TabsTrigger>
                                    <TabsTrigger value="type"><Type className="w-4 h-4 mr-2" />Type</TabsTrigger>
                                    <TabsTrigger value="fx"><Sparkles className="w-4 h-4 mr-2" />Effects</TabsTrigger>
                                </TabsList>

                                <TabsContent value="colors" className="space-y-4 mt-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Primary</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    type="color"
                                                    className="w-12 p-1"
                                                    value={theme.colors.primary.startsWith('hsl') ? '#7c3aed' : theme.colors.primary}
                                                    onChange={(e) => handleColorChange('primary', e.target.value)}
                                                />
                                                <Input value={theme.colors.primary} onChange={(e) => handleColorChange('primary', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Background</Label>
                                            <Input value={theme.colors.background} onChange={(e) => handleColorChange('background', e.target.value)} />
                                        </div>
                                    </div>
                                    {/* More color inputs... (Simplified for now) */}
                                    <div className="text-xs text-muted-foreground italic">Note: Advanced users can enter HSL values directly.</div>
                                </TabsContent>

                                <TabsContent value="type" className="space-y-4 mt-4">
                                    <div className="space-y-2">
                                        <Label>Sans Font Family</Label>
                                        <Input value={theme.typography.fontSans} onChange={(e) => handleTypographyChange('fontSans', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Border Radius</Label>
                                        <Input value={theme.typography.borderRadius} onChange={(e) => handleTypographyChange('borderRadius', e.target.value)} />
                                    </div>
                                </TabsContent>

                                <TabsContent value="fx" className="space-y-4 mt-4">
                                    <div className="flex items-center justify-between">
                                        <Label>Glassmorphism Effect</Label>
                                        <Switch
                                            checked={theme.effects.enableGlassEffect}
                                            onCheckedChange={(val: boolean) => setTheme(prev => ({
                                                ...prev,
                                                effects: { ...prev.effects, enableGlassEffect: val }
                                            }))}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label>Particle Background</Label>
                                        <Switch
                                            checked={theme.effects.enableParticles}
                                            onCheckedChange={(val: boolean) => setTheme(prev => ({
                                                ...prev,
                                                effects: { ...prev.effects, enableParticles: val }
                                            }))}
                                        />
                                    </div>
                                </TabsContent>
                            </Tabs>

                            <div className="flex gap-2 pt-4">
                                <Button className="flex-1" onClick={handleSave} disabled={isSaving}>
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                    Save Changes
                                </Button>
                                <Button variant="outline" size="icon" onClick={() => setTheme(initialTheme)}>
                                    <RotateCcw className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Real-time Preview */}
            <div className="lg:col-span-2 space-y-6">
                <div className="p-8 border-2 border-dashed rounded-xl bg-background/50 backdrop-blur-sm min-h-[600px] flex flex-col gap-6">
                    <div className="p-6 rounded-lg bg-card text-card-foreground border shadow-sm space-y-4">
                        <h3 className="text-2xl font-bold tracking-tight">Live Component Preview</h3>
                        <p className="text-muted-foreground">Changes you make in the editor will reflect here instantly.</p>
                        <div className="flex flex-wrap gap-4">
                            <Button>Primary Button</Button>
                            <Button variant="secondary">Secondary Button</Button>
                            <Button variant="outline">Outline Button</Button>
                            <Button variant="destructive">Destructive</Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="p-6 rounded-lg bg-primary/10 border border-primary/20 space-y-2">
                            <div className="text-sm font-medium text-primary uppercase tracking-wider">Accent Section</div>
                            <div className="text-xl font-semibold">Vibrant & Modern</div>
                        </div>
                        <div className="p-6 rounded-lg bg-muted border space-y-2">
                            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Muted Section</div>
                            <div className="text-xl font-semibold">Subtle & Clean</div>
                        </div>
                    </div>

                    <div
                        className="flex-1 p-8 rounded-xl flex flex-col items-center justify-center text-center gap-4 border border-white/10"
                        style={{
                            background: `linear-gradient(135deg, ${theme.gradients.hero.join(', ')})`,
                            color: 'white'
                        }}
                    >
                        <h2 className="text-4xl font-black italic uppercase">Hero Section</h2>
                        <p className="max-w-md opacity-90">Experience the power of custom gradients and dynamic typography.</p>
                        <Button size="lg" className="bg-white text-black hover:bg-white/90">Get Started</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
