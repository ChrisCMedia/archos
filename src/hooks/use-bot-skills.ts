'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface BotSkill {
    id: string
    name: string
    description: string | null
    enabled: boolean
    config: Record<string, unknown>
    created_at: string
}

export function useBotSkills() {
    const [skills, setSkills] = useState<BotSkill[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    const fetchSkills = useCallback(async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('bot_skills')
            .select('*')
            .order('name')

        if (error) {
            setError(error.message)
        } else {
            setSkills((data as BotSkill[]) || [])
        }
        setLoading(false)
    }, [supabase])

    const toggleSkill = async (id: string, enabled: boolean) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from('bot_skills') as any)
            .update({ enabled })
            .eq('id', id)

        if (error) throw new Error(error.message)
        setSkills(prev => prev.map(s => s.id === id ? { ...s, enabled } : s))
    }

    useEffect(() => {
        fetchSkills()

        const channel = supabase
            .channel('bot-skills-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'bot_skills' },
                () => {
                    fetchSkills()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [fetchSkills, supabase])

    return {
        skills,
        loading,
        error,
        toggleSkill,
        refetch: fetchSkills,
    }
}
