'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface DashboardStats {
    totalTickets: number
    activeTickets: number
    completedTickets: number
    totalClients: number
    activeClients: number
    totalProjects: number
    skillsEnabled: number
    skillsTotal: number
    knowledgeEntries: number
}

export function useDashboardStats() {
    const [stats, setStats] = useState<DashboardStats>({
        totalTickets: 0,
        activeTickets: 0,
        completedTickets: 0,
        totalClients: 0,
        activeClients: 0,
        totalProjects: 0,
        skillsEnabled: 0,
        skillsTotal: 0,
        knowledgeEntries: 0,
    })
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    const fetchStats = useCallback(async () => {
        setLoading(true)

        // Fetch ticket stats
        const { data: tickets } = await supabase
            .from('tickets')
            .select('status')

        const ticketData = (tickets || []) as Array<{ status: string }>
        const activeTickets = ticketData.filter(t => t.status === 'active').length
        const completedTickets = ticketData.filter(t => t.status === 'done').length

        // Fetch client stats
        const { data: clients } = await supabase
            .from('clients')
            .select('status')

        const clientData = (clients || []) as Array<{ status: string }>
        const activeClients = clientData.filter(c => c.status === 'active').length

        // Fetch project count
        const { count: projectCount } = await supabase
            .from('projects')
            .select('*', { count: 'exact', head: true })

        // Fetch skills stats
        const { data: skills } = await supabase
            .from('bot_skills')
            .select('enabled')

        const skillData = (skills || []) as Array<{ enabled: boolean }>
        const skillsEnabled = skillData.filter(s => s.enabled).length

        // Fetch knowledge count
        const { count: knowledgeCount } = await supabase
            .from('knowledge_vault')
            .select('*', { count: 'exact', head: true })

        setStats({
            totalTickets: ticketData.length,
            activeTickets,
            completedTickets,
            totalClients: clientData.length,
            activeClients,
            totalProjects: projectCount || 0,
            skillsEnabled,
            skillsTotal: skillData.length,
            knowledgeEntries: knowledgeCount || 0,
        })

        setLoading(false)
    }, [supabase])

    useEffect(() => {
        fetchStats()
    }, [fetchStats])

    return {
        stats,
        loading,
        refetch: fetchStats,
    }
}
