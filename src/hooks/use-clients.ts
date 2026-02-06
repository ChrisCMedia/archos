'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// Matches new secure schema
export interface Client {
    id: string
    user_id: string
    name: string
    status: 'lead' | 'prospect' | 'active' | 'churned'
    industry: string | null
    contact_info: {
        email?: string
        phone?: string
        notes?: string
    } | null
    created_at: string
}

interface ClientInsert {
    name: string
    status?: string
    industry?: string
    contact_info?: {
        email?: string
        phone?: string
        notes?: string
    }
}

interface ClientUpdate {
    name?: string
    status?: string
    industry?: string
    contact_info?: {
        email?: string
        phone?: string
        notes?: string
    }
}

export function useClients() {
    const [clients, setClients] = useState<Client[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    const fetchClients = useCallback(async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            setError(error.message)
        } else {
            setClients((data as Client[]) || [])
        }
        setLoading(false)
    }, [supabase])

    const createClientRecord = async (client: ClientInsert) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase.from('clients') as any)
            .insert({
                name: client.name,
                status: client.status || 'lead',
                industry: client.industry || null,
                contact_info: client.contact_info || null,
            })
            .select()
            .single()

        if (error) throw new Error(error.message)
        setClients(prev => [data as Client, ...prev])
        return data as Client
    }

    const updateClient = async (id: string, updates: ClientUpdate) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase.from('clients') as any)
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw new Error(error.message)
        setClients(prev => prev.map(c => c.id === id ? data as Client : c))
        return data as Client
    }

    const deleteClient = async (id: string) => {
        const { error } = await supabase
            .from('clients')
            .delete()
            .eq('id', id)

        if (error) throw new Error(error.message)
        setClients(prev => prev.filter(c => c.id !== id))
    }

    useEffect(() => {
        fetchClients()

        const channel = supabase
            .channel('clients-changes')
            .on(
                'postgres_changes' as const,
                { event: '*', schema: 'public', table: 'clients' },
                () => fetchClients()
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [fetchClients, supabase])

    return {
        clients,
        loading,
        error,
        createClient: createClientRecord,
        updateClient,
        deleteClient,
        refetch: fetchClients,
    }
}
