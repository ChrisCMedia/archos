'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    BookOpen,
    Plus,
    Edit3,
    Trash2,
    Pin,
    PinOff,
    Folder,
    FileText,
    Search,
    Save,
    X,
    Loader2,
    ChevronRight
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
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
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useKnowledge, KnowledgeEntry } from '@/hooks/use-knowledge'

export default function KnowledgeVaultPage() {
    const { entries, loading, createEntry, updateEntry, deleteEntry, togglePin, getCategories } = useKnowledge()
    const { toast } = useToast()
    const [selectedEntry, setSelectedEntry] = useState<KnowledgeEntry | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [isNewDialogOpen, setIsNewDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [entryToDelete, setEntryToDelete] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [isSaving, setIsSaving] = useState(false)

    const [editForm, setEditForm] = useState({
        title: '',
        content: '',
        category: '',
    })

    const [newEntry, setNewEntry] = useState({
        title: '',
        content: '',
        category: 'General',
    })

    const categories = getCategories()

    // Filter entries
    const filteredEntries = entries.filter(entry => {
        const matchesSearch = entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entry.content.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = selectedCategory === 'All' || entry.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    // Select first entry on load
    useEffect(() => {
        if (entries.length > 0 && !selectedEntry) {
            setSelectedEntry(entries[0])
        }
    }, [entries, selectedEntry])

    const handleSelectEntry = (entry: KnowledgeEntry) => {
        setSelectedEntry(entry)
        setIsEditing(false)
    }

    const handleEdit = () => {
        if (selectedEntry) {
            setEditForm({
                title: selectedEntry.title,
                content: selectedEntry.content,
                category: selectedEntry.category,
            })
            setIsEditing(true)
        }
    }

    const handleSave = async () => {
        if (!selectedEntry) return
        setIsSaving(true)
        try {
            const updated = await updateEntry(selectedEntry.id, editForm)
            setSelectedEntry(updated)
            setIsEditing(false)
            toast({
                title: 'Saved',
                description: 'Entry updated successfully.',
            })
        } catch {
            toast({
                title: 'Error',
                description: 'Failed to save entry',
                variant: 'destructive',
            })
        } finally {
            setIsSaving(false)
        }
    }

    const handleCreate = async () => {
        if (!newEntry.title.trim()) return
        setIsSaving(true)
        try {
            const created = await createEntry(newEntry)
            setSelectedEntry(created)
            setNewEntry({ title: '', content: '', category: 'General' })
            setIsNewDialogOpen(false)
            toast({
                title: 'Created',
                description: 'New entry added to Knowledge Vault.',
            })
        } catch {
            toast({
                title: 'Error',
                description: 'Failed to create entry',
                variant: 'destructive',
            })
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!entryToDelete) return
        try {
            await deleteEntry(entryToDelete)
            if (selectedEntry?.id === entryToDelete) {
                setSelectedEntry(entries.find(e => e.id !== entryToDelete) || null)
            }
            toast({
                title: 'Deleted',
                description: 'Entry removed from Knowledge Vault.',
            })
        } catch {
            toast({
                title: 'Error',
                description: 'Failed to delete entry',
                variant: 'destructive',
            })
        } finally {
            setDeleteDialogOpen(false)
            setEntryToDelete(null)
        }
    }

    const handleTogglePin = async (entry: KnowledgeEntry) => {
        try {
            const updated = await togglePin(entry.id, entry.is_pinned)
            if (selectedEntry?.id === entry.id) {
                setSelectedEntry(updated)
            }
            toast({
                title: entry.is_pinned ? 'Unpinned' : 'Pinned',
                description: `Entry ${entry.is_pinned ? 'unpinned' : 'pinned'}.`,
            })
        } catch {
            toast({
                title: 'Error',
                description: 'Failed to toggle pin',
                variant: 'destructive',
            })
        }
    }

    // Simple markdown renderer
    const renderMarkdown = (content: string) => {
        const lines = content.split('\n')
        return lines.map((line, i) => {
            // Headers
            if (line.startsWith('### ')) {
                return <h3 key={i} className="text-lg font-semibold mt-4 mb-2">{line.slice(4)}</h3>
            }
            if (line.startsWith('## ')) {
                return <h2 key={i} className="text-xl font-semibold mt-6 mb-3">{line.slice(3)}</h2>
            }
            if (line.startsWith('# ')) {
                return <h1 key={i} className="text-2xl font-bold mt-6 mb-4">{line.slice(2)}</h1>
            }
            // Code blocks
            if (line.startsWith('```')) {
                return null // Skip code fence markers
            }
            // List items
            if (line.startsWith('- ')) {
                return <li key={i} className="ml-4 text-muted-foreground">{line.slice(2)}</li>
            }
            if (line.startsWith('- [ ] ')) {
                return <li key={i} className="ml-4 flex items-center gap-2">
                    <input type="checkbox" disabled className="rounded" />
                    <span className="text-muted-foreground">{line.slice(6)}</span>
                </li>
            }
            // Bold
            if (line.includes('**')) {
                const parts = line.split(/\*\*(.*?)\*\*/g)
                return <p key={i} className="text-muted-foreground">
                    {parts.map((part, j) => j % 2 === 1 ? <strong key={j} className="text-foreground">{part}</strong> : part)}
                </p>
            }
            // Empty lines
            if (line.trim() === '') {
                return <br key={i} />
            }
            // Regular text
            return <p key={i} className="text-muted-foreground">{line}</p>
        })
    }

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
            className="h-[calc(100vh-8rem)]"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                        <BookOpen className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Knowledge Vault</h1>
                        <p className="text-muted-foreground">Your personal wiki and documentation</p>
                    </div>
                </div>
                <Button onClick={() => setIsNewDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Entry
                </Button>
            </div>

            {/* Main Layout */}
            <div className="flex gap-6 h-[calc(100%-5rem)]">
                {/* Sidebar */}
                <Card className="w-80 flex-shrink-0 bg-card border-border">
                    <CardContent className="p-4 h-full flex flex-col">
                        {/* Search */}
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search entries..."
                                className="pl-10 bg-secondary border-border"
                            />
                        </div>

                        {/* Categories */}
                        <div className="flex flex-wrap gap-1 mb-4">
                            {categories.map(cat => (
                                <Badge
                                    key={cat}
                                    variant={selectedCategory === cat ? 'default' : 'outline'}
                                    className="cursor-pointer text-xs"
                                    onClick={() => setSelectedCategory(cat)}
                                >
                                    {cat === 'All' ? <Folder className="w-3 h-3 mr-1" /> : null}
                                    {cat}
                                </Badge>
                            ))}
                        </div>

                        {/* Entries List */}
                        <ScrollArea className="flex-1 -mx-2 px-2">
                            <div className="space-y-1">
                                <AnimatePresence>
                                    {filteredEntries.map(entry => (
                                        <motion.div
                                            key={entry.id}
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <button
                                                onClick={() => handleSelectEntry(entry)}
                                                className={`w-full text-left p-3 rounded-lg transition-colors flex items-start gap-2 ${selectedEntry?.id === entry.id
                                                        ? 'bg-primary/10 border border-primary/20'
                                                        : 'hover:bg-secondary'
                                                    }`}
                                            >
                                                <FileText className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-1">
                                                        {entry.is_pinned && (
                                                            <Pin className="w-3 h-3 text-amber-500" />
                                                        )}
                                                        <span className="text-sm font-medium truncate">
                                                            {entry.title}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">
                                                        {entry.category}
                                                    </span>
                                                </div>
                                                {selectedEntry?.id === entry.id && (
                                                    <ChevronRight className="w-4 h-4 text-primary" />
                                                )}
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* Content Area */}
                <Card className="flex-1 bg-card border-border overflow-hidden">
                    <CardContent className="p-0 h-full flex flex-col">
                        {selectedEntry ? (
                            <>
                                {/* Entry Header */}
                                <div className="flex items-center justify-between p-4 border-b border-border">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline">{selectedEntry.category}</Badge>
                                        {selectedEntry.is_pinned && (
                                            <Badge variant="secondary" className="bg-amber-500/10 text-amber-500">
                                                <Pin className="w-3 h-3 mr-1" />
                                                Pinned
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {isEditing ? (
                                            <>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setIsEditing(false)}
                                                >
                                                    <X className="w-4 h-4 mr-1" />
                                                    Cancel
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={handleSave}
                                                    disabled={isSaving}
                                                >
                                                    {isSaving ? (
                                                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                                    ) : (
                                                        <Save className="w-4 h-4 mr-1" />
                                                    )}
                                                    Save
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleTogglePin(selectedEntry)}
                                                >
                                                    {selectedEntry.is_pinned ? (
                                                        <PinOff className="w-4 h-4" />
                                                    ) : (
                                                        <Pin className="w-4 h-4" />
                                                    )}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={handleEdit}
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive"
                                                    onClick={() => {
                                                        setEntryToDelete(selectedEntry.id)
                                                        setDeleteDialogOpen(true)
                                                    }}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Entry Content */}
                                <ScrollArea className="flex-1 p-6">
                                    {isEditing ? (
                                        <div className="space-y-4 max-w-3xl">
                                            <div className="space-y-2">
                                                <Label>Title</Label>
                                                <Input
                                                    value={editForm.title}
                                                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                                    className="text-lg font-semibold"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Category</Label>
                                                <Input
                                                    value={editForm.category}
                                                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Content (Markdown)</Label>
                                                <Textarea
                                                    value={editForm.content}
                                                    onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                                                    className="min-h-[400px] font-mono text-sm"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <article className="prose prose-invert max-w-3xl">
                                            <h1 className="text-3xl font-bold mb-6">{selectedEntry.title}</h1>
                                            <div className="space-y-0">
                                                {renderMarkdown(selectedEntry.content)}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-8 pt-4 border-t border-border">
                                                Last updated: {new Date(selectedEntry.updated_at).toLocaleString()}
                                            </p>
                                        </article>
                                    )}
                                </ScrollArea>
                            </>
                        ) : (
                            <div className="h-full flex items-center justify-center text-muted-foreground">
                                <div className="text-center">
                                    <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
                                    <p>Select an entry or create a new one</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* New Entry Dialog */}
            <Dialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen}>
                <DialogContent className="bg-card border-border max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>New Knowledge Entry</DialogTitle>
                        <DialogDescription>
                            Create a new documentation entry
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input
                                value={newEntry.title}
                                onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                                placeholder="Entry title"
                                className="bg-secondary border-border"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Input
                                value={newEntry.category}
                                onChange={(e) => setNewEntry({ ...newEntry, category: e.target.value })}
                                placeholder="e.g. Technical, Notes, Templates"
                                className="bg-secondary border-border"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Content (Markdown)</Label>
                            <Textarea
                                value={newEntry.content}
                                onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                                placeholder="Write your content in Markdown..."
                                className="min-h-[200px] bg-secondary border-border font-mono text-sm"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsNewDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreate}
                            disabled={!newEntry.title.trim() || isSaving}
                        >
                            {isSaving ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Plus className="w-4 h-4 mr-2" />
                            )}
                            Create Entry
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="bg-card border-border">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Entry</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this entry? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </motion.div>
    )
}
