'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Play,
    Pause,
    Trash2,
    Download,
    Filter,
    Search,
    ChevronDown,
    Bot,
    AlertCircle,
    Info,
    AlertTriangle,
    Bug
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface LogEntry {
    id: string
    timestamp: Date
    level: 'info' | 'warning' | 'error' | 'debug'
    message: string
    details?: string
}

const generateLogs = (): LogEntry[] => {
    const logs: LogEntry[] = [
        { id: '1', timestamp: new Date(Date.now() - 60000), level: 'info', message: 'Klaus initialized successfully', details: 'Model: claude-opus-4, Temperature: 0.7' },
        { id: '2', timestamp: new Date(Date.now() - 55000), level: 'info', message: 'Loading skills from database', details: '5 skills enabled' },
        { id: '3', timestamp: new Date(Date.now() - 50000), level: 'debug', message: 'Connecting to Supabase Realtime', details: 'Channel: bot_config' },
        { id: '4', timestamp: new Date(Date.now() - 45000), level: 'info', message: 'Telegram webhook received', details: 'Chat ID: -1001234567890' },
        { id: '5', timestamp: new Date(Date.now() - 40000), level: 'info', message: 'Processing user message', details: '"What is the status of ticket #234?"' },
        { id: '6', timestamp: new Date(Date.now() - 35000), level: 'debug', message: 'Executing tool: ticket_lookup', details: 'ticket_id: 234' },
        { id: '7', timestamp: new Date(Date.now() - 30000), level: 'info', message: 'Tool execution completed', details: 'Duration: 124ms' },
        { id: '8', timestamp: new Date(Date.now() - 25000), level: 'info', message: 'Response generated', details: '156 tokens' },
        { id: '9', timestamp: new Date(Date.now() - 20000), level: 'warning', message: 'Rate limit approaching', details: 'OpenAI: 85% of limit used' },
        { id: '10', timestamp: new Date(Date.now() - 15000), level: 'info', message: 'User requested autonomous mode', details: 'Ticket #234' },
        { id: '11', timestamp: new Date(Date.now() - 10000), level: 'info', message: 'Autonomous task started', details: 'Task: Website Redesign' },
        { id: '12', timestamp: new Date(Date.now() - 5000), level: 'debug', message: 'Executing subtask 1/3', details: 'Updating responsive styles' },
    ]
    return logs
}

const levelConfig = {
    info: { icon: Info, color: 'text-sky-400', bg: 'bg-sky-500/10' },
    warning: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    error: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
    debug: { icon: Bug, color: 'text-purple-400', bg: 'bg-purple-500/10' },
}

export default function LogsPage() {
    const [logs, setLogs] = useState<LogEntry[]>(generateLogs())
    const [isPaused, setIsPaused] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [visibleLevels, setVisibleLevels] = useState({
        info: true,
        warning: true,
        error: true,
        debug: true,
    })
    const scrollRef = useRef<HTMLDivElement>(null)
    const [autoScroll, setAutoScroll] = useState(true)

    // Simulate new log entries
    useEffect(() => {
        if (isPaused) return

        const interval = setInterval(() => {
            const newLog: LogEntry = {
                id: Date.now().toString(),
                timestamp: new Date(),
                level: ['info', 'info', 'info', 'debug', 'warning'][Math.floor(Math.random() * 5)] as LogEntry['level'],
                message: [
                    'Processing incoming request',
                    'Executing scheduled task',
                    'Memory usage: 245MB',
                    'Heartbeat ping successful',
                    'Cache cleared automatically',
                ][Math.floor(Math.random() * 5)],
            }
            setLogs(prev => [...prev.slice(-99), newLog])
        }, 3000)

        return () => clearInterval(interval)
    }, [isPaused])

    // Auto-scroll to bottom
    useEffect(() => {
        if (autoScroll && scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [logs, autoScroll])

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
        const isAtBottom = scrollHeight - scrollTop - clientHeight < 50
        setAutoScroll(isAtBottom)
    }

    const filteredLogs = logs.filter(log => {
        if (!visibleLevels[log.level]) return false
        if (searchQuery && !log.message.toLowerCase().includes(searchQuery.toLowerCase())) return false
        return true
    })

    const clearLogs = () => {
        setLogs([])
    }

    const exportLogs = () => {
        const content = logs.map(log =>
            `[${log.timestamp.toISOString()}] [${log.level.toUpperCase()}] ${log.message}${log.details ? ` | ${log.details}` : ''}`
        ).join('\n')

        const blob = new Blob([content], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `klaus-logs-${new Date().toISOString().split('T')[0]}.txt`
        a.click()
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 h-[calc(100vh-120px)] flex flex-col"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Agent Logs</h1>
                    <p className="text-muted-foreground mt-1">
                        Real-time visibility into Klaus&apos;s operations
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant={isPaused ? "default" : "secondary"}
                        size="sm"
                        onClick={() => setIsPaused(!isPaused)}
                    >
                        {isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
                        {isPaused ? 'Resume' : 'Pause'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={clearLogs}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear
                    </Button>
                    <Button variant="outline" size="sm" onClick={exportLogs}>
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search logs..."
                        className="pl-9 bg-secondary border-border"
                    />
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                            <Filter className="w-4 h-4" />
                            Filter
                            <ChevronDown className="w-3 h-3" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-card border-border">
                        {(Object.keys(visibleLevels) as Array<keyof typeof visibleLevels>).map((level) => (
                            <DropdownMenuCheckboxItem
                                key={level}
                                checked={visibleLevels[level]}
                                onCheckedChange={(checked) =>
                                    setVisibleLevels(prev => ({ ...prev, [level]: checked }))
                                }
                                className="capitalize"
                            >
                                {level}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${isPaused ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`} />
                        {isPaused ? 'Paused' : 'Live'}
                    </div>
                    <span>{filteredLogs.length} entries</span>
                </div>
            </div>

            {/* Log Viewer */}
            <Card className="flex-1 bg-card border-border overflow-hidden">
                <ScrollArea
                    className="h-full font-mono text-sm"
                    ref={scrollRef}
                    onScroll={handleScroll}
                >
                    <div className="p-4 space-y-1">
                        {filteredLogs.map((log) => {
                            const config = levelConfig[log.level]
                            const Icon = config.icon
                            return (
                                <motion.div
                                    key={log.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors ${config.bg}`}
                                >
                                    <Icon className={`w-4 h-4 mt-0.5 ${config.color}`} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-muted-foreground text-xs">
                                                {log.timestamp.toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    second: '2-digit'
                                                })}
                                            </span>
                                            <Badge variant="outline" className={`text-[10px] ${config.color}`}>
                                                {log.level.toUpperCase()}
                                            </Badge>
                                            <span className="text-foreground">{log.message}</span>
                                        </div>
                                        {log.details && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {log.details}
                                            </p>
                                        )}
                                    </div>
                                </motion.div>
                            )
                        })}

                        {filteredLogs.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">
                                <Bot className="w-12 h-12 mx-auto mb-4 opacity-30" />
                                <p>No logs to display</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </Card>

            {/* Auto-scroll indicator */}
            {!autoScroll && (
                <Button
                    variant="secondary"
                    size="sm"
                    className="absolute bottom-24 right-10"
                    onClick={() => {
                        setAutoScroll(true)
                        if (scrollRef.current) {
                            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
                        }
                    }}
                >
                    <ChevronDown className="w-4 h-4 mr-2" />
                    Jump to latest
                </Button>
            )}
        </motion.div>
    )
}
