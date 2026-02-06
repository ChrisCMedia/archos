'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Plus, Search, Building2, Mail, Phone, MoreHorizontal, Loader2, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useClients, Client } from '@/hooks/use-clients'

const statusColors: Record<string, string> = {
    lead: 'bg-slate-500/20 text-slate-400',
    prospect: 'bg-sky-500/20 text-sky-400',
    active: 'bg-emerald-500/20 text-emerald-400',
    churned: 'bg-red-500/20 text-red-400',
}

export default function CRMPage() {
    const { clients, loading, createClient, updateClient, deleteClient } = useClients()
    const { toast } = useToast()
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const [newClient, setNewClient] = useState({ name: '', status: 'lead', industry: '', email: '', phone: '' })

    const filteredClients = clients.filter(client => {
        const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === 'all' || client.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const stats = {
        total: clients.length,
        leads: clients.filter(c => c.status === 'lead').length,
        active: clients.filter(c => c.status === 'active').length,
        prospects: clients.filter(c => c.status === 'prospect').length,
    }

    const handleCreate = async () => {
        if (!newClient.name.trim()) return
        setIsCreating(true)
        try {
            await createClient({
                name: newClient.name,
                status: newClient.status,
                industry: newClient.industry || undefined,
                contact_info: { email: newClient.email || undefined, phone: newClient.phone || undefined },
            })
            setIsCreateOpen(false)
            setNewClient({ name: '', status: 'lead', industry: '', email: '', phone: '' })
            toast({ title: 'Client created', description: `${newClient.name} added to CRM` })
        } catch { toast({ title: 'Error', description: 'Failed to create client', variant: 'destructive' }) }
        finally { setIsCreating(false) }
    }

    const handleStatusChange = async (client: Client, newStatus: string) => {
        try { await updateClient(client.id, { status: newStatus }); toast({ title: 'Status updated' }) }
        catch { toast({ title: 'Error', description: 'Failed to update', variant: 'destructive' }) }
    }

    const handleDelete = async (client: Client) => {
        try { await deleteClient(client.id); toast({ title: 'Client deleted' }) }
        catch { toast({ title: 'Error', variant: 'destructive' }) }
    }

    if (loading) return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20">
                        <Users className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">CRM</h1>
                        <p className="text-muted-foreground">Manage clients</p>
                    </div>
                </div>
                <Button onClick={() => setIsCreateOpen(true)}><Plus className="w-4 h-4 mr-2" />New Client</Button>
            </div>

            <div className="grid grid-cols-4 gap-4">
                {[{ label: 'Total', value: stats.total }, { label: 'Leads', value: stats.leads, color: 'text-slate-400' }, { label: 'Prospects', value: stats.prospects, color: 'text-sky-400' }, { label: 'Active', value: stats.active, color: 'text-emerald-400' }].map(s => (
                    <Card key={s.label} className="bg-card border-border"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle></CardHeader><CardContent><p className={`text-2xl font-bold ${s.color || ''}`}>{s.value}</p></CardContent></Card>
                ))}
            </div>

            <div className="flex gap-4">
                <div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="pl-10 bg-secondary border-border" /></div>
                <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-40 bg-secondary border-border"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="lead">Lead</SelectItem><SelectItem value="prospect">Prospect</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="churned">Churned</SelectItem></SelectContent></Select>
            </div>

            <div className="space-y-2">
                {filteredClients.map(client => (
                    <Card key={client.id} className="bg-card border-border hover:bg-secondary/30 transition-colors">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center"><span className="text-lg font-bold text-primary">{client.name.charAt(0).toUpperCase()}</span></div>
                                    <div>
                                        <Link href={`/crm/${client.id}`} className="font-medium hover:text-primary">{client.name}</Link>
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                            {client.industry && <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{client.industry}</span>}
                                            {client.contact_info?.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{client.contact_info.email}</span>}
                                            {client.contact_info?.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{client.contact_info.phone}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge className={statusColors[client.status]}>{client.status}</Badge>
                                    <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild><Link href={`/crm/${client.id}`}>View</Link></DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleStatusChange(client, 'prospect')}><TrendingUp className="w-4 h-4 mr-2" />Prospect</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleStatusChange(client, 'active')}>Active</DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(client)}>Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredClients.length === 0 && <div className="text-center py-12"><Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" /><h3 className="text-lg font-medium mb-2">No clients found</h3></div>}

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="bg-card border-border"><DialogHeader><DialogTitle>New Client</DialogTitle><DialogDescription>Add a new client</DialogDescription></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2"><Label>Name *</Label><Input value={newClient.name} onChange={(e) => setNewClient({ ...newClient, name: e.target.value })} className="bg-secondary border-border" /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Status</Label><Select value={newClient.status} onValueChange={(v) => setNewClient({ ...newClient, status: v })}><SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="lead">Lead</SelectItem><SelectItem value="prospect">Prospect</SelectItem><SelectItem value="active">Active</SelectItem></SelectContent></Select></div>
                            <div className="space-y-2"><Label>Industry</Label><Input value={newClient.industry} onChange={(e) => setNewClient({ ...newClient, industry: e.target.value })} className="bg-secondary border-border" /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Email</Label><Input value={newClient.email} onChange={(e) => setNewClient({ ...newClient, email: e.target.value })} className="bg-secondary border-border" /></div>
                            <div className="space-y-2"><Label>Phone</Label><Input value={newClient.phone} onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })} className="bg-secondary border-border" /></div>
                        </div>
                    </div>
                    <DialogFooter><Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button><Button onClick={handleCreate} disabled={!newClient.name.trim() || isCreating}>{isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Create</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    )
}
