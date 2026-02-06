'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface BotModel {
    id: string
    name: string
    provider: string
    model_id: string
    enabled: boolean
    is_default: boolean
    config: Record<string, unknown>
}

interface BotVoice {
    id: string
    name: string
    provider: string
    voice_id: string
    language: string
    enabled: boolean
    is_default: boolean
}

export function useBotModels() {
    const [models, setModels] = useState<BotModel[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    const fetchModels = useCallback(async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('bot_models')
            .select('*')
            .eq('enabled', true)
            .order('name')

        if (error) {
            setError(error.message)
        } else {
            setModels((data as BotModel[]) || [])
        }
        setLoading(false)
    }, [supabase])

    const getDefaultModel = useCallback(() => {
        return models.find(m => m.is_default) || models[0] || null
    }, [models])

    useEffect(() => {
        fetchModels()
    }, [fetchModels])

    return {
        models,
        loading,
        error,
        getDefaultModel,
        refetch: fetchModels,
    }
}

export function useBotVoices() {
    const [voices, setVoices] = useState<BotVoice[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    const fetchVoices = useCallback(async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('bot_voices')
            .select('*')
            .eq('enabled', true)
            .order('name')

        if (error) {
            setError(error.message)
        } else {
            setVoices((data as BotVoice[]) || [])
        }
        setLoading(false)
    }, [supabase])

    const getDefaultVoice = useCallback(() => {
        return voices.find(v => v.is_default) || voices[0] || null
    }, [voices])

    useEffect(() => {
        fetchVoices()
    }, [fetchVoices])

    return {
        voices,
        loading,
        error,
        getDefaultVoice,
        refetch: fetchVoices,
    }
}
