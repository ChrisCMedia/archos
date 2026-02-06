'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// Matches new secure schema
export interface KnowledgeEntry {
    id: string
    user_id: string
    title: string
    category: string | null
    content: string | null
    tags: string[] | null
    created_at: string
}

interface KnowledgeInsert {
    title: string
    category?: string
    content?: string
    tags?: string[]
}

interface KnowledgeUpdate {
    title?: string
    category?: string
    content?: string
    tags?: string[]
}

export function useKnowledge(category?: string) {
    const [entries, setEntries] = useState<KnowledgeEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    const fetchEntries = useCallback(async () => {
        setLoading(true)
        let query = supabase
            .from('knowledge_vault')
            .select('*')
            .order('created_at', { ascending: false })

        if (category && category !== 'All') {
            query = query.eq('category', category)
        }

        const { data, error } = await query

        if (error) {
            setError(error.message)
        } else {
            setEntries((data as KnowledgeEntry[]) || [])
        }
        setLoading(false)
    }, [supabase, category])

    const createEntry = async (entry: KnowledgeInsert) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase.from('knowledge_vault') as any)
            .insert({
                title: entry.title,
                category: entry.category || 'General',
                content: entry.content || '',
                tags: entry.tags || [],
            })
            .select()
            .single()

        if (error) throw new Error(error.message)
        setEntries(prev => [data as KnowledgeEntry, ...prev])
        return data as KnowledgeEntry
    }

    const updateEntry = async (id: string, updates: KnowledgeUpdate) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase.from('knowledge_vault') as any)
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw new Error(error.message)
        setEntries(prev => prev.map(e => e.id === id ? data as KnowledgeEntry : e))
        return data as KnowledgeEntry
    }

    const deleteEntry = async (id: string) => {
        const { error } = await supabase
            .from('knowledge_vault')
            .delete()
            .eq('id', id)

        if (error) throw new Error(error.message)
        setEntries(prev => prev.filter(e => e.id !== id))
    }

    const getCategories = useCallback((): string[] => {
        const cats = entries.map(e => e.category).filter((c): c is string => c !== null)
        const uniqueCats = Array.from(new Set(cats)).sort()
        return ['All', ...uniqueCats]
    }, [entries])

    useEffect(() => {
        fetchEntries()

        const channel = supabase
            .channel('knowledge-changes')
            .on(
                'postgres_changes' as const,
                { event: '*', schema: 'public', table: 'knowledge_vault' },
                () => fetchEntries()
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [fetchEntries, supabase])

    return {
        entries,
        loading,
        error,
        createEntry,
        updateEntry,
        deleteEntry,
        getCategories,
        refetch: fetchEntries,
    }
}
