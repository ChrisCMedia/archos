'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// Matches new secure schema
export interface CronJob {
    id: string
    user_id: string
    schedule: string
    command: string
    active: boolean
}

interface CronJobInsert {
    schedule: string
    command: string
    active?: boolean
}

interface CronJobUpdate {
    schedule?: string
    command?: string
    active?: boolean
}

export function useBotCron() {
    const [cronJobs, setCronJobs] = useState<CronJob[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    const fetchCronJobs = useCallback(async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('bot_cron')
            .select('*')
            .order('schedule', { ascending: true })

        if (error) {
            setError(error.message)
        } else {
            setCronJobs((data as CronJob[]) || [])
        }
        setLoading(false)
    }, [supabase])

    const createCronJob = async (job: CronJobInsert) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase.from('bot_cron') as any)
            .insert({
                schedule: job.schedule,
                command: job.command,
                active: job.active ?? true,
            })
            .select()
            .single()

        if (error) throw new Error(error.message)
        setCronJobs(prev => [...prev, data as CronJob])
        return data as CronJob
    }

    const updateCronJob = async (id: string, updates: CronJobUpdate) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase.from('bot_cron') as any)
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw new Error(error.message)
        setCronJobs(prev => prev.map(j => j.id === id ? data as CronJob : j))
        return data as CronJob
    }

    const toggleCronJob = async (id: string, active: boolean) => {
        return updateCronJob(id, { active })
    }

    const deleteCronJob = async (id: string) => {
        const { error } = await supabase
            .from('bot_cron')
            .delete()
            .eq('id', id)

        if (error) throw new Error(error.message)
        setCronJobs(prev => prev.filter(j => j.id !== id))
    }

    useEffect(() => {
        fetchCronJobs()

        const channel = supabase
            .channel('cron-changes')
            .on(
                'postgres_changes' as const,
                { event: '*', schema: 'public', table: 'bot_cron' },
                () => fetchCronJobs()
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [fetchCronJobs, supabase])

    return {
        cronJobs,
        loading,
        error,
        createCronJob,
        updateCronJob,
        toggleCronJob,
        deleteCronJob,
        refetch: fetchCronJobs,
    }
}
