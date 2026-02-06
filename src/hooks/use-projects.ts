'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// Matches new secure schema
export interface Project {
    id: string
    user_id: string
    client_id: string | null
    name: string
    status: 'planning' | 'active' | 'paused' | 'completed' | 'cancelled'
    value: number | null
    deadline: string | null
    created_at: string
}

interface ProjectInsert {
    name: string
    client_id?: string
    status?: string
    value?: number
    deadline?: string
}

interface ProjectUpdate {
    name?: string
    client_id?: string
    status?: string
    value?: number
    deadline?: string
}

export function useProjects(clientId?: string) {
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    const fetchProjects = useCallback(async () => {
        setLoading(true)
        let query = supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false })

        if (clientId) {
            query = query.eq('client_id', clientId)
        }

        const { data, error } = await query

        if (error) {
            setError(error.message)
        } else {
            setProjects((data as Project[]) || [])
        }
        setLoading(false)
    }, [supabase, clientId])

    const createProject = async (project: ProjectInsert) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase.from('projects') as any)
            .insert({
                name: project.name,
                client_id: project.client_id || null,
                status: project.status || 'active',
                value: project.value || null,
                deadline: project.deadline || null,
            })
            .select()
            .single()

        if (error) throw new Error(error.message)
        setProjects(prev => [data as Project, ...prev])
        return data as Project
    }

    const updateProject = async (id: string, updates: ProjectUpdate) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase.from('projects') as any)
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw new Error(error.message)
        setProjects(prev => prev.map(p => p.id === id ? data as Project : p))
        return data as Project
    }

    const deleteProject = async (id: string) => {
        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', id)

        if (error) throw new Error(error.message)
        setProjects(prev => prev.filter(p => p.id !== id))
    }

    useEffect(() => {
        fetchProjects()

        const channel = supabase
            .channel('projects-changes')
            .on(
                'postgres_changes' as const,
                { event: '*', schema: 'public', table: 'projects' },
                () => fetchProjects()
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [fetchProjects, supabase])

    return {
        projects,
        loading,
        error,
        createProject,
        updateProject,
        deleteProject,
        refetch: fetchProjects,
    }
}
