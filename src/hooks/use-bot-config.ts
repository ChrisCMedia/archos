'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ConfigValues {
    [key: string]: unknown
    system_prompt: string
    temperature: number
    model: string
    streaming: boolean
    autonomous_mode: boolean
    max_tokens?: number
    auto_reply?: boolean
    auto_execute?: boolean
    context_limit?: number
    voice_id?: string
}

const defaultConfig: ConfigValues = {
    system_prompt: '',
    temperature: 0.7,
    model: 'claude-opus-4',
    streaming: true,
    autonomous_mode: false,
    max_tokens: 2048,
    auto_reply: true,
    auto_execute: false,
    context_limit: 10,
}

export function useBotConfig() {
    const [config, setConfig] = useState<ConfigValues>(defaultConfig)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    // Parse config rows into structured object
    const parseConfig = (rows: Array<{ key: string; value: unknown }>): ConfigValues => {
        const configObj: ConfigValues = { ...defaultConfig }

        rows.forEach(row => {
            configObj[row.key] = row.value
        })

        return configObj
    }

    // Fetch all config
    const fetchConfig = useCallback(async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('bot_config')
            .select('key, value')

        if (error) {
            setError(error.message)
        } else if (data) {
            setConfig(parseConfig(data as Array<{ key: string; value: unknown }>))
        }
        setLoading(false)
    }, [supabase])

    // Update a config value
    const updateConfig = async (key: string, value: unknown) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from('bot_config') as any).upsert(
            { key, value },
            { onConflict: 'key' }
        )

        if (error) {
            throw new Error(error.message)
        }

        setConfig(prev => ({ ...prev, [key]: value }))
    }

    // Save multiple config values
    const saveConfig = async (values: Partial<ConfigValues>) => {
        const entries = Object.entries(values)

        for (const [key, value] of entries) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error } = await (supabase.from('bot_config') as any).upsert(
                { key, value },
                { onConflict: 'key' }
            )

            if (error) {
                console.error(`Failed to save config ${key}:`, error)
            }
        }

        setConfig(prev => ({ ...prev, ...values }))
    }

    // Subscribe to realtime changes
    useEffect(() => {
        fetchConfig()

        const channel = supabase
            .channel('bot-config-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'bot_config' },
                () => {
                    fetchConfig()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [fetchConfig, supabase])

    return {
        config,
        loading,
        error,
        updateConfig,
        saveConfig,
        refetch: fetchConfig,
    }
}
