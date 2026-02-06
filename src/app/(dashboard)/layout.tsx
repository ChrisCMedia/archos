'use client'

import React from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { CommandBar } from '@/components/layout/command-bar'
import { Button } from '@/components/ui/button'
import { Command } from 'lucide-react'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar />
            <main className="flex-1 overflow-auto">
                <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 bg-background/80 backdrop-blur-xl border-b border-border">
                    <div />
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => {
                            const event = new KeyboardEvent('keydown', {
                                key: 'k',
                                metaKey: true,
                                bubbles: true,
                            })
                            document.dispatchEvent(event)
                        }}
                    >
                        <Command className="w-3 h-3 mr-2" />
                        <span className="text-xs">Command</span>
                        <kbd className="ml-2 px-1.5 py-0.5 text-[10px] font-mono bg-muted rounded">⌘K</kbd>
                    </Button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </main>
            <CommandBar />
        </div>
    )
}
