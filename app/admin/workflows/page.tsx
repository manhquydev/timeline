'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Play, RotateCcw, ShieldCheck, Zap, Trash2, Archive } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function WorkflowsAdmin() {
    const { toast } = useToast()
    const [loading, setLoading] = useState<string | null>(null)

    const workflows = [
        {
            id: 'auto-archive',
            name: 'Auto-Archive Past Events',
            description: 'Automatically set event status to "completed" after the end date passes.',
            status: 'active',
            icon: Archive,
            lastRun: '2 hours ago'
        },
        {
            id: 'media-cleanup',
            name: 'Orphaned Media Pruning',
            description: 'Identify and remove files in storage that are no longer linked to any post.',
            status: 'active',
            icon: Trash2,
            lastRun: '1 day ago'
        },
        {
            id: 'security-scan',
            name: 'Security Audit Scanner',
            description: 'Scan audit logs for suspicious login patterns and alert administrators.',
            status: 'disabled',
            icon: ShieldCheck,
            lastRun: 'N/A'
        }
    ]

    const runWorkflow = async (id: string) => {
        setLoading(id)
        try {
            // Simulate API call to cron endpoint
            if (id === 'auto-archive') {
                const res = await fetch('/api/cron/maintenance?key=' + process.env.NEXT_PUBLIC_CRON_API_KEY)
                const data = await res.json()
                if (data.success) {
                    toast({
                        title: 'Workflow Executed',
                        description: data.results?.join(' ') || 'Successfully archived past events.',
                    })
                }
            } else {
                await new Promise(resolve => setTimeout(resolve, 1500))
                toast({
                    title: 'Workflow Started',
                    description: `The ${id} workflow has been triggered manually.`,
                })
            }
        } catch (err) {
            toast({
                title: 'Execution Failed',
                description: 'Could not trigger the workflow. Check console for details.',
                variant: 'destructive'
            })
        } finally {
            setLoading(null)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Automation Workflows</h1>
                <p className="text-muted-foreground">Manage background tasks and automated maintenance rules.</p>
            </div>

            <div className="grid gap-6">
                {workflows.map((wf) => {
                    const Icon = wf.icon
                    return (
                        <Card key={wf.id} className="overflow-hidden border-l-4 border-l-primary/50">
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <Icon className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{wf.name}</CardTitle>
                                            <CardDescription>{wf.description}</CardDescription>
                                        </div>
                                    </div>
                                    <Badge variant={wf.status === 'active' ? 'default' : 'secondary'}>
                                        {wf.status === 'active' ? 'Active' : 'Disabled'}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center space-x-2">
                                            <Switch id={`switch-${wf.id}`} checked={wf.status === 'active'} />
                                            <Label htmlFor={`switch-${wf.id}`}>Enable Auto-run</Label>
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Last run: <span className="font-medium text-foreground">{wf.lastRun}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-2"
                                            onClick={() => runWorkflow(wf.id)}
                                            disabled={loading === wf.id}
                                        >
                                            <Play className="w-4 h-4" />
                                            Run Now
                                        </Button>
                                        <Button variant="ghost" size="sm" className="gap-2">
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

            <Card className="bg-muted/30 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <Zap className="w-12 h-12 text-muted-foreground/30 mb-4" />
                    <h3 className="text-lg font-semibold">Create Custom Workflow</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mb-6">
                        Define new automation rules based on database triggers or scheduled patterns.
                    </p>
                    <Button variant="outline" className="border-dashed">Add New Rule</Button>
                </CardContent>
            </Card>
        </div>
    )
}
