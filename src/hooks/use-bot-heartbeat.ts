'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// Matches new secure schema
export interface BotHeartbeat {
    id: string
    service: string
    status: 'online' | 'offline' | 'error'
    last_beat: string
    metadata: Record<string, unknown> | null
}

export function useBotHeartbeat(service: string = 'klaus') {
    const [heartbeat, setHeartbeat] = useState<BotHeartbeat | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    const fetchHeartbeat = useCallback(async () => {
        setLoading(true)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase.from('bot_heartbeat') as any)
            .select('*')
            .eq('service', service)
            .single()

        if (error) {
            // If no heartbeat exists, treat as offline
            if (error.code === 'PGRST116') {
                setHeartbeat({
                    id: '',
                    service,
                    status: 'offline',
                    last_beat: new Date().toISOString(),
                    metadata: null,
                })
            } else {
                setError(error.message)
            }
        } else if (data) {
            const hbData = data as BotHeartbeat
            // Check if heartbeat is stale (> 30 seconds old)
            const lastBeat = new Date(hbData.last_beat)
            const now = new Date()
            const diffSeconds = (now.getTime() - lastBeat.getTime()) / 1000

            const status = diffSeconds > 30 ? 'offline' : hbData.status
            setHeartbeat({ ...hbData, status } as BotHeartbeat)
        }
        setLoading(false)
    }, [supabase, service])

    const isOnline = heartbeat?.status === 'online'

    const getTimeSinceLastBeat = () => {
        if (!heartbeat?.last_beat) return 'Unknown'
        const lastBeat = new Date(heartbeat.last_beat)
        const now = new Date()
        const diffSeconds = Math.floor((now.getTime() - lastBeat.getTime()) / 1000)

        if (diffSeconds < 60) return `${diffSeconds}s ago`
        if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`
        if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`
        return `${Math.floor(diffSeconds / 86400)}d ago`
    }

    useEffect(() => {
        fetchHeartbeat()

        // Poll every 10 seconds for status updates
        const interval = setInterval(fetchHeartbeat, 10000)

        // Also subscribe to realtime changes
        const channel = supabase
            .channel('heartbeat-changes')
            .on(
                'postgres_changes' as const,
                { event: '*', schema: 'public', table: 'bot_heartbeat' },
                () => fetchHeartbeat()
            )
            .subscribe()

        return () => {
            clearInterval(interval)
            supabase.removeChannel(channel)
        }
    }, [fetchHeartbeat, supabase])

    return {
        heartbeat,
        loading,
        error,
        isOnline,
        getTimeSinceLastBeat,
        refetch: fetchHeartbeat,
    }
}
