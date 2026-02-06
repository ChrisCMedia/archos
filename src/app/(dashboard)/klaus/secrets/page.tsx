'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Key, Plus, Trash2, Eye, EyeOff, Loader2, Copy, Shield } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useBotSecrets, BotSecret } from '@/hooks/use-bot-secrets'

export default function SecretsPage() {
    const { secrets, loading, addSecret, deleteSecret, toggleReveal, isRevealed, getDecryptedValue, getMaskedValue } = useBotSecrets()
    const { toast } = useToast()
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const [newSecret, setNewSecret] = useState({ key: '', value: '' })

    const handleCreate = async () => {
        if (!newSecret.key.trim() || !newSecret.value.trim()) return
        setIsCreating(true)
        try {
            await addSecret(newSecret.key, newSecret.value)
            setIsCreateOpen(false)
            setNewSecret({ key: '', value: '' })
            toast({ title: 'Secret added' })
        } catch { toast({ title: 'Error', variant: 'destructive' }) }
        finally { setIsCreating(false) }
    }

    const handleDelete = async (id: string, key: string) => {
        try {
            await deleteSecret(id)
            toast({ title: 'Secret deleted', description: `${key} removed` })
        } catch { toast({ title: 'Error', variant: 'destructive' }) }
    }

    const handleCopy = (secret: BotSecret) => {
        navigator.clipboard.writeText(getDecryptedValue(secret))
        toast({ title: 'Copied', description: 'Value copied to clipboard' })
    }

    if (loading) return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-red-500/20 to-rose-500/20">
                        <Key className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Secrets</h1>
                        <p className="text-muted-foreground">API keys and credentials</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="outline"><Shield className="w-3 h-3 mr-1" />{secrets.length} stored</Badge>
                    <Button onClick={() => setIsCreateOpen(true)}><Plus className="w-4 h-4 mr-2" />Add Secret</Button>
                </div>
            </div>

            <Card className="bg-amber-500/5 border-amber-500/20">
                <CardContent className="p-4"><p className="text-sm text-amber-400">🔐 Secrets are encrypted. Never share them publicly. Only you can access these values.</p></CardContent>
            </Card>

            <div className="space-y-3">
                {secrets.map(secret => (
                    <Card key={secret.id} className="bg-card border-border">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 rounded-lg bg-secondary"><Key className="w-5 h-5 text-muted-foreground" /></div>
                                    <div>
                                        <p className="font-medium font-mono">{secret.key}</p>
                                        <p className="text-sm text-muted-foreground font-mono">
                                            {isRevealed(secret.id) ? getDecryptedValue(secret) : getMaskedValue(secret)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => toggleReveal(secret.id)}>
                                        {isRevealed(secret.id) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleCopy(secret)}><Copy className="w-4 h-4" /></Button>
                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(secret.id, secret.key)}><Trash2 className="w-4 h-4" /></Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {secrets.length === 0 && <div className="text-center py-12"><Key className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" /><h3 className="text-lg font-medium mb-2">No secrets stored</h3><p className="text-muted-foreground text-sm">Add your first API key or credential</p></div>}

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="bg-card border-border"><DialogHeader><DialogTitle>Add Secret</DialogTitle><DialogDescription>Store an API key or credential</DialogDescription></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2"><Label>Key Name</Label><Input value={newSecret.key} onChange={(e) => setNewSecret({ ...newSecret, key: e.target.value })} placeholder="e.g. OPENAI_API_KEY" className="bg-secondary border-border font-mono" /></div>
                        <div className="space-y-2"><Label>Value</Label><Input type="password" value={newSecret.value} onChange={(e) => setNewSecret({ ...newSecret, value: e.target.value })} placeholder="sk-..." className="bg-secondary border-border font-mono" /></div>
                    </div>
                    <DialogFooter><Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button><Button onClick={handleCreate} disabled={!newSecret.key.trim() || !newSecret.value.trim() || isCreating}>{isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Add Secret</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    )
}
