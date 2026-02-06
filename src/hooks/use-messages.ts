'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Message {
    id: string
    ticket_id: string | null
    role: 'user' | 'assistant' | 'system'
    channel: 'telegram' | 'email' | 'web'
    content: string
    metadata: Record<string, unknown>
    created_at: string
}

interface MessageInsert {
    ticket_id?: string | null
    role: 'user' | 'assistant' | 'system'
    channel?: 'telegram' | 'email' | 'web'
    content: string
}

export function useMessages(ticketId?: string) {
    const [messages, setMessages] = useState<Message[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    // Fetch messages
    const fetchMessages = useCallback(async () => {
        setLoading(true)
        let query = supabase
            .from('messages')
            .select('*')
            .order('created_at', { ascending: true })

        if (ticketId) {
            query = query.eq('ticket_id', ticketId)
        }

        const { data, error } = await query

        if (error) {
            setError(error.message)
        } else {
            setMessages((data as Message[]) || [])
        }
        setLoading(false)
    }, [supabase, ticketId])

    // Send a new message
    const sendMessage = async (message: MessageInsert) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase.from('messages') as any)
            .insert(message)
            .select()
            .single()

        if (error) {
            throw new Error(error.message)
        }
        return data as Message
    }

    // Subscribe to realtime changes
    useEffect(() => {
        fetchMessages()

        const channel = supabase
            .channel('messages-changes')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages' },
                (payload: { new: Message }) => {
                    const newMessage = payload.new
                    // Only add if it matches our filter
                    if (!ticketId || newMessage.ticket_id === ticketId) {
                        setMessages(prev => [...prev, newMessage])
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [fetchMessages, supabase, ticketId])

    return {
        messages,
        loading,
        error,
        sendMessage,
        refetch: fetchMessages,
    }
}
