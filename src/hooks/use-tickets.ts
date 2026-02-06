'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface Ticket {
    id: string
    title: string
    description: string | null
    status: 'backlog' | 'active' | 'review' | 'done'
    agent_mode: 'manual' | 'assisted' | 'autonomous'
    priority: 'low' | 'medium' | 'high' | 'critical'
    assignee: string | null
    tags: string[]
    client_id: string | null
    project_id: string | null
    source: string | null
    due_date: string | null
    metadata: Record<string, unknown>
    created_at: string
    updated_at: string
}

interface TicketInsert {
    title: string
    description?: string | null
    status?: 'backlog' | 'active' | 'review' | 'done'
    agent_mode?: 'manual' | 'assisted' | 'autonomous'
    priority?: 'low' | 'medium' | 'high' | 'critical'
    assignee?: string | null
    tags?: string[]
}

interface TicketUpdate {
    title?: string
    description?: string | null
    status?: 'backlog' | 'active' | 'review' | 'done'
    agent_mode?: 'manual' | 'assisted' | 'autonomous'
    priority?: 'low' | 'medium' | 'high' | 'critical'
    assignee?: string | null
    tags?: string[]
}

export function useTickets() {
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    // Fetch all tickets
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

    // Create a new ticket
    const createTicket = async (ticket: TicketInsert) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase.from('tickets') as any)
            .insert(ticket)
            .select()
            .single()

        if (error) {
            throw new Error(error.message)
        }
        return data as Ticket
    }

    // Update a ticket
    const updateTicket = async (id: string, updates: TicketUpdate) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase.from('tickets') as any)
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            throw new Error(error.message)
        }
        return data as Ticket
    }

    // Delete a ticket
    const deleteTicket = async (id: string) => {
        const { error } = await supabase
            .from('tickets')
            .delete()
            .eq('id', id)

        if (error) {
            throw new Error(error.message)
        }
    }

    // Subscribe to realtime changes
    useEffect(() => {
        fetchTickets()

        const channel = supabase
            .channel('tickets-changes')
            .on(
                'postgres_changes' as const,
                { event: '*', schema: 'public', table: 'tickets' },
                () => {
                    // Refetch on any change
                    fetchTickets()
                }
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
