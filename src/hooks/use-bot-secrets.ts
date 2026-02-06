'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// Matches new secure schema
export interface BotSecret {
    id: string
    user_id: string
    key: string
    encrypted_value: string
    created_at: string
}

interface SecretInsert {
    key: string
    encrypted_value: string
}

// Simple encryption (for demo - use proper encryption in production)
const encrypt = (value: string): string => {
    if (typeof window !== 'undefined') {
        return btoa(value)
    }
    return Buffer.from(value).toString('base64')
}

const decrypt = (encrypted: string): string => {
    try {
        if (typeof window !== 'undefined') {
            return atob(encrypted)
        }
        return Buffer.from(encrypted, 'base64').toString()
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
            .order('key', { ascending: true })

        if (error) {
            setError(error.message)
        } else {
            setSecrets((data as BotSecret[]) || [])
        }
        setLoading(false)
    }, [supabase])

    const addSecret = async (key: string, value: string) => {
        const encryptedValue = encrypt(value)

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase.from('bot_secrets') as any)
            .insert({
                key,
                encrypted_value: encryptedValue,
            } as SecretInsert)
            .select()
            .single()

        if (error) throw new Error(error.message)
        setSecrets(prev => [...prev, data as BotSecret])
        return data as BotSecret
    }

    const updateSecret = async (id: string, value: string) => {
        const encryptedValue = encrypt(value)

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase.from('bot_secrets') as any)
            .update({ encrypted_value: encryptedValue })
            .eq('id', id)
            .select()
            .single()

        if (error) throw new Error(error.message)
        setSecrets(prev => prev.map(s => s.id === id ? data as BotSecret : s))
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

    const toggleReveal = (id: string) => {
        setRevealedIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) {
                next.delete(id)
            } else {
                next.add(id)
            }
            return next
        })
    }

    const isRevealed = (id: string) => revealedIds.has(id)

    const getDecryptedValue = (secret: BotSecret) => {
        return decrypt(secret.encrypted_value)
    }

    const getMaskedValue = (secret: BotSecret) => {
        const decrypted = decrypt(secret.encrypted_value)
        if (decrypted.length <= 4) return '****'
        return decrypted.substring(0, 4) + '****' + decrypted.substring(decrypted.length - 4)
    }

    useEffect(() => {
        fetchSecrets()
    }, [fetchSecrets])

    return {
        secrets,
        loading,
        error,
        addSecret,
        updateSecret,
        deleteSecret,
        toggleReveal,
        isRevealed,
        getDecryptedValue,
        getMaskedValue,
        refetch: fetchSecrets,
    }
}
