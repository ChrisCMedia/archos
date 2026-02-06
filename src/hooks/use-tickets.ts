'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// Matches new secure schema
export interface Ticket {
    id: string
    user_id: string
    title: string
    status: 'backlog' | 'active' | 'review' | 'done'
    priority: 'low' | 'medium' | 'high' | 'critical'
    agent_mode: 'manual' | 'assisted' | 'autonomous'
    context: Record<string, unknown> | null
    created_at: string
}

interface TicketInsert {
    title: string
    status?: string
    priority?: string
    agent_mode?: string
    context?: Record<string, unknown>
}

interface TicketUpdate {
    title?: string
    status?: string
    priority?: string
    agent_mode?: string
    context?: Record<string, unknown>
}

export function useTickets() {
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    const fetchTickets = useCallback(async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('tickets')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            setError(error.message)
        } else {
            setTickets((data as Ticket[]) || [])
        }
        setLoading(false)
    }, [supabase])

    const createTicket = async (ticket: TicketInsert) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase.from('tickets') as any)
            .insert({
                title: ticket.title,
                status: ticket.status || 'backlog',
                priority: ticket.priority || 'medium',
                agent_mode: ticket.agent_mode || 'manual',
                context: ticket.context || null,
            })
            .select()
            .single()

        if (error) throw new Error(error.message)
        setTickets(prev => [data as Ticket, ...prev])
        return data as Ticket
    }

    const updateTicket = async (id: string, updates: TicketUpdate) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase.from('tickets') as any)
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw new Error(error.message)
        setTickets(prev => prev.map(t => t.id === id ? data as Ticket : t))
        return data as Ticket
    }

    const deleteTicket = async (id: string) => {
        const { error } = await supabase
            .from('tickets')
            .delete()
            .eq('id', id)

        if (error) throw new Error(error.message)
        setTickets(prev => prev.filter(t => t.id !== id))
    }

    useEffect(() => {
        fetchTickets()

        const channel = supabase
            .channel('tickets-changes')
            .on(
                'postgres_changes' as const,
                { event: '*', schema: 'public', table: 'tickets' },
                () => fetchTickets()
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [fetchTickets, supabase])

    return {
        tickets,
        loading,
        error,
        createTicket,
        updateTicket,
        deleteTicket,
        refetch: fetchTickets,
    }
}
