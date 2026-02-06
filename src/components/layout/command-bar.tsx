'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
    Plus,
    LayoutDashboard,
    Kanban,
    MessageSquare,
    Settings,
    Cpu,
    Key,
    ScrollText,
    Zap,
    FileText,
    Brain
} from 'lucide-react'
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command'

interface CommandAction {
    id: string
    label: string
    icon: React.ComponentType<{ className?: string }>
    action: () => void
    category: 'navigation' | 'operations' | 'system'
}

export function CommandBar() {
    const [open, setOpen] = useState(false)
    const router = useRouter()

    const actions: CommandAction[] = [
        // Navigation
        { id: 'nav-home', label: 'Go to Mission Control', icon: LayoutDashboard, action: () => router.push('/'), category: 'navigation' },
        { id: 'nav-kanban', label: 'Go to Hybrid Kanban', icon: Kanban, action: () => router.push('/kanban'), category: 'navigation' },
        { id: 'nav-chat', label: 'Go to Neural Link', icon: MessageSquare, action: () => router.push('/chat'), category: 'navigation' },
        { id: 'nav-config', label: 'Go to Config Deck', icon: Settings, action: () => router.push('/klaus/config'), category: 'navigation' },
        { id: 'nav-skills', label: 'Go to Skill Matrix', icon: Cpu, action: () => router.push('/klaus/skills'), category: 'navigation' },
        { id: 'nav-secrets', label: 'Go to Secret Vault', icon: Key, action: () => router.push('/klaus/secrets'), category: 'navigation' },
        { id: 'nav-logs', label: 'Go to Agent Logs', icon: ScrollText, action: () => router.push('/klaus/logs'), category: 'navigation' },

        // Operations
        { id: 'op-new-ticket', label: 'New Ticket', icon: Plus, action: () => { router.push('/kanban?new=true') }, category: 'operations' },
        { id: 'op-brain-dump', label: 'Quick Brain Dump', icon: Brain, action: () => { router.push('/?braindump=true') }, category: 'operations' },
        { id: 'op-knowledge', label: 'Add to Knowledge Vault', icon: FileText, action: () => { router.push('/?knowledge=true') }, category: 'operations' },

        // System
        { id: 'sys-update-prompt', label: 'Update System Prompt', icon: Zap, action: () => router.push('/klaus/config'), category: 'system' },
        { id: 'sys-toggle-skill', label: 'Toggle Bot Skills', icon: Cpu, action: () => router.push('/klaus/skills'), category: 'system' },
        { id: 'sys-api-key', label: 'Manage API Keys', icon: Key, action: () => router.push('/klaus/secrets'), category: 'system' },
    ]

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener('keydown', down)
        return () => document.removeEventListener('keydown', down)
    }, [])

    const runAction = useCallback((action: CommandAction) => {
        setOpen(false)
        action.action()
    }, [])

    const navigationItems = actions.filter(a => a.category === 'navigation')
    const operationsItems = actions.filter(a => a.category === 'operations')
    const systemItems = actions.filter(a => a.category === 'system')

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>

                <CommandGroup heading="Navigation">
                    {navigationItems.map((action) => {
                        const Icon = action.icon
                        return (
                            <CommandItem
                                key={action.id}
                                onSelect={() => runAction(action)}
                                className="flex items-center gap-2 cursor-pointer"
                            >
                                <Icon className="w-4 h-4 text-muted-foreground" />
                                <span>{action.label}</span>
                            </CommandItem>
                        )
                    })}
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Operations">
                    {operationsItems.map((action) => {
                        const Icon = action.icon
                        return (
                            <CommandItem
                                key={action.id}
                                onSelect={() => runAction(action)}
                                className="flex items-center gap-2 cursor-pointer"
                            >
                                <Icon className="w-4 h-4 text-primary" />
                                <span>{action.label}</span>
                            </CommandItem>
                        )
                    })}
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Klaus Control">
                    {systemItems.map((action) => {
                        const Icon = action.icon
                        return (
                            <CommandItem
                                key={action.id}
                                onSelect={() => runAction(action)}
                                className="flex items-center gap-2 cursor-pointer"
                            >
                                <Icon className="w-4 h-4 text-amber-500" />
                                <span>{action.label}</span>
                            </CommandItem>
                        )
                    })}
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    )
}
