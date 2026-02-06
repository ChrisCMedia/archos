'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LayoutDashboard,
    Kanban,
    MessageSquare,
    Settings,
    Cpu,
    Key,
    ScrollText,
    ChevronLeft,
    ChevronRight,
    Zap,
    Bot,
    Users,
    Clock,
    FolderOpen,
    Volume2,
    Brain,
    BookOpen,
    LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { createClient } from '@/lib/supabase/client'

interface NavItem {
    href: string
    label: string
    icon: React.ComponentType<{ className?: string }>
}

const operationsItems: NavItem[] = [
    { href: '/', label: 'Mission Control', icon: LayoutDashboard },
    { href: '/brain-dump', label: 'Brain Dump', icon: Brain },
    { href: '/kanban', label: 'Hybrid Kanban', icon: Kanban },
    { href: '/knowledge', label: 'Knowledge Vault', icon: BookOpen },
    { href: '/chat', label: 'Neural Link', icon: MessageSquare },
    { href: '/crm', label: 'CRM', icon: Users },
]

const klausItems: NavItem[] = [
    { href: '/klaus/config', label: 'Config Deck', icon: Settings },
    { href: '/klaus/skills', label: 'Skill Matrix', icon: Cpu },
    { href: '/klaus/secrets', label: 'Secret Vault', icon: Key },
    { href: '/klaus/cron', label: 'Cronjobs', icon: Clock },
    { href: '/klaus/files', label: 'File Manager', icon: FolderOpen },
    { href: '/klaus/voice', label: 'Voice / TTS', icon: Volume2 },
    { href: '/klaus/logs', label: 'Agent Logs', icon: ScrollText },
]

export function Sidebar() {
    const [collapsed, setCollapsed] = useState(false)
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    const NavLink = ({ item }: { item: NavItem }) => {
        const isActive = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href))
        const Icon = item.icon

        const linkContent = (
            <Link
                href={item.href}
                className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                    'hover:bg-secondary/80 group',
                    isActive && 'bg-primary/10 text-primary glow-amber'
                )}
            >
                <Icon className={cn(
                    'w-5 h-5 flex-shrink-0 transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                )} />
                <AnimatePresence>
                    {!collapsed && (
                        <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            className={cn(
                                'text-sm font-medium whitespace-nowrap overflow-hidden',
                                isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                            )}
                        >
                            {item.label}
                        </motion.span>
                    )}
                </AnimatePresence>
            </Link>
        )

        if (collapsed) {
            return (
                <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                        {linkContent}
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-card border-border">
                        {item.label}
                    </TooltipContent>
                </Tooltip>
            )
        }

        return linkContent
    }

    return (
        <TooltipProvider>
            <motion.aside
                initial={false}
                animate={{ width: collapsed ? 72 : 240 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="flex flex-col h-screen bg-card border-r border-border"
            >
                {/* Logo */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center gap-2"
                            >
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-amber-600 flex items-center justify-center">
                                    <Zap className="w-5 h-5 text-black" />
                                </div>
                                <span className="font-bold text-lg tracking-tight">ARCHOS</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {collapsed && (
                        <div className="w-8 h-8 mx-auto rounded-lg bg-gradient-to-br from-primary to-amber-600 flex items-center justify-center">
                            <Zap className="w-5 h-5 text-black" />
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-3 space-y-6 overflow-y-auto">
                    {/* Operations Section */}
                    <div className="space-y-1">
                        <AnimatePresence>
                            {!collapsed && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="px-3 py-1"
                                >
                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Operations
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        {operationsItems.map((item) => (
                            <NavLink key={item.href} item={item} />
                        ))}
                    </div>

                    <Separator className="bg-border/50" />

                    {/* Klaus Control Section */}
                    <div className="space-y-1">
                        <AnimatePresence>
                            {!collapsed && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="px-3 py-1 flex items-center gap-2"
                                >
                                    <Bot className="w-3 h-3 text-primary" />
                                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                                        Klaus Control
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        {klausItems.map((item) => (
                            <NavLink key={item.href} item={item} />
                        ))}
                    </div>
                </nav>

                {/* Footer with Logout and Collapse */}
                <div className="p-3 border-t border-border space-y-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        className="w-full justify-center text-muted-foreground hover:text-destructive"
                    >
                        {collapsed ? (
                            <LogOut className="w-4 h-4" />
                        ) : (
                            <>
                                <LogOut className="w-4 h-4 mr-2" />
                                <span>Logout</span>
                            </>
                        )}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCollapsed(!collapsed)}
                        className="w-full justify-center text-muted-foreground hover:text-foreground"
                    >
                        {collapsed ? (
                            <ChevronRight className="w-4 h-4" />
                        ) : (
                            <>
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                <span>Collapse</span>
                            </>
                        )}
                    </Button>
                </div>
            </motion.aside>
        </TooltipProvider>
    )
}
