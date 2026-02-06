'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
    Activity,
    Zap,
    MessageSquare,
    ArrowUpRight,
    Loader2,
    TrendingUp,
    CircleDot,
    AlertTriangle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useDashboardStats } from '@/hooks/use-dashboard-stats'
import { useTickets } from '@/hooks/use-tickets'
import { useBotHeartbeat } from '@/hooks/use-bot-heartbeat'

const statusColors = {
    backlog: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    active: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
    review: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    done: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
}

const priorityColors = {
    low: 'text-slate-400',
    medium: 'text-sky-400',
    high: 'text-amber-400',
    critical: 'text-red-400',
}

export default function MissionControlPage() {
    const { stats, loading: statsLoading } = useDashboardStats()
    const { tickets, loading: ticketsLoading } = useTickets()
    const { isOnline, heartbeat, loading: heartbeatLoading } = useBotHeartbeat()

    const loading = statsLoading || ticketsLoading || heartbeatLoading
    const recentTickets = tickets.slice(0, 5)

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
                    <h1 className="text-3xl font-bold tracking-tight">Mission Control</h1>
                    <p className="text-muted-foreground mt-1">
                        ARCHOS System Overview
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Real Klaus Status from bot_heartbeat */}
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${isOnline
                            ? 'bg-emerald-500/10 border-emerald-500/30'
                            : 'bg-red-500/10 border-red-500/30'
                        }`}>
                        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                            }`} />
                        <span className={`text-sm font-medium ${isOnline ? 'text-emerald-400' : 'text-red-400'
                            }`}>
                            Klaus {isOnline ? 'Online' : 'Offline'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Offline Warning */}
            {!isOnline && (
                <Card className="bg-red-500/5 border-red-500/20">
                    <CardContent className="flex items-center gap-3 p-4">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        <div className="flex-1">
                            <h3 className="font-medium text-red-500">Klaus is Offline</h3>
                            <p className="text-sm text-muted-foreground">
                                No heartbeat received in the last 2 minutes.
                                {heartbeat?.last_beat && (
                                    <> Last seen: {new Date(heartbeat.last_beat).toLocaleString()}</>
                                )}
                            </p>
                        </div>
                        <Button variant="outline" size="sm" className="border-red-500/30 text-red-400">
                            Diagnose
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Active Tickets */}
                <Card className="bg-card border-border">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Active Tickets</p>
                                <p className="text-3xl font-bold mt-1">{stats.ticketsByStatus.active}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {stats.ticketsByStatus.backlog} in backlog
                                </p>
                            </div>
                            <div className="p-3 rounded-full bg-sky-500/10">
                                <Activity className="w-6 h-6 text-sky-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Autonomous Tasks */}
                <Card className="bg-card border-border">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Autonomous Tasks</p>
                                <p className="text-3xl font-bold mt-1">{stats.autonomousTickets}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Running on autopilot
                                </p>
                            </div>
                            <div className="p-3 rounded-full bg-primary/10">
                                <Zap className="w-6 h-6 text-primary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Skills Active */}
                <Card className="bg-card border-border">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Skills Active</p>
                                <p className="text-3xl font-bold mt-1">{stats.activeSkills}/{stats.totalSkills}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Capabilities enabled
                                </p>
                            </div>
                            <div className="p-3 rounded-full bg-emerald-500/10">
                                <TrendingUp className="w-6 h-6 text-emerald-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Messages (24h) */}
                <Card className="bg-card border-border">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Messages (24h)</p>
                                <p className="text-3xl font-bold mt-1">{stats.recentMessages}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Across all channels
                                </p>
                            </div>
                            <div className="p-3 rounded-full bg-purple-500/10">
                                <MessageSquare className="w-6 h-6 text-purple-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Ticket Distribution & Recent */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Status Distribution */}
                <Card className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">Ticket Distribution</CardTitle>
                        <Link href="/kanban">
                            <Button variant="ghost" size="sm" className="gap-1">
                                View All <ArrowUpRight className="w-4 h-4" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {(['backlog', 'active', 'review', 'done'] as const).map((status) => {
                                const count = stats.ticketsByStatus[status]
                                const total = Object.values(stats.ticketsByStatus).reduce((a, b) => a + b, 0)
                                const percentage = total > 0 ? (count / total) * 100 : 0

                                return (
                                    <div key={status} className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="capitalize">{status}</span>
                                            <span className="text-muted-foreground">{count}</span>
                                        </div>
                                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                transition={{ duration: 0.5, ease: 'easeOut' }}
                                                className={`h-full ${status === 'backlog' ? 'bg-slate-500' :
                                                        status === 'active' ? 'bg-sky-500' :
                                                            status === 'review' ? 'bg-amber-500' :
                                                                'bg-emerald-500'
                                                    }`}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Tickets */}
                <Card className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">Recent Tickets</CardTitle>
                        <Link href="/kanban">
                            <Button variant="ghost" size="sm" className="gap-1">
                                Kanban <ArrowUpRight className="w-4 h-4" />
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {recentTickets.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <CircleDot className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                <p>No tickets yet</p>
                                <Link href="/kanban">
                                    <Button variant="link" size="sm" className="mt-2">
                                        Create your first ticket
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentTickets.map((ticket) => (
                                    <div
                                        key={ticket.id}
                                        className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                                    >
                                        <div className={`w-1.5 h-8 rounded-full ${ticket.priority === 'critical' ? 'bg-red-500' :
                                                ticket.priority === 'high' ? 'bg-amber-500' :
                                                    ticket.priority === 'medium' ? 'bg-sky-500' :
                                                        'bg-slate-500'
                                            }`} />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium truncate">{ticket.title}</h4>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <Badge variant="outline" className={statusColors[ticket.status]}>
                                                    {ticket.status}
                                                </Badge>
                                                {ticket.agent_mode === 'autonomous' && (
                                                    <Badge className="bg-primary/10 text-primary text-[10px]">
                                                        <Zap className="w-3 h-3 mr-0.5" />
                                                        AUTO
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <span className={`text-xs ${priorityColors[ticket.priority]}`}>
                                            {ticket.priority}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Link href="/kanban">
                            <Button variant="outline" className="w-full justify-start gap-2">
                                <Activity className="w-4 h-4" />
                                New Ticket
                            </Button>
                        </Link>
                        <Link href="/chat">
                            <Button variant="outline" className="w-full justify-start gap-2">
                                <MessageSquare className="w-4 h-4" />
                                Chat with Klaus
                            </Button>
                        </Link>
                        <Link href="/klaus/config">
                            <Button variant="outline" className="w-full justify-start gap-2">
                                <Zap className="w-4 h-4" />
                                Configure AI
                            </Button>
                        </Link>
                        <Link href="/crm">
                            <Button variant="outline" className="w-full justify-start gap-2">
                                <TrendingUp className="w-4 h-4" />
                                View CRM
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
