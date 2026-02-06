'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Brain,
    Plus,
    ArrowRight,
    Trash2,
    Lightbulb,
    Loader2,
    Sparkles
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useTickets } from '@/hooks/use-tickets'

export default function BrainDumpPage() {
    const { tickets, loading, createTicket, updateTicket, deleteTicket } = useTickets()
    const { toast } = useToast()
    const [newThought, setNewThought] = useState('')
    const [isAdding, setIsAdding] = useState(false)

    // Filter only backlog items (brain dump)
    const thoughts = tickets.filter(t => t.status === 'backlog')

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newThought.trim()) return

        setIsAdding(true)
        try {
            await createTicket({
                title: newThought.trim(),
                status: 'backlog',
                priority: 'medium',
                agent_mode: 'manual',
            })
            setNewThought('')
            toast({
                title: 'Thought captured',
                description: 'Added to your brain dump.',
            })
        } catch {
            toast({
                title: 'Error',
                description: 'Failed to add thought',
                variant: 'destructive',
            })
        } finally {
            setIsAdding(false)
        }
    }

    const handlePromote = async (id: string, title: string) => {
        try {
            await updateTicket(id, { status: 'active' })
            toast({
                title: 'Promoted to Kanban',
                description: `"${title}" is now active.`,
            })
        } catch {
            toast({
                title: 'Error',
                description: 'Failed to promote',
                variant: 'destructive',
            })
        }
    }

    const handleDelete = async (id: string) => {
        try {
            await deleteTicket(id)
            toast({
                title: 'Deleted',
                description: 'Thought removed.',
            })
        } catch {
            toast({
                title: 'Error',
                description: 'Failed to delete',
                variant: 'destructive',
            })
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
            <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20">
                    <Brain className="w-6 h-6 text-violet-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Brain Dump</h1>
                    <p className="text-muted-foreground">
                        Capture thoughts quickly. Promote them when ready.
                    </p>
                </div>
            </div>

            {/* Quick Add */}
            <Card className="bg-gradient-to-r from-violet-500/5 to-purple-500/5 border-violet-500/20">
                <CardContent className="p-4">
                    <form onSubmit={handleAdd} className="flex gap-3">
                        <div className="relative flex-1">
                            <Lightbulb className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                value={newThought}
                                onChange={(e) => setNewThought(e.target.value)}
                                placeholder="What's on your mind? Type a thought and press Enter..."
                                className="pl-10 bg-background/50 border-violet-500/20 focus:border-violet-500/50"
                                disabled={isAdding}
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={!newThought.trim() || isAdding}
                            className="bg-violet-600 hover:bg-violet-700"
                        >
                            {isAdding ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Capture
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <Badge variant="outline" className="font-normal">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {thoughts.length} thought{thoughts.length !== 1 ? 's' : ''} captured
                </Badge>
            </div>

            {/* Thoughts List */}
            <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                    {thoughts.map((thought, index) => (
                        <motion.div
                            key={thought.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className="group bg-card hover:bg-secondary/30 transition-colors border-border">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                            <div className="w-2 h-2 rounded-full bg-violet-500 mt-2 flex-shrink-0" />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium truncate">
                                                    {thought.title}
                                                </p>
                                                {thought.description && (
                                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                                        {thought.description}
                                                    </p>
                                                )}
                                                <p className="text-[10px] text-muted-foreground/60 mt-1">
                                                    {new Date(thought.created_at).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handlePromote(thought.id, thought.title)}
                                                className="h-8 px-3 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10"
                                            >
                                                <ArrowRight className="w-4 h-4 mr-1" />
                                                Promote
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(thought.id)}
                                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
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

            {/* Empty State */}
            {thoughts.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16"
                >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
                        <Brain className="w-8 h-8 text-violet-400" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Your mind is clear</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                        Start capturing thoughts, ideas, and tasks above.
                    </p>
                </motion.div>
            )}
        </motion.div>
    )
}
