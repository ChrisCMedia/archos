'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Heartbeat {
    id: string
    service: string
    status: 'online' | 'offline' | 'error'
    last_beat: string
    metadata: Record<string, unknown>
}

export function useBotHeartbeat() {
    const [heartbeat, setHeartbeat] = useState<Heartbeat | null>(null)
    const [loading, setLoading] = useState(true)
    const [isOnline, setIsOnline] = useState(false)
    const supabase = createClient()

    const fetchHeartbeat = useCallback(async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('bot_heartbeat')
            .select('*')
            .eq('service', 'klaus')
            .single()

        if (error) {
            setIsOnline(false)
        } else if (data) {
            const hb = data as Heartbeat
            setHeartbeat(hb)
            // Check if last beat was within 2 minutes
            const lastBeat = new Date(hb.last_beat)
            const now = new Date()
            const diffMs = now.getTime() - lastBeat.getTime()
            const diffMins = diffMs / (1000 * 60)
            setIsOnline(diffMins < 2 && hb.status === 'online')
        }
        setLoading(false)
    }, [supabase])

    useEffect(() => {
        fetchHeartbeat()

        // Poll every 30 seconds for heartbeat status
        const interval = setInterval(fetchHeartbeat, 30000)

        // Also subscribe to realtime updates
        const channel = supabase
            .channel('heartbeat-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'bot_heartbeat' },
                () => {
                    fetchHeartbeat()
                }
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
        isOnline,
        refetch: fetchHeartbeat,
    }
}
