'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Project {
    id: string
    client_id: string
    name: string
    description: string | null
    status: 'planning' | 'active' | 'paused' | 'completed' | 'cancelled'
    budget: number | null
    currency: string
    deadline: string | null
    created_at: string
    updated_at: string
}

interface ProjectInsert {
    client_id: string
    name: string
    description?: string | null
    status?: 'planning' | 'active' | 'paused' | 'completed' | 'cancelled'
    budget?: number | null
    deadline?: string | null
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
            .insert(project)
            .select()
            .single()

        if (error) throw new Error(error.message)
        setProjects(prev => [data as Project, ...prev])
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
                'postgres_changes',
                { event: '*', schema: 'public', table: 'projects' },
                () => {
                    fetchProjects()
                }
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
        deleteProject,
        refetch: fetchProjects,
    }
}
