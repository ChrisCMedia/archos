'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface BotSecret {
    id: string
    name: string
    encrypted_value: string
    provider: string | null
    created_at: string
    updated_at: string
}

// Basic encryption (for demo - use proper encryption in production)
const encrypt = (value: string): string => btoa(value)
const decrypt = (value: string): string => {
    try {
        return atob(value)
    } catch {
        return '***'
    }
}

export function useBotSecrets() {
    const [secrets, setSecrets] = useState<BotSecret[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set())
    const supabase = createClient()

    const fetchSecrets = useCallback(async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('bot_secrets')
            .select('*')
            .order('name')

        if (error) {
            setError(error.message)
        } else {
            setSecrets((data as BotSecret[]) || [])
        }
        setLoading(false)
    }, [supabase])

    const addSecret = async (name: string, value: string, provider?: string) => {
        const encrypted = encrypt(value)

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase.from('bot_secrets') as any)
            .insert({
                name,
                encrypted_value: encrypted,
                provider,
            })
            .select()
            .single()

        if (error) throw new Error(error.message)
        setSecrets(prev => [...prev, data as BotSecret].sort((a, b) => a.name.localeCompare(b.name)))
        return data as BotSecret
    }

    const deleteSecret = async (id: string) => {
        const { error } = await supabase
            .from('bot_secrets')
            .delete()
            .eq('id', id)

        if (error) throw new Error(error.message)
        setSecrets(prev => prev.filter(s => s.id !== id))
        setRevealedIds(prev => {
            const next = new Set(prev)
            next.delete(id)
            return next
        })
    }

    const revealSecret = (id: string) => {
        setRevealedIds(prev => new Set(prev).add(id))
        // Auto-hide after 10 seconds
        setTimeout(() => {
            setRevealedIds(prev => {
                const next = new Set(prev)
                next.delete(id)
                return next
            })
        }, 10000)
    }

    const getDecryptedValue = (secret: BotSecret) => {
        if (revealedIds.has(secret.id)) {
            return decrypt(secret.encrypted_value)
        }
        return '••••••••••••'
    }

    const copyToClipboard = async (secret: BotSecret) => {
        const value = decrypt(secret.encrypted_value)
        await navigator.clipboard.writeText(value)
    }

    useEffect(() => {
        fetchSecrets()
    }, [fetchSecrets])

    return {
        secrets,
        loading,
        error,
        addSecret,
        deleteSecret,
        revealSecret,
        getDecryptedValue,
        copyToClipboard,
        isRevealed: (id: string) => revealedIds.has(id),
        refetch: fetchSecrets,
    }
}
