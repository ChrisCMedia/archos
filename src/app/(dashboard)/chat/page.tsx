'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bot, Send, Loader2, Trash2, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useMessages, Message } from '@/hooks/use-messages'
import { useBotHeartbeat } from '@/hooks/use-bot-heartbeat'

export default function ChatPage() {
    const { messages, loading, sendMessage, clearMessages } = useMessages()
    const { heartbeat, isOnline, getTimeSinceLastBeat } = useBotHeartbeat()
    const { toast } = useToast()
    const [input, setInput] = useState('')
    const [isSending, setIsSending] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const handleSend = async () => {
        if (!input.trim() || isSending) return
        const content = input.trim()
        setInput('')
        setIsSending(true)
        try {
            await sendMessage({ role: 'user', content })
            // Simulate assistant response (replace with actual AI call)
            setTimeout(async () => {
                await sendMessage({ role: 'assistant', content: 'I received your message. This is a placeholder response - connect to an AI backend for real responses.' })
                setIsSending(false)
            }, 1000)
        } catch {
            toast({ title: 'Error', description: 'Failed to send message', variant: 'destructive' })
            setIsSending(false)
        }
    }

    const handleClear = async () => {
        try {
            await clearMessages()
            toast({ title: 'Chat cleared' })
        } catch { toast({ title: 'Error', variant: 'destructive' }) }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    if (loading) return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[calc(100vh-8rem)] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-cyan-500/20">
                        <Bot className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Klaus Chat</h1>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                            <span>{isOnline ? 'Online' : 'Offline'}</span>
                            <span className="text-muted-foreground/50">• {getTimeSinceLastBeat()}</span>
                        </div>
                    </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleClear} disabled={messages.length === 0}>
                    <Trash2 className="w-4 h-4 mr-2" />Clear
                </Button>
            </div>

            {/* Messages */}
            <Card className="flex-1 bg-card border-border overflow-hidden">
                <ScrollArea className="h-full p-4" ref={scrollRef}>
                    {messages.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                            <div className="text-center">
                                <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-30" />
                                <p>Start a conversation with Klaus</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {messages.map((msg, i) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                        <p className="text-[10px] mt-1 opacity-50">
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                            {isSending && (
                                <div className="flex justify-start">
                                    <div className="bg-secondary rounded-2xl px-4 py-3">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </ScrollArea>
            </Card>

            {/* Input */}
            <div className="mt-4 flex gap-3">
                <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message... (Shift+Enter for new line)"
                    className="bg-secondary border-border min-h-[60px] resize-none"
                    disabled={isSending}
                />
                <Button onClick={handleSend} disabled={!input.trim() || isSending} className="px-6">
                    {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
            </div>
        </motion.div>
    )
}
