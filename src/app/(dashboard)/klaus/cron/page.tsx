'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Plus,
    Clock,
    Play,
    Pause,
    Trash2,
    Edit2,
    AlertCircle,
    Loader2,
    Check,
    Calendar
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { useToast } from '@/hooks/use-toast'
import { useBotCron } from '@/hooks/use-bot-cron'

const cronExamples = [
    { label: 'Every minute', value: '* * * * *' },
    { label: 'Every 5 minutes', value: '*/5 * * * *' },
    { label: 'Every hour', value: '0 * * * *' },
    { label: 'Daily at 9am', value: '0 9 * * *' },
    { label: 'Weekly (Sunday)', value: '0 0 * * 0' },
    { label: 'Monthly (1st)', value: '0 0 1 * *' },
]

export default function CronPage() {
    const { cronjobs, loading, createCronjob, toggleCronjob, deleteCronjob } = useBotCron()
    const { toast } = useToast()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [jobToDelete, setJobToDelete] = useState<string | null>(null)
    const [isCreating, setIsCreating] = useState(false)
    const [togglingId, setTogglingId] = useState<string | null>(null)
    const [newJob, setNewJob] = useState({
        name: '',
        description: '',
        schedule: '0 9 * * *',
        command: '',
    })

    const handleCreate = async () => {
        if (!newJob.name || !newJob.schedule || !newJob.command) return

        setIsCreating(true)
        try {
            await createCronjob({
                name: newJob.name,
                description: newJob.description || null,
                schedule: newJob.schedule,
                command: newJob.command,
                enabled: true,
            })
            toast({
                title: 'Cronjob created',
                description: `"${newJob.name}" has been scheduled.`,
            })
            setNewJob({ name: '', description: '', schedule: '0 9 * * *', command: '' })
            setIsDialogOpen(false)
        } catch (err) {
            toast({
                title: 'Error',
                description: 'Failed to create cronjob',
                variant: 'destructive',
            })
        } finally {
            setIsCreating(false)
        }
    }

    const handleToggle = async (id: string, enabled: boolean) => {
        setTogglingId(id)
        try {
            await toggleCronjob(id, enabled)
            toast({
                title: enabled ? 'Cronjob enabled' : 'Cronjob disabled',
            })
        } catch (err) {
            toast({
                title: 'Error',
                description: 'Failed to toggle cronjob',
                variant: 'destructive',
            })
        } finally {
            setTogglingId(null)
        }
    }

    const handleDelete = async () => {
        if (!jobToDelete) return
        try {
            await deleteCronjob(jobToDelete)
            toast({ title: 'Cronjob deleted' })
        } catch (err) {
            toast({
                title: 'Error',
                description: 'Failed to delete cronjob',
                variant: 'destructive',
            })
        } finally {
            setDeleteDialogOpen(false)
            setJobToDelete(null)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Cronjobs</h1>
                    <p className="text-muted-foreground mt-1">
                        Scheduled tasks for Klaus to execute
                    </p>
                </div>
                <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Cronjob
                </Button>
            </div>

            {/* Info Card */}
            <Card className="bg-sky-500/5 border-sky-500/20">
                <CardContent className="flex items-start gap-3 p-4">
                    <AlertCircle className="w-5 h-5 text-sky-500 mt-0.5" />
                    <div>
                        <h3 className="font-medium text-sky-500">How it works</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Cronjobs run on a schedule defined by cron expressions. When triggered, Klaus executes the specified command.
                            Jobs only run when Klaus is online.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Cronjob List */}
            <div className="space-y-3">
                <AnimatePresence>
                    {cronjobs.map((job) => (
                        <motion.div
                            key={job.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <Card className={`bg-card border-border ${!job.enabled ? 'opacity-60' : ''}`}>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className={`p-2 rounded-lg ${job.enabled ? 'bg-primary/10' : 'bg-secondary'}`}>
                                                <Clock className={`w-5 h-5 ${job.enabled ? 'text-primary' : 'text-muted-foreground'}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-medium">{job.name}</h3>
                                                    {job.enabled && (
                                                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 text-[10px]">
                                                            Active
                                                        </Badge>
                                                    )}
                                                </div>
                                                {job.description && (
                                                    <p className="text-sm text-muted-foreground mt-0.5">{job.description}</p>
                                                )}
                                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                                    <code className="px-2 py-0.5 bg-secondary rounded">{job.schedule}</code>
                                                    <span>→</span>
                                                    <code className="px-2 py-0.5 bg-secondary rounded">{job.command}</code>
                                                </div>
                                                {job.last_run && (
                                                    <p className="text-xs text-muted-foreground mt-2">
                                                        <Calendar className="w-3 h-3 inline mr-1" />
                                                        Last run: {new Date(job.last_run).toLocaleString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {togglingId === job.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Switch
                                                    checked={job.enabled}
                                                    onCheckedChange={(checked) => handleToggle(job.id, checked)}
                                                />
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => {
                                                    setJobToDelete(job.id)
                                                    setDeleteDialogOpen(true)
                                                }}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {cronjobs.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <h3 className="font-medium mb-2">No scheduled jobs</h3>
                    <p className="text-sm mb-4">
                        Create a cronjob to automate recurring tasks
                    </p>
                    <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Cronjob
                    </Button>
                </div>
            )}

            {/* Create Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-card border-border">
                    <DialogHeader>
                        <DialogTitle>New Cronjob</DialogTitle>
                        <DialogDescription>
                            Schedule a recurring task for Klaus
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Name *</Label>
                            <Input
                                value={newJob.name}
                                onChange={(e) => setNewJob({ ...newJob, name: e.target.value })}
                                placeholder="Daily Report"
                                className="bg-secondary border-border"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                value={newJob.description}
                                onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                                placeholder="What does this job do?"
                                className="bg-secondary border-border"
                                rows={2}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Schedule (Cron Expression) *</Label>
                            <Input
                                value={newJob.schedule}
                                onChange={(e) => setNewJob({ ...newJob, schedule: e.target.value })}
                                placeholder="0 9 * * *"
                                className="bg-secondary border-border font-mono"
                            />
                            <div className="flex flex-wrap gap-2 mt-2">
                                {cronExamples.map((ex) => (
                                    <Button
                                        key={ex.value}
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="text-xs"
                                        onClick={() => setNewJob({ ...newJob, schedule: ex.value })}
                                    >
                                        {ex.label}
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Command *</Label>
                            <Input
                                value={newJob.command}
                                onChange={(e) => setNewJob({ ...newJob, command: e.target.value })}
                                placeholder="generate_report"
                                className="bg-secondary border-border font-mono"
                            />
                            <p className="text-xs text-muted-foreground">
                                The command Klaus will execute when triggered
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreate}
                            disabled={!newJob.name || !newJob.schedule || !newJob.command || isCreating}
                        >
                            {isCreating ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Check className="w-4 h-4 mr-2" />
                            )}
                            Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="bg-card border-border">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Cronjob</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove this scheduled task. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </motion.div>
    )
}
