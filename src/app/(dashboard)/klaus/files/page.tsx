'use client'

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Upload,
    File,
    FileText,
    Image,
    FileCode,
    Trash2,
    Download,
    FolderOpen,
    Loader2,
    AlertCircle,
    HardDrive
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { useBotFiles } from '@/hooks/use-bot-files'
import { Tables } from '@/lib/supabase/types'

type BotFile = Tables<'bot_files'>
type FileCategory = BotFile['category']

const categoryLabels: Record<FileCategory, string> = {
    context: 'Context',
    template: 'Templates',
    asset: 'Assets',
    export: 'Exports',
}

const categoryColors: Record<FileCategory, string> = {
    context: 'bg-sky-500/20 text-sky-400',
    template: 'bg-purple-500/20 text-purple-400',
    asset: 'bg-amber-500/20 text-amber-400',
    export: 'bg-emerald-500/20 text-emerald-400',
}

const getFileIcon = (mimeType: string | null) => {
    if (!mimeType) return File
    if (mimeType.startsWith('image/')) return Image
    if (mimeType.includes('text') || mimeType.includes('json')) return FileText
    if (mimeType.includes('javascript') || mimeType.includes('typescript')) return FileCode
    return File
}

const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '—'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function FilesPage() {
    const [categoryFilter, setCategoryFilter] = useState<FileCategory | 'all'>('all')
    const { files, loading, uploading, uploadFile, deleteFile, getPublicUrl } = useBotFiles(
        categoryFilter === 'all' ? undefined : categoryFilter
    )
    const { toast } = useToast()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [uploadCategory, setUploadCategory] = useState<FileCategory>('context')
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [fileToDelete, setFileToDelete] = useState<BotFile | null>(null)

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        try {
            await uploadFile(file, uploadCategory)
            toast({
                title: 'File uploaded',
                description: `${file.name} has been uploaded successfully.`,
            })
        } catch (err) {
            toast({
                title: 'Upload failed',
                description: 'Failed to upload file. Make sure Supabase Storage is configured.',
                variant: 'destructive',
            })
        }

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleDelete = async () => {
        if (!fileToDelete) return
        try {
            await deleteFile(fileToDelete.id, fileToDelete.path)
            toast({ title: 'File deleted' })
        } catch (err) {
            toast({
                title: 'Error',
                description: 'Failed to delete file',
                variant: 'destructive',
            })
        } finally {
            setDeleteDialogOpen(false)
            setFileToDelete(null)
        }
    }

    const handleDownload = (file: BotFile) => {
        const url = getPublicUrl(file.path)
        window.open(url, '_blank')
    }

    const totalSize = files.reduce((acc, f) => acc + (f.size_bytes || 0), 0)

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">File Manager</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage files for Klaus context and assets
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={uploadCategory} onValueChange={(v) => setUploadCategory(v as FileCategory)}>
                        <SelectTrigger className="w-[130px] bg-secondary border-border">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="context">Context</SelectItem>
                            <SelectItem value="template">Template</SelectItem>
                            <SelectItem value="asset">Asset</SelectItem>
                            <SelectItem value="export">Export</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                        {uploading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Upload className="w-4 h-4 mr-2" />
                        )}
                        Upload
                    </Button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={handleFileSelect}
                    />
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-card border-border">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <FolderOpen className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{files.length}</p>
                                <p className="text-xs text-muted-foreground">Total Files</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-card border-border">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-sky-500/10">
                                <HardDrive className="w-5 h-5 text-sky-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{formatFileSize(totalSize)}</p>
                                <p className="text-xs text-muted-foreground">Total Size</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Info */}
            <Card className="bg-amber-500/5 border-amber-500/20">
                <CardContent className="flex items-start gap-3 p-4">
                    <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                    <div>
                        <h3 className="font-medium text-amber-500">Storage Setup Required</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Create a storage bucket called &quot;archos&quot; in your Supabase dashboard for file uploads to work.
                            Go to Storage → New Bucket → Name it &quot;archos&quot; → Make it public.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Filter */}
            <div className="flex gap-2">
                <Button
                    variant={categoryFilter === 'all' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setCategoryFilter('all')}
                >
                    All
                </Button>
                {(['context', 'template', 'asset', 'export'] as FileCategory[]).map((cat) => (
                    <Button
                        key={cat}
                        variant={categoryFilter === cat ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setCategoryFilter(cat)}
                    >
                        {categoryLabels[cat]}
                    </Button>
                ))}
            </div>

            {/* File List */}
            <div className="space-y-2">
                <AnimatePresence>
                    {files.map((file) => {
                        const Icon = getFileIcon(file.mime_type)
                        return (
                            <motion.div
                                key={file.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <Card className="bg-card border-border hover:border-primary/30 transition-colors">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className="p-2 rounded-lg bg-secondary">
                                                    <Icon className="w-5 h-5 text-muted-foreground" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-medium truncate">{file.name}</h3>
                                                        <Badge className={categoryColors[file.category]}>
                                                            {file.category}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                                        <span>{formatFileSize(file.size_bytes)}</span>
                                                        <span>{new Date(file.created_at).toLocaleDateString()}</span>
                                                        {file.mime_type && <span>{file.mime_type}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDownload(file)}
                                                >
                                                    <Download className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() => {
                                                        setFileToDelete(file)
                                                        setDeleteDialogOpen(true)
                                                    }}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
            </div>

            {files.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <h3 className="font-medium mb-2">No files uploaded</h3>
                    <p className="text-sm mb-4">
                        Upload files for Klaus to use as context
                    </p>
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload File
                    </Button>
                </div>
            )}

            {/* Delete Confirmation */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="bg-card border-border">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete File</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete &quot;{fileToDelete?.name}&quot; from storage.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </motion.div>
    )
}
