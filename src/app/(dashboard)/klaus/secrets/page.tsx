'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Plus,
    Key,
    Eye,
    EyeOff,
    Trash2,
    Copy,
    Shield,
    AlertTriangle,
    Check,
    Loader2
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useBotSecrets } from '@/hooks/use-bot-secrets'

const providers = [
    { value: 'openai', label: 'OpenAI' },
    { value: 'anthropic', label: 'Anthropic' },
    { value: 'google', label: 'Google AI' },
    { value: 'telegram', label: 'Telegram' },
    { value: 'github', label: 'GitHub' },
    { value: 'supabase', label: 'Supabase' },
    { value: 'other', label: 'Other' },
]

const providerColors: Record<string, string> = {
    openai: 'bg-emerald-500/10 text-emerald-500',
    anthropic: 'bg-orange-500/10 text-orange-500',
    google: 'bg-blue-500/10 text-blue-500',
    telegram: 'bg-sky-500/10 text-sky-500',
    github: 'bg-purple-500/10 text-purple-500',
    supabase: 'bg-emerald-500/10 text-emerald-500',
    other: 'bg-slate-500/10 text-slate-500',
}

export default function SecretVaultPage() {
    const { secrets, loading, addSecret, deleteSecret, revealSecret, getDecryptedValue, copyToClipboard, isRevealed } = useBotSecrets()
    const { toast } = useToast()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [secretToDelete, setSecretToDelete] = useState<string | null>(null)
    const [revealedSecrets, setRevealedSecrets] = useState<Set<string>>(new Set())
    const [isAdding, setIsAdding] = useState(false)
    const [newSecret, setNewSecret] = useState({
        name: '',
        value: '',
        provider: 'other',
    })

    const handleReveal = (secretId: string) => {
        if (revealedSecrets.has(secretId)) {
            setRevealedSecrets(prev => {
                const next = new Set(prev)
                next.delete(secretId)
                return next
            })
        } else {
            setRevealedSecrets(prev => new Set(prev).add(secretId))
            // Auto-hide after 10 seconds
            setTimeout(() => {
                setRevealedSecrets(prev => {
                    const next = new Set(prev)
                    next.delete(secretId)
                    return next
                })
            }, 10000)
        }
    }

    const handleCopy = async (secretId: string) => {
        const secret = secrets.find(s => s.id === secretId)
        if (secret) {
            await copyToClipboard(secret)
            toast({
                title: 'Copied to clipboard',
                description: 'Secret value copied securely.',
            })
        }
    }

    const handleAdd = async () => {
        if (!newSecret.name || !newSecret.value) return

        setIsAdding(true)
        try {
            await addSecret(newSecret.name, newSecret.value, newSecret.provider)
            toast({
                title: 'Secret added',
                description: `"${newSecret.name}" has been securely stored.`,
            })
            setNewSecret({ name: '', value: '', provider: 'other' })
            setIsDialogOpen(false)
        } catch (err) {
            toast({
                title: 'Error',
                description: 'Failed to add secret',
                variant: 'destructive',
            })
        } finally {
            setIsAdding(false)
        }
    }

    const handleDelete = async () => {
        if (!secretToDelete) return

        try {
            await deleteSecret(secretToDelete)
            toast({
                title: 'Secret deleted',
                description: 'The secret has been permanently removed.',
            })
        } catch (err) {
            toast({
                title: 'Error',
                description: 'Failed to delete secret',
                variant: 'destructive',
            })
        } finally {
            setDeleteDialogOpen(false)
            setSecretToDelete(null)
        }
    }

    const maskValue = (value: string) => {
        if (value.length <= 8) return '••••••••'
        return value.slice(0, 4) + '••••••••' + value.slice(-4)
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
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Secret Vault</h1>
                    <p className="text-muted-foreground mt-1">
                        Securely manage API keys and credentials
                    </p>
                </div>
                <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Secret
                </Button>
            </div>

            {/* Security Notice */}
            <Card className="bg-amber-500/5 border-amber-500/20">
                <CardContent className="flex items-start gap-3 p-4">
                    <Shield className="w-5 h-5 text-amber-500 mt-0.5" />
                    <div>
                        <h3 className="font-medium text-amber-500">Security Notice</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Secrets are encrypted before storage. Revealed values auto-hide after 10 seconds.
                            Never share these values publicly.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Secrets List */}
            <div className="space-y-3">
                <AnimatePresence>
                    {secrets.map((secret) => {
                        const secretRevealed = isRevealed(secret.id)
                        const displayValue = secretRevealed
                            ? getDecryptedValue(secret)
                            : maskValue(secret.encrypted_value)

                        return (
                            <motion.div
                                key={secret.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <Card className="bg-card border-border">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className="p-2 rounded-lg bg-secondary">
                                                    <Key className="w-4 h-4 text-primary" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-medium text-sm truncate">
                                                            {secret.name}
                                                        </h3>
                                                        {secret.provider && (
                                                            <Badge className={`text-[10px] ${providerColors[secret.provider] || providerColors.other}`}>
                                                                {secret.provider}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className={`text-xs font-mono mt-1 ${secretRevealed ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                        {displayValue}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => revealSecret(secret.id)}
                                                >
                                                    {secretRevealed ? (
                                                        <EyeOff className="w-4 h-4" />
                                                    ) : (
                                                        <Eye className="w-4 h-4" />
                                                    )}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => handleCopy(secret.id)}
                                                >
                                                    <Copy className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                                    onClick={() => {
                                                        setSecretToDelete(secret.id)
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

            {secrets.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    <Key className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <h3 className="font-medium mb-2">No secrets stored</h3>
                    <p className="text-sm mb-4">
                        Add API keys to enable Klaus&apos;s integrations
                    </p>
                    <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Secret
                    </Button>
                </div>
            )}

            {/* Add Secret Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-card border-border">
                    <DialogHeader>
                        <DialogTitle>Add New Secret</DialogTitle>
                        <DialogDescription>
                            Store a new API key or credential securely
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Name</Label>
                            <Input
                                value={newSecret.name}
                                onChange={(e) => setNewSecret({ ...newSecret, name: e.target.value })}
                                placeholder="e.g., OPENAI_API_KEY"
                                className="bg-secondary border-border"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Value</Label>
                            <Input
                                type="password"
                                value={newSecret.value}
                                onChange={(e) => setNewSecret({ ...newSecret, value: e.target.value })}
                                placeholder="Enter the secret value"
                                className="bg-secondary border-border"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Provider</Label>
                            <Select
                                value={newSecret.provider}
                                onValueChange={(v) => setNewSecret({ ...newSecret, provider: v })}
                            >
                                <SelectTrigger className="bg-secondary border-border">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {providers.map((provider) => (
                                        <SelectItem key={provider.value} value={provider.value}>
                                            {provider.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAdd}
                            disabled={!newSecret.name || !newSecret.value || isAdding}
                        >
                            {isAdding ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Check className="w-4 h-4 mr-2" />
                            )}
                            Add Secret
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="bg-card border-border">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-destructive" />
                            Delete Secret
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. The secret will be permanently removed
                            and any integrations using it will stop working.
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
