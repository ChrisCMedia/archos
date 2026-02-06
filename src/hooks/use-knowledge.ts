'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface KnowledgeEntry {
    id: string
    title: string
    content: string
    category: string
    tags: string[]
    is_pinned: boolean
    created_at: string
    updated_at: string
}

interface KnowledgeInsert {
    title: string
    content?: string
    category?: string
    tags?: string[]
    is_pinned?: boolean
}

interface KnowledgeUpdate {
    title?: string
    content?: string
    category?: string
    tags?: string[]
    is_pinned?: boolean
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
            .order('is_pinned', { ascending: false })
            .order('updated_at', { ascending: false })

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
            .insert(entry)
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

    const togglePin = async (id: string, isPinned: boolean) => {
        return updateEntry(id, { is_pinned: !isPinned })
    }

    const getCategories = useCallback(() => {
        const cats = new Set(entries.map(e => e.category))
        return ['All', ...Array.from(cats).sort()]
    }, [entries])

    useEffect(() => {
        fetchEntries()

        const channel = supabase
            .channel('knowledge-changes')
            .on(
                'postgres_changes' as const,
                { event: '*', schema: 'public', table: 'knowledge_vault' },
                () => {
                    fetchEntries()
                }
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
        togglePin,
        getCategories,
        refetch: fetchEntries,
    }
}
