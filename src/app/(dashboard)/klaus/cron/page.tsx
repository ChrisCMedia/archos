'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, Plus, Trash2, Play, Pause, Loader2, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useBotCron, CronJob } from '@/hooks/use-bot-cron'

export default function CronPage() {
    const { cronJobs, loading, createCronJob, toggleCronJob, deleteCronJob } = useBotCron()
    const { toast } = useToast()
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const [newJob, setNewJob] = useState({ schedule: '0 9 * * *', command: '' })
    const [processingId, setProcessingId] = useState<string | null>(null)

    const activeCount = cronJobs.filter(j => j.active).length

    const handleCreate = async () => {
        if (!newJob.command.trim()) return
        setIsCreating(true)
        try {
            await createCronJob({ schedule: newJob.schedule, command: newJob.command, active: true })
            setIsCreateOpen(false)
            setNewJob({ schedule: '0 9 * * *', command: '' })
            toast({ title: 'Cron job created' })
        } catch { toast({ title: 'Error', variant: 'destructive' }) }
        finally { setIsCreating(false) }
    }

    const handleToggle = async (job: CronJob, active: boolean) => {
        setProcessingId(job.id)
        try {
            await toggleCronJob(job.id, active)
            toast({ title: active ? 'Job enabled' : 'Job paused' })
        } catch { toast({ title: 'Error', variant: 'destructive' }) }
        finally { setProcessingId(null) }
    }

    const handleDelete = async (job: CronJob) => {
        try {
            await deleteCronJob(job.id)
            toast({ title: 'Job deleted' })
        } catch { toast({ title: 'Error', variant: 'destructive' }) }
    }

    const parseCron = (schedule: string) => {
        const parts = schedule.split(' ')
        if (parts[0] === '0' && parts[1] !== '*') return `Daily at ${parts[1]}:00`
        if (parts.includes('*/15')) return 'Every 15 minutes'
        if (parts[4] === '0') return 'Weekly on Sunday'
        return schedule
    }

    if (loading) return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20">
                        <Clock className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Cron Jobs</h1>
                        <p className="text-muted-foreground">Scheduled automation tasks</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="outline">{activeCount} active</Badge>
                    <Button onClick={() => setIsCreateOpen(true)}><Plus className="w-4 h-4 mr-2" />New Job</Button>
                </div>
            </div>

            <div className="space-y-3">
                {cronJobs.map(job => (
                    <Card key={job.id} className={`bg-card border-border ${job.active ? 'ring-1 ring-primary/30' : ''}`}>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-lg ${job.active ? 'bg-primary/10' : 'bg-secondary'}`}>
                                        <Calendar className={`w-5 h-5 ${job.active ? 'text-primary' : 'text-muted-foreground'}`} />
                                    </div>
                                    <div>
                                        <p className="font-medium font-mono">{job.command}</p>
                                        <p className="text-sm text-muted-foreground">{parseCron(job.schedule)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge variant={job.active ? 'default' : 'secondary'}>
                                        {job.active ? <Play className="w-3 h-3 mr-1" /> : <Pause className="w-3 h-3 mr-1" />}
                                        {job.active ? 'Active' : 'Paused'}
                                    </Badge>
                                    {processingId === job.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Switch checked={job.active} onCheckedChange={(checked) => handleToggle(job, checked)} />
                                    )}
                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(job)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {cronJobs.length === 0 && <div className="text-center py-12"><Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" /><h3 className="text-lg font-medium mb-2">No cron jobs</h3><p className="text-muted-foreground text-sm">Create your first scheduled task</p></div>}

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="bg-card border-border"><DialogHeader><DialogTitle>New Cron Job</DialogTitle><DialogDescription>Create a scheduled task</DialogDescription></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2"><Label>Schedule (cron expression)</Label><Input value={newJob.schedule} onChange={(e) => setNewJob({ ...newJob, schedule: e.target.value })} placeholder="0 9 * * *" className="bg-secondary border-border font-mono" /></div>
                        <div className="space-y-2"><Label>Command</Label><Input value={newJob.command} onChange={(e) => setNewJob({ ...newJob, command: e.target.value })} placeholder="e.g. generate_report" className="bg-secondary border-border" /></div>
                    </div>
                    <DialogFooter><Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button><Button onClick={handleCreate} disabled={!newJob.command.trim() || isCreating}>{isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Create</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    )
}
