'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface BotCron {
    id: string
    name: string
    description: string | null
    schedule: string
    command: string
    enabled: boolean
    last_run: string | null
    next_run: string | null
    created_at: string
    updated_at: string
}

interface BotCronInsert {
    name: string
    description?: string | null
    schedule: string
    command: string
    enabled?: boolean
}

export function useBotCron() {
    const [cronjobs, setCronjobs] = useState<BotCron[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    const fetchCronjobs = useCallback(async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('bot_cron')
            .select('*')
            .order('name')

        if (error) {
            setError(error.message)
        } else {
            setCronjobs((data as BotCron[]) || [])
        }
        setLoading(false)
    }, [supabase])

    const createCronjob = async (cron: BotCronInsert) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase.from('bot_cron') as any)
            .insert(cron)
            .select()
            .single()

        if (error) throw new Error(error.message)
        setCronjobs(prev => [...prev, data as BotCron].sort((a, b) => a.name.localeCompare(b.name)))
        return data as BotCron
    }

    const toggleCronjob = async (id: string, enabled: boolean) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from('bot_cron') as any)
            .update({ enabled })
            .eq('id', id)

        if (error) throw new Error(error.message)
        setCronjobs(prev => prev.map(c => c.id === id ? { ...c, enabled } : c))
    }

    const deleteCronjob = async (id: string) => {
        const { error } = await supabase
            .from('bot_cron')
            .delete()
            .eq('id', id)

        if (error) throw new Error(error.message)
        setCronjobs(prev => prev.filter(c => c.id !== id))
    }

    useEffect(() => {
        fetchCronjobs()

        const channel = supabase
            .channel('bot-cron-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'bot_cron' },
                () => {
                    fetchCronjobs()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [fetchCronjobs, supabase])

    return {
        cronjobs,
        loading,
        error,
        createCronjob,
        toggleCronjob,
        deleteCronjob,
        refetch: fetchCronjobs,
    }
}
