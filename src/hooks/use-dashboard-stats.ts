'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface DashboardStats {
    ticketsByStatus: {
        backlog: number
        active: number
        review: number
        done: number
    }
    activeSkills: number
    totalSkills: number
    recentMessages: number
    autonomousTickets: number
}

export function useDashboardStats() {
    const [stats, setStats] = useState<DashboardStats>({
        ticketsByStatus: { backlog: 0, active: 0, review: 0, done: 0 },
        activeSkills: 0,
        totalSkills: 0,
        recentMessages: 0,
        autonomousTickets: 0,
    })
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    const fetchStats = useCallback(async () => {
        setLoading(true)

        // Fetch tickets by status
        const { data: tickets } = await supabase
            .from('tickets')
            .select('status, agent_mode')

        const ticketsByStatus = {
            backlog: 0,
            active: 0,
            review: 0,
            done: 0,
        }
        let autonomousTickets = 0

        const ticketData = tickets as Array<{ status: string; agent_mode: string }> || []
        ticketData.forEach(t => {
            if (t.status && t.status in ticketsByStatus) {
                ticketsByStatus[t.status as keyof typeof ticketsByStatus]++
            }
            if (t.agent_mode === 'autonomous') {
                autonomousTickets++
            }
        })

        // Fetch skills stats
        const { data: skills } = await supabase
            .from('bot_skills')
            .select('enabled')
        const skillData = skills as Array<{ enabled: boolean }> || []
        const totalSkills = skillData.length
        const activeSkills = skillData.filter(s => s.enabled).length

        // Fetch recent messages (last 24 hours)
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        const { count: messageCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', yesterday)

        setStats({
            ticketsByStatus,
            activeSkills,
            totalSkills,
            recentMessages: messageCount || 0,
            autonomousTickets,
        })
        setLoading(false)
    }, [supabase])

    useEffect(() => {
        fetchStats()

        // Subscribe to changes
        const ticketChannel = supabase
            .channel('dashboard-tickets')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, () => {
                fetchStats()
            })
            .subscribe()

        const skillChannel = supabase
            .channel('dashboard-skills')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'bot_skills' }, () => {
                fetchStats()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(ticketChannel)
            supabase.removeChannel(skillChannel)
        }
    }, [fetchStats, supabase])

    return {
        stats,
        loading,
        refetch: fetchStats,
    }
}
