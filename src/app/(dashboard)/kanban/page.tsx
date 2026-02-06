'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Plus,
    MoreHorizontal,
    Bot,
    Clock,
    AlertCircle,
    CheckCircle2,
    Circle,
    Zap,
    Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useTickets, Ticket } from '@/hooks/use-tickets'

type TicketStatus = 'backlog' | 'active' | 'review' | 'done'
type TicketPriority = 'low' | 'medium' | 'high' | 'critical'
type TicketAgentMode = 'manual' | 'assisted' | 'autonomous'

const columns = [
    { id: 'backlog', title: 'Backlog', icon: Circle, color: 'text-muted-foreground' },
    { id: 'active', title: 'Active', icon: Clock, color: 'text-sky-500' },
    { id: 'review', title: 'Review', icon: AlertCircle, color: 'text-amber-500' },
    { id: 'done', title: 'Done', icon: CheckCircle2, color: 'text-emerald-500' },
]

const priorityColors: Record<string, string> = {
    low: 'bg-slate-500/20 text-slate-400',
    medium: 'bg-sky-500/20 text-sky-400',
    high: 'bg-amber-500/20 text-amber-400',
    critical: 'bg-red-500/20 text-red-400',
}

const agentModeColors: Record<string, string> = {
    manual: 'text-muted-foreground',
    assisted: 'text-sky-500',
    autonomous: 'text-primary',
}

export default function KanbanPage() {
    const { tickets, loading, createTicket, updateTicket, deleteTicket } = useTickets()
    const { toast } = useToast()
    const [draggedTicket, setDraggedTicket] = useState<Ticket | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const [newTicket, setNewTicket] = useState<{
        title: string
        priority: TicketPriority
        agent_mode: TicketAgentMode
    }>({
        title: '',
        priority: 'medium',
        agent_mode: 'manual',
    })

    const handleDragStart = (ticket: Ticket) => {
        setDraggedTicket(ticket)
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
    }

    const handleDrop = async (targetStatus: TicketStatus) => {
        if (!draggedTicket || draggedTicket.status === targetStatus) {
            setDraggedTicket(null)
            return
        }

        try {
            await updateTicket(draggedTicket.id, { status: targetStatus })
            toast({
                title: 'Ticket moved',
                description: `"${draggedTicket.title}" moved to ${targetStatus}`,
            })
        } catch {
            toast({
                title: 'Error',
                description: 'Failed to move ticket',
                variant: 'destructive',
            })
        }
        setDraggedTicket(null)
    }

    const handleCreate = async () => {
        if (!newTicket.title.trim()) return

        setIsCreating(true)
        try {
            await createTicket({
                title: newTicket.title,
                priority: newTicket.priority,
                agent_mode: newTicket.agent_mode,
                status: 'backlog',
            })
            setIsDialogOpen(false)
            setNewTicket({ title: '', priority: 'medium', agent_mode: 'manual' })
            toast({
                title: 'Ticket created',
                description: 'Added to backlog',
            })
        } catch {
            toast({
                title: 'Error',
                description: 'Failed to create ticket',
                variant: 'destructive',
            })
        } finally {
            setIsCreating(false)
        }
    }

    const handleDelete = async (ticket: Ticket) => {
        try {
            await deleteTicket(ticket.id)
            toast({
                title: 'Ticket deleted',
                description: `"${ticket.title}" has been removed`,
            })
        } catch {
            toast({
                title: 'Error',
                description: 'Failed to delete ticket',
                variant: 'destructive',
            })
        }
    }

    const cycleAgentMode = async (ticket: Ticket) => {
        const modes: TicketAgentMode[] = ['manual', 'assisted', 'autonomous']
        const currentIndex = modes.indexOf(ticket.agent_mode)
        const nextMode = modes[(currentIndex + 1) % modes.length]

        try {
            await updateTicket(ticket.id, { agent_mode: nextMode })
            toast({
                title: 'Agent mode changed',
                description: `Now: ${nextMode}`,
            })
        } catch {
            toast({
                title: 'Error',
                description: 'Failed to update agent mode',
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
            className="h-full"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Hybrid Kanban</h1>
                    <p className="text-muted-foreground">
                        Drag to move • Click mode icon to cycle agent mode
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <Button onClick={() => setIsDialogOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        New Ticket
                    </Button>
                    <DialogContent className="bg-card border-border">
                        <DialogHeader>
                            <DialogTitle>Create New Ticket</DialogTitle>
                            <DialogDescription>
                                Add a new task to the kanban board
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input
                                    value={newTicket.title}
                                    onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                                    placeholder="What needs to be done?"
                                    className="bg-secondary border-border"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Priority</Label>
                                    <Select
                                        value={newTicket.priority}
                                        onValueChange={(v) => setNewTicket({ ...newTicket, priority: v as TicketPriority })}
                                    >
                                        <SelectTrigger className="bg-secondary border-border">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="critical">Critical</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Agent Mode</Label>
                                    <Select
                                        value={newTicket.agent_mode}
                                        onValueChange={(v) => setNewTicket({ ...newTicket, agent_mode: v as TicketAgentMode })}
                                    >
                                        <SelectTrigger className="bg-secondary border-border">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="manual">Manual</SelectItem>
                                            <SelectItem value="assisted">Assisted</SelectItem>
                                            <SelectItem value="autonomous">Autonomous</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreate} disabled={!newTicket.title.trim() || isCreating}>
                                {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Create
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Kanban Board */}
            <div className="grid grid-cols-4 gap-4 h-[calc(100vh-12rem)]">
                {columns.map((column) => {
                    const columnTickets = tickets.filter((t) => t.status === column.id)
                    const Icon = column.icon

                    return (
                        <div
                            key={column.id}
                            className="flex flex-col bg-secondary/30 rounded-xl border border-border"
                            onDragOver={handleDragOver}
                            onDrop={() => handleDrop(column.id as TicketStatus)}
                        >
                            {/* Column Header */}
                            <div className="flex items-center gap-2 p-4 border-b border-border">
                                <Icon className={`w-4 h-4 ${column.color}`} />
                                <span className="font-medium">{column.title}</span>
                                <Badge variant="secondary" className="ml-auto">
                                    {columnTickets.length}
                                </Badge>
                            </div>

                            {/* Cards */}
                            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                                <AnimatePresence>
                                    {columnTickets.map((ticket) => (
                                        <motion.div
                                            key={ticket.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            draggable
                                            onDragStart={() => handleDragStart(ticket)}
                                            className={`bg-card border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing
                                                ${draggedTicket?.id === ticket.id ? 'opacity-50' : ''}`}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="text-sm font-medium leading-tight flex-1">
                                                    {ticket.title}
                                                </p>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6">
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => cycleAgentMode(ticket)}>
                                                            Change Agent Mode
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-destructive"
                                                            onClick={() => handleDelete(ticket)}
                                                        >
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                            <div className="flex items-center gap-2 mt-2">
                                                <Badge className={priorityColors[ticket.priority]}>
                                                    {ticket.priority}
                                                </Badge>
                                                <button
                                                    onClick={() => cycleAgentMode(ticket)}
                                                    className={`flex items-center gap-1 text-xs ${agentModeColors[ticket.agent_mode]}`}
                                                >
                                                    {ticket.agent_mode === 'autonomous' && <Zap className="w-3 h-3" />}
                                                    {ticket.agent_mode === 'assisted' && <Bot className="w-3 h-3" />}
                                                    {ticket.agent_mode}
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    )
                })}
            </div>
        </motion.div>
    )
}
