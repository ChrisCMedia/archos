'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Send,
    Paperclip,
    Sparkles,
    User,
    Bot,
    Globe,
    Mail,
    Loader2
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { useMessages } from '@/hooks/use-messages'

type Channel = 'all' | 'web' | 'telegram' | 'email'

const channelIcons = {
    web: Globe,
    telegram: Send,
    email: Mail,
}

const channelColors = {
    web: 'text-emerald-500',
    telegram: 'text-sky-500',
    email: 'text-amber-500',
}

export default function ChatPage() {
    const { messages, loading, sendMessage } = useMessages()
    const { toast } = useToast()
    const [input, setInput] = useState('')
    const [activeChannel, setActiveChannel] = useState<Channel>('all')
    const [isTyping, setIsTyping] = useState(false)
    const [isSending, setIsSending] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    // Auto-scroll on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const filteredMessages = messages.filter(msg =>
        activeChannel === 'all' || msg.channel === activeChannel
    )

    const handleSend = async () => {
        if (!input.trim() || isSending) return

        const messageText = input.trim()
        setInput('')
        setIsSending(true)

        try {
            // Send user message
            await sendMessage({
                content: messageText,
                role: 'user',
                channel: 'web',
            })

            // Simulate AI typing
            setIsTyping(true)
            setTimeout(async () => {
                // Simulate AI response
                await sendMessage({
                    content: `I received your message: "${messageText}". This is a placeholder response - connect to your AI service for real responses.`,
                    role: 'assistant',
                    channel: 'web',
                })
                setIsTyping(false)
            }, 1500)
        } catch (err) {
            toast({
                title: 'Error',
                description: 'Failed to send message',
                variant: 'destructive',
            })
        } finally {
            setIsSending(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
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
            className="h-[calc(100vh-120px)] flex flex-col space-y-4"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Neural Link</h1>
                    <p className="text-muted-foreground mt-1">
                        Unified messaging across all channels
                    </p>
                </div>
            </div>

            {/* Channel Filter */}
            <Tabs value={activeChannel} onValueChange={(v) => setActiveChannel(v as Channel)} className="mb-4">
                <TabsList className="bg-secondary/50">
                    <TabsTrigger value="all">All Channels</TabsTrigger>
                    <TabsTrigger value="web" className="gap-1.5">
                        <Globe className="w-3 h-3" />
                        Web
                    </TabsTrigger>
                    <TabsTrigger value="telegram" className="gap-1.5">
                        <Send className="w-3 h-3" />
                        Telegram
                    </TabsTrigger>
                    <TabsTrigger value="email" className="gap-1.5">
                        <Mail className="w-3 h-3" />
                        Email
                    </TabsTrigger>
                </TabsList>
            </Tabs>

            {/* Chat Area */}
            <Card className="flex-1 bg-card border-border overflow-hidden flex flex-col">
                <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                    <div className="space-y-4">
                        <AnimatePresence initial={false}>
                            {filteredMessages.map((message) => {
                                const isUser = message.role === 'user'
                                const ChannelIcon = message.channel ? channelIcons[message.channel as keyof typeof channelIcons] : Globe

                                return (
                                    <motion.div
                                        key={message.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
                                    >
                                        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-primary' : 'bg-secondary'
                                            }`}>
                                            {isUser ? (
                                                <User className="w-4 h-4 text-primary-foreground" />
                                            ) : (
                                                <Bot className="w-4 h-4 text-primary" />
                                            )}
                                        </div>
                                        <div className={`flex-1 max-w-[80%] ${isUser ? 'text-right' : ''}`}>
                                            <div className={`inline-block p-3 rounded-2xl ${isUser
                                                    ? 'bg-primary text-primary-foreground rounded-tr-sm'
                                                    : 'bg-secondary rounded-tl-sm'
                                                }`}>
                                                <p className="text-sm whitespace-pre-wrap">
                                                    {message.content}
                                                </p>
                                            </div>
                                            <div className={`flex items-center gap-2 mt-1 text-xs text-muted-foreground ${isUser ? 'justify-end' : ''}`}>
                                                {message.channel && ChannelIcon && (
                                                    <ChannelIcon className={`w-3 h-3 ${channelColors[message.channel as keyof typeof channelColors] || ''}`} />
                                                )}
                                                <span>
                                                    {new Date(message.created_at).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </AnimatePresence>

                        {/* Typing Indicator */}
                        {isTyping && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex gap-3"
                            >
                                <div className="shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                                    <Bot className="w-4 h-4 text-primary" />
                                </div>
                                <div className="bg-secondary p-3 rounded-2xl rounded-tl-sm">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {filteredMessages.length === 0 && !isTyping && (
                            <div className="text-center py-12 text-muted-foreground">
                                <Bot className="w-12 h-12 mx-auto mb-4 opacity-30" />
                                <p className="font-medium">No messages yet</p>
                                <p className="text-sm mt-1">Start a conversation with Klaus</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="p-4 border-t border-border">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="shrink-0">
                            <Paperclip className="w-4 h-4" />
                        </Button>
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Message Klaus..."
                            className="bg-secondary border-border"
                            disabled={isSending}
                        />
                        <Button variant="ghost" size="icon" className="shrink-0">
                            <Sparkles className="w-4 h-4 text-primary" />
                        </Button>
                        <Button
                            onClick={handleSend}
                            disabled={!input.trim() || isSending}
                            className="shrink-0"
                        >
                            {isSending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                        </Button>
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                        <span>Press Enter to send</span>
                        <Badge variant="outline" className="text-[10px]">
                            <Globe className="w-3 h-3 mr-1" />
                            Web Channel
                        </Badge>
                    </div>
                </div>
            </Card>
        </motion.div>
    )
}
