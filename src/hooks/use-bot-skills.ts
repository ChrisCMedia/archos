'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// Matches new secure schema
export interface BotSkill {
    id: string
    user_id: string
    skill_id: string
    enabled: boolean
    config: Record<string, unknown> | null
}

// Available skill definitions
export const AVAILABLE_SKILLS = [
    { skill_id: 'web_search', name: 'Web Search', description: 'Search the web for information' },
    { skill_id: 'code_execution', name: 'Code Execution', description: 'Run code snippets and scripts' },
    { skill_id: 'database_access', name: 'Database Access', description: 'Query and modify Supabase data' },
    { skill_id: 'file_system', name: 'File System', description: 'Read and write local files' },
    { skill_id: 'telegram_bot', name: 'Telegram Bot', description: 'Send and receive Telegram messages' },
    { skill_id: 'calendar_sync', name: 'Calendar Sync', description: 'Manage Google Calendar events' },
    { skill_id: 'email', name: 'Email', description: 'Send emails via SMTP' },
    { skill_id: 'github', name: 'GitHub', description: 'Interact with GitHub repos' },
    { skill_id: 'webhooks', name: 'Webhooks', description: 'Trigger external webhooks' },
]

interface SkillInsert {
    skill_id: string
    enabled?: boolean
    config?: Record<string, unknown>
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

        if (error) {
            setError(error.message)
        } else {
            setSkills((data as BotSkill[]) || [])
        }
        setLoading(false)
    }, [supabase])

    const addSkill = async (skill: SkillInsert) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase.from('bot_skills') as any)
            .insert({
                skill_id: skill.skill_id,
                enabled: skill.enabled ?? false,
                config: skill.config || null,
            })
            .select()
            .single()

        if (error) throw new Error(error.message)
        setSkills(prev => [...prev, data as BotSkill])
        return data as BotSkill
    }

    const toggleSkill = async (id: string, enabled: boolean) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase.from('bot_skills') as any)
            .update({ enabled })
            .eq('id', id)
            .select()
            .single()

        if (error) throw new Error(error.message)
        setSkills(prev => prev.map(s => s.id === id ? data as BotSkill : s))
        return data as BotSkill
    }

    const updateSkillConfig = async (id: string, config: Record<string, unknown>) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase.from('bot_skills') as any)
            .update({ config })
            .eq('id', id)
            .select()
            .single()

        if (error) throw new Error(error.message)
        setSkills(prev => prev.map(s => s.id === id ? data as BotSkill : s))
        return data as BotSkill
    }

    const deleteSkill = async (id: string) => {
        const { error } = await supabase
            .from('bot_skills')
            .delete()
            .eq('id', id)

        if (error) throw new Error(error.message)
        setSkills(prev => prev.filter(s => s.id !== id))
    }

    // Get skill info by skill_id
    const getSkillInfo = (skillId: string) => {
        return AVAILABLE_SKILLS.find(s => s.skill_id === skillId)
    }

    useEffect(() => {
        fetchSkills()

        const channel = supabase
            .channel('skills-changes')
            .on(
                'postgres_changes' as const,
                { event: '*', schema: 'public', table: 'bot_skills' },
                () => fetchSkills()
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
        addSkill,
        toggleSkill,
        updateSkillConfig,
        deleteSkill,
        getSkillInfo,
        availableSkills: AVAILABLE_SKILLS,
        refetch: fetchSkills,
    }
}
