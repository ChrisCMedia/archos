'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
    Plus,
    Search,
    MoreHorizontal,
    Building2,
    Mail,
    Phone,
    ArrowRight,
    Loader2,
    Users,
    TrendingUp,
    AlertCircle
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useClients } from '@/hooks/use-clients'
import { Tables } from '@/lib/supabase/types'

type Client = Tables<'clients'>
type ClientStatus = Client['status']

const statusColors: Record<ClientStatus, string> = {
    lead: 'bg-slate-500/20 text-slate-400',
    prospect: 'bg-sky-500/20 text-sky-400',
    active: 'bg-emerald-500/20 text-emerald-400',
    churned: 'bg-red-500/20 text-red-400',
}

const industries = [
    'Technology',
    'Healthcare',
    'Finance',
    'Retail',
    'Manufacturing',
    'Consulting',
    'Real Estate',
    'Education',
    'Other',
]

export default function CRMPage() {
    const { clients, loading, createClient, deleteClient } = useClients()
    const { toast } = useToast()
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<ClientStatus | 'all'>('all')
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const [newClient, setNewClient] = useState({
        name: '',
        email: '',
        phone: '',
        industry: '',
        status: 'lead' as ClientStatus,
    })

    const filteredClients = clients.filter(client => {
        const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            client.industry?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === 'all' || client.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const clientStats = {
        total: clients.length,
        active: clients.filter(c => c.status === 'active').length,
        prospects: clients.filter(c => c.status === 'prospect').length,
        leads: clients.filter(c => c.status === 'lead').length,
    }

    const handleCreate = async () => {
        if (!newClient.name) return

        setIsCreating(true)
        try {
            await createClient({
                name: newClient.name,
                email: newClient.email || null,
                phone: newClient.phone || null,
                industry: newClient.industry || null,
                status: newClient.status,
            })
            toast({
                title: 'Client created',
                description: `${newClient.name} has been added to your CRM.`,
            })
            setNewClient({ name: '', email: '', phone: '', industry: '', status: 'lead' })
            setIsDialogOpen(false)
        } catch (err) {
            toast({
                title: 'Error',
                description: 'Failed to create client',
                variant: 'destructive',
            })
        } finally {
            setIsCreating(false)
        }
    }

    const handleDelete = async (client: Client) => {
        try {
            await deleteClient(client.id)
            toast({
                title: 'Client deleted',
                description: `${client.name} has been removed.`,
            })
        } catch (err) {
            toast({
                title: 'Error',
                description: 'Failed to delete client',
                variant: 'destructive',
            })
        }
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
                    <h1 className="text-3xl font-bold tracking-tight">CRM</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage clients and track relationships
                    </p>
                </div>
                <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Client
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-card border-border">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <Users className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{clientStats.total}</p>
                                <p className="text-xs text-muted-foreground">Total Clients</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-card border-border">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-emerald-500/10">
                                <TrendingUp className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{clientStats.active}</p>
                                <p className="text-xs text-muted-foreground">Active</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-card border-border">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-sky-500/10">
                                <Building2 className="w-5 h-5 text-sky-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{clientStats.prospects}</p>
                                <p className="text-xs text-muted-foreground">Prospects</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-card border-border">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-slate-500/10">
                                <AlertCircle className="w-5 h-5 text-slate-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{clientStats.leads}</p>
                                <p className="text-xs text-muted-foreground">Leads</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search clients..."
                        className="pl-9 bg-secondary border-border"
                    />
                </div>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ClientStatus | 'all')}>
                    <SelectTrigger className="w-[160px] bg-secondary border-border">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="lead">Lead</SelectItem>
                        <SelectItem value="prospect">Prospect</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="churned">Churned</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Client List */}
            <div className="space-y-3">
                <AnimatePresence>
                    {filteredClients.map((client) => (
                        <motion.div
                            key={client.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <Card className="bg-card border-border hover:border-primary/30 transition-colors">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                <span className="text-lg font-bold text-primary">
                                                    {client.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-medium truncate">{client.name}</h3>
                                                    <Badge className={statusColors[client.status]}>
                                                        {client.status}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                                    {client.industry && (
                                                        <span className="flex items-center gap-1">
                                                            <Building2 className="w-3 h-3" />
                                                            {client.industry}
                                                        </span>
                                                    )}
                                                    {client.email && (
                                                        <span className="flex items-center gap-1">
                                                            <Mail className="w-3 h-3" />
                                                            {client.email}
                                                        </span>
                                                    )}
                                                    {client.phone && (
                                                        <span className="flex items-center gap-1">
                                                            <Phone className="w-3 h-3" />
                                                            {client.phone}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Link href={`/crm/${client.id}`}>
                                                <Button variant="ghost" size="sm" className="gap-1">
                                                    View
                                                    <ArrowRight className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-card border-border">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/crm/${client.id}`}>View Details</Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>Edit</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-destructive"
                                                        onClick={() => handleDelete(client)}
                                                    >
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filteredClients.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <h3 className="font-medium mb-2">No clients found</h3>
                    <p className="text-sm mb-4">
                        {clients.length === 0
                            ? 'Start by adding your first client'
                            : 'Try adjusting your search or filters'
                        }
                    </p>
                    {clients.length === 0 && (
                        <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Client
                        </Button>
                    )}
                </div>
            )}

            {/* Create Client Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-card border-border">
                    <DialogHeader>
                        <DialogTitle>New Client</DialogTitle>
                        <DialogDescription>
                            Add a new client to your CRM
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Name *</Label>
                            <Input
                                value={newClient.name}
                                onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                                placeholder="Company or contact name"
                                className="bg-secondary border-border"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    value={newClient.email}
                                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                                    placeholder="email@example.com"
                                    className="bg-secondary border-border"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Phone</Label>
                                <Input
                                    value={newClient.phone}
                                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                                    placeholder="+1 234 567 890"
                                    className="bg-secondary border-border"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Industry</Label>
                                <Select
                                    value={newClient.industry}
                                    onValueChange={(v) => setNewClient({ ...newClient, industry: v })}
                                >
                                    <SelectTrigger className="bg-secondary border-border">
                                        <SelectValue placeholder="Select industry" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {industries.map((ind) => (
                                            <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select
                                    value={newClient.status}
                                    onValueChange={(v) => setNewClient({ ...newClient, status: v as ClientStatus })}
                                >
                                    <SelectTrigger className="bg-secondary border-border">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="lead">Lead</SelectItem>
                                        <SelectItem value="prospect">Prospect</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreate} disabled={!newClient.name || isCreating}>
                            {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    )
}
