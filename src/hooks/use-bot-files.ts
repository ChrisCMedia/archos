'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface BotFile {
    id: string
    name: string
    path: string
    size_bytes: number | null
    mime_type: string | null
    category: 'context' | 'template' | 'asset' | 'export'
    created_at: string
}

export function useBotFiles(category?: BotFile['category']) {
    const [files, setFiles] = useState<BotFile[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)
    const supabase = createClient()

    const fetchFiles = useCallback(async () => {
        setLoading(true)
        let query = supabase
            .from('bot_files')
            .select('*')
            .order('created_at', { ascending: false })

        if (category) {
            query = query.eq('category', category)
        }

        const { data, error } = await query

        if (error) {
            setError(error.message)
        } else {
            setFiles((data as BotFile[]) || [])
        }
        setLoading(false)
    }, [supabase, category])

    const uploadFile = async (file: File, fileCategory: BotFile['category'] = 'context') => {
        setUploading(true)
        try {
            // Upload to Supabase Storage
            const fileName = `${Date.now()}_${file.name}`
            const path = `bot-files/${fileCategory}/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('archos')
                .upload(path, file)

            if (uploadError) throw uploadError

            // Create database record
            const fileRecord = {
                name: file.name,
                path: path,
                size_bytes: file.size,
                mime_type: file.type,
                category: fileCategory,
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data, error: dbError } = await (supabase.from('bot_files') as any)
                .insert(fileRecord)
                .select()
                .single()

            if (dbError) throw dbError

            setFiles(prev => [data as BotFile, ...prev])
            return data as BotFile
        } finally {
            setUploading(false)
        }
    }

    const deleteFile = async (id: string, path: string) => {
        // Delete from storage
        await supabase.storage.from('archos').remove([path])

        // Delete from database
        const { error } = await supabase
            .from('bot_files')
            .delete()
            .eq('id', id)

        if (error) throw new Error(error.message)
        setFiles(prev => prev.filter(f => f.id !== id))
    }

    const getPublicUrl = (path: string) => {
        const { data } = supabase.storage.from('archos').getPublicUrl(path)
        return data.publicUrl
    }

    useEffect(() => {
        fetchFiles()
    }, [fetchFiles])

    return {
        files,
        loading,
        error,
        uploading,
        uploadFile,
        deleteFile,
        getPublicUrl,
        refetch: fetchFiles,
    }
}
