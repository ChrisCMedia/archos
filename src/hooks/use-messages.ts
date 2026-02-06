'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// Matches new secure schema
export interface Message {
    id: string
    user_id: string
    role: 'user' | 'assistant'
    content: string
    created_at: string
}

interface MessageInsert {
    role: 'user' | 'assistant'
    content: string
}

export function useMessages() {
    const [messages, setMessages] = useState<Message[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    const fetchMessages = useCallback(async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .order('created_at', { ascending: true })
            .limit(100)

        if (error) {
            setError(error.message)
        } else {
            setMessages((data as Message[]) || [])
        }
        setLoading(false)
    }, [supabase])

    const sendMessage = async (message: MessageInsert) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase.from('messages') as any)
            .insert({
                role: message.role,
                content: message.content,
            })
            .select()
            .single()

        if (error) throw new Error(error.message)
        setMessages(prev => [...prev, data as Message])
        return data as Message
    }

    const clearMessages = async () => {
        const { error } = await supabase
            .from('messages')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

        if (error) throw new Error(error.message)
        setMessages([])
    }

    useEffect(() => {
        fetchMessages()

        const channel = supabase
            .channel('messages-changes')
            .on(
                'postgres_changes' as const,
                { event: '*', schema: 'public', table: 'messages' },
                () => fetchMessages()
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [fetchMessages, supabase])

    return {
        messages,
        loading,
        error,
        sendMessage,
        clearMessages,
        refetch: fetchMessages,
    }
}
