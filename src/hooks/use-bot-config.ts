'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// Config values interface
interface ConfigValues {
    system_prompt?: string
    temperature?: number
    model?: string
    streaming?: boolean
    autonomous_mode?: boolean
    [key: string]: unknown
}

interface ConfigRow {
    id: string
    user_id: string
    key: string
    value: unknown
    updated_at: string
}

export function useBotConfig() {
    const [config, setConfig] = useState<ConfigValues>({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    // Parse config rows into object
    const parseConfig = (rows: Array<{ key: string; value: unknown }>): ConfigValues => {
        const result: ConfigValues = {}
        for (const row of rows) {
            result[row.key] = row.value
        }
        return result
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
        // Check if config exists first
        const { data: existing } = await supabase
            .from('bot_config')
            .select('id')
            .eq('key', key)
            .single()

        if (existing) {
            // Update existing
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error } = await (supabase.from('bot_config') as any)
                .update({ value })
                .eq('key', key)

            if (error) throw new Error(error.message)
        } else {
            // Insert new
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error } = await (supabase.from('bot_config') as any)
                .insert({ key, value })

            if (error) throw new Error(error.message)
        }

        setConfig(prev => ({ ...prev, [key]: value }))
    }

    // Save multiple config values
    const saveConfig = async (values: Partial<ConfigValues>) => {
        for (const [key, value] of Object.entries(values)) {
            await updateConfig(key, value)
        }
    }

    // Get a specific config value
    const getConfig = <T>(key: string, defaultValue: T): T => {
        return (config[key] as T) ?? defaultValue
    }

    useEffect(() => {
        fetchConfig()

        const channel = supabase
            .channel('config-changes')
            .on(
                'postgres_changes' as const,
                { event: '*', schema: 'public', table: 'bot_config' },
                () => fetchConfig()
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
        getConfig,
        refetch: fetchConfig,
    }
}
