'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Bot, Ticket, Users, BookOpen, Brain, Sparkles, Loader2, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useDashboardStats } from '@/hooks/use-dashboard-stats'
import { useBotHeartbeat } from '@/hooks/use-bot-heartbeat'

export default function DashboardPage() {
    const { stats, loading } = useDashboardStats()
    const { heartbeat, isOnline, getTimeSinceLastBeat } = useBotHeartbeat()

    if (loading) return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>

    const cards = [
        { title: 'Active Tickets', value: stats.activeTickets, total: stats.totalTickets, icon: Ticket, color: 'from-sky-500/20 to-blue-500/20', iconColor: 'text-sky-400', href: '/kanban' },
        { title: 'Active Clients', value: stats.activeClients, total: stats.totalClients, icon: Users, color: 'from-emerald-500/20 to-teal-500/20', iconColor: 'text-emerald-400', href: '/crm' },
        { title: 'Brain Dump', value: stats.totalTickets - stats.activeTickets - stats.completedTickets, icon: Brain, color: 'from-violet-500/20 to-purple-500/20', iconColor: 'text-violet-400', href: '/brain-dump' },
        { title: 'Knowledge', value: stats.knowledgeEntries, icon: BookOpen, color: 'from-amber-500/20 to-orange-500/20', iconColor: 'text-amber-400', href: '/knowledge' },
    ]

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">ARCHOS</h1>
                    <p className="text-muted-foreground">Your personal command center</p>
                </div>
                <Card className="bg-card border-border">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${isOnline ? 'bg-emerald-500/10' : 'bg-slate-500/10'}`}>
                            <Bot className={`w-5 h-5 ${isOnline ? 'text-emerald-400' : 'text-slate-400'}`} />
                        </div>
                        <div>
                            <p className="font-medium">Klaus</p>
                            <div className="flex items-center gap-2 text-sm">
                                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
                                <span className="text-muted-foreground">{isOnline ? 'Online' : 'Offline'} • {getTimeSinceLastBeat()}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((card, i) => (
                    <motion.div key={card.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                        <Link href={card.href}>
                            <Card className="bg-card border-border hover:border-primary/50 transition-colors group cursor-pointer">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <div className={`p-2 rounded-lg bg-gradient-to-br ${card.color}`}>
                                            <card.icon className={`w-5 h-5 ${card.iconColor}`} />
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-3xl font-bold">{card.value}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {card.title}
                                        {card.total !== undefined && <span className="text-muted-foreground/50"> / {card.total}</span>}
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                    </motion.div>
                ))}
            </div>

            {/* Skills Status */}
            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        Skills Overview
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-2xl font-bold">{stats.skillsEnabled} <span className="text-muted-foreground text-base font-normal">/ {stats.skillsTotal} enabled</span></p>
                            <p className="text-sm text-muted-foreground mt-1">Configure Klaus capabilities to automate tasks</p>
                        </div>
                        <Link href="/klaus/skills">
                            <Button variant="outline">
                                Manage Skills
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-4">
                <Link href="/chat">
                    <Card className="bg-gradient-to-br from-primary/5 to-cyan-500/5 border-primary/20 hover:border-primary/50 transition-colors cursor-pointer h-full">
                        <CardContent className="p-6">
                            <Bot className="w-8 h-8 text-primary mb-4" />
                            <h3 className="font-semibold mb-2">Chat with Klaus</h3>
                            <p className="text-sm text-muted-foreground">Start a conversation with your AI assistant</p>
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/kanban">
                    <Card className="bg-gradient-to-br from-sky-500/5 to-blue-500/5 border-sky-500/20 hover:border-sky-500/50 transition-colors cursor-pointer h-full">
                        <CardContent className="p-6">
                            <Ticket className="w-8 h-8 text-sky-400 mb-4" />
                            <h3 className="font-semibold mb-2">Hybrid Kanban</h3>
                            <p className="text-sm text-muted-foreground">Manage tasks with AI assistance modes</p>
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/brain-dump">
                    <Card className="bg-gradient-to-br from-violet-500/5 to-purple-500/5 border-violet-500/20 hover:border-violet-500/50 transition-colors cursor-pointer h-full">
                        <CardContent className="p-6">
                            <Brain className="w-8 h-8 text-violet-400 mb-4" />
                            <h3 className="font-semibold mb-2">Brain Dump</h3>
                            <p className="text-sm text-muted-foreground">Capture thoughts quickly, refine later</p>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </motion.div>
    )
}
