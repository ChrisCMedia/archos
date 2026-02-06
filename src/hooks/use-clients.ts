'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient as createSupabaseClient } from '@/lib/supabase/client'

interface Client {
    id: string
    name: string
    email: string | null
    phone: string | null
    status: 'lead' | 'prospect' | 'active' | 'churned'
    industry: string | null
    notes: string | null
    created_at: string
    updated_at: string
}

interface ClientInsert {
    name: string
    email?: string | null
    phone?: string | null
    status?: 'lead' | 'prospect' | 'active' | 'churned'
    industry?: string | null
    notes?: string | null
}

interface ClientUpdate {
    name?: string
    email?: string | null
    phone?: string | null
    status?: 'lead' | 'prospect' | 'active' | 'churned'
    industry?: string | null
    notes?: string | null
}

export function useClients() {
    const [clients, setClients] = useState<Client[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const supabase = createSupabaseClient()

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

    const createClient = async (client: ClientInsert) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase.from('clients') as any)
            .insert(client)
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
                'postgres_changes',
                { event: '*', schema: 'public', table: 'clients' },
                () => {
                    fetchClients()
                }
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
        createClient,
        updateClient,
        deleteClient,
        refetch: fetchClients,
    }
}

export function useClient(id: string) {
    const [client, setClient] = useState<Client | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const supabase = createSupabaseClient()

    const fetchClient = useCallback(async () => {
        if (!id) return
        setLoading(true)
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            setError(error.message)
        } else {
            setClient(data as Client)
        }
        setLoading(false)
    }, [supabase, id])

    useEffect(() => {
        fetchClient()
    }, [fetchClient])

    return { client, loading, error, refetch: fetchClient }
}
