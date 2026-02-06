'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    ArrowLeft,
    Building2,
    Mail,
    Phone,
    Calendar,
    Edit2,
    Trash2,
    Plus,
    Loader2,
    Folder,
    Ticket,
    DollarSign,
    Clock
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { useClient, useClients } from '@/hooks/use-clients'
import { useProjects } from '@/hooks/use-projects'
import { useTickets } from '@/hooks/use-tickets'
import { Tables } from '@/lib/supabase/types'

type Project = Tables<'projects'>

const statusColors = {
    lead: 'bg-slate-500/20 text-slate-400',
    prospect: 'bg-sky-500/20 text-sky-400',
    active: 'bg-emerald-500/20 text-emerald-400',
    churned: 'bg-red-500/20 text-red-400',
}

const projectStatusColors: Record<string, string> = {
    planning: 'bg-slate-500/20 text-slate-400',
    active: 'bg-sky-500/20 text-sky-500',
    paused: 'bg-amber-500/20 text-amber-500',
    completed: 'bg-emerald-500/20 text-emerald-500',
    cancelled: 'bg-red-500/20 text-red-400',
}

export default function ClientDetailPage() {
    const params = useParams()
    const router = useRouter()
    const clientId = params.id as string

    const { client, loading: clientLoading } = useClient(clientId)
    const { updateClient, deleteClient } = useClients()
    const { projects, loading: projectsLoading, createProject, deleteProject } = useProjects(clientId)
    const { tickets } = useTickets()

    const { toast } = useToast()
    const [isEditing, setIsEditing] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [projectDialogOpen, setProjectDialogOpen] = useState(false)
    const [isCreatingProject, setIsCreatingProject] = useState(false)
    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        phone: '',
        industry: '',
        notes: '',
    })
    const [newProject, setNewProject] = useState({
        name: '',
        description: '',
        budget: '',
        deadline: '',
    })

    // Filter tickets linked to this client
    const clientTickets = tickets.filter(t => t.client_id === clientId)

    const loading = clientLoading || projectsLoading

    const handleEdit = () => {
        if (client) {
            setEditForm({
                name: client.name,
                email: client.email || '',
                phone: client.phone || '',
                industry: client.industry || '',
                notes: client.notes || '',
            })
            setIsEditing(true)
        }
    }

    const handleSave = async () => {
        if (!client) return
        try {
            await updateClient(client.id, {
                name: editForm.name,
                email: editForm.email || null,
                phone: editForm.phone || null,
                industry: editForm.industry || null,
                notes: editForm.notes || null,
            })
            toast({ title: 'Client updated' })
            setIsEditing(false)
        } catch (err) {
            toast({ title: 'Error', description: 'Failed to update client', variant: 'destructive' })
        }
    }

    const handleDelete = async () => {
        if (!client) return
        try {
            await deleteClient(client.id)
            toast({ title: 'Client deleted' })
            router.push('/crm')
        } catch (err) {
            toast({ title: 'Error', description: 'Failed to delete client', variant: 'destructive' })
        }
    }

    const handleCreateProject = async () => {
        if (!newProject.name) return
        setIsCreatingProject(true)
        try {
            await createProject({
                client_id: clientId,
                name: newProject.name,
                description: newProject.description || null,
                budget: newProject.budget ? parseFloat(newProject.budget) : null,
                deadline: newProject.deadline || null,
            })
            toast({ title: 'Project created' })
            setNewProject({ name: '', description: '', budget: '', deadline: '' })
            setProjectDialogOpen(false)
        } catch (err) {
            toast({ title: 'Error', description: 'Failed to create project', variant: 'destructive' })
        } finally {
            setIsCreatingProject(false)
        }
    }

    if (loading || !client) {
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
                <div className="flex items-center gap-4">
                    <Link href="/crm">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
                            <Badge className={statusColors[client.status]}>
                                {client.status}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground mt-1">
                            Added {new Date(client.created_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handleEdit}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit
                    </Button>
                    <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Client Info */}
                <Card className="bg-card border-border">
                    <CardHeader>
                        <CardTitle className="text-lg">Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {client.industry && (
                            <div className="flex items-center gap-3">
                                <Building2 className="w-4 h-4 text-muted-foreground" />
                                <span>{client.industry}</span>
                            </div>
                        )}
                        {client.email && (
                            <div className="flex items-center gap-3">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                <a href={`mailto:${client.email}`} className="text-primary hover:underline">
                                    {client.email}
                                </a>
                            </div>
                        )}
                        {client.phone && (
                            <div className="flex items-center gap-3">
                                <Phone className="w-4 h-4 text-muted-foreground" />
                                <a href={`tel:${client.phone}`} className="text-primary hover:underline">
                                    {client.phone}
                                </a>
                            </div>
                        )}
                        <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                                Last updated {new Date(client.updated_at).toLocaleDateString()}
                            </span>
                        </div>
                        {client.notes && (
                            <div className="pt-4 border-t border-border">
                                <h4 className="text-sm font-medium mb-2">Notes</h4>
                                <p className="text-sm text-muted-foreground">{client.notes}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Projects & Tickets */}
                <div className="lg:col-span-2">
                    <Tabs defaultValue="projects">
                        <TabsList className="bg-secondary/50">
                            <TabsTrigger value="projects" className="gap-1.5">
                                <Folder className="w-4 h-4" />
                                Projects ({projects.length})
                            </TabsTrigger>
                            <TabsTrigger value="tickets" className="gap-1.5">
                                <Ticket className="w-4 h-4" />
                                Tickets ({clientTickets.length})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="projects" className="mt-4 space-y-3">
                            <div className="flex justify-end">
                                <Button size="sm" onClick={() => setProjectDialogOpen(true)}>
                                    <Plus className="w-4 h-4 mr-1" />
                                    New Project
                                </Button>
                            </div>
                            {projects.length === 0 ? (
                                <Card className="bg-card border-border">
                                    <CardContent className="py-8 text-center text-muted-foreground">
                                        <Folder className="w-12 h-12 mx-auto mb-4 opacity-30" />
                                        <p>No projects yet</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                projects.map((project) => (
                                    <Card key={project.id} className="bg-card border-border">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-medium">{project.name}</h3>
                                                        <Badge className={projectStatusColors[project.status]}>
                                                            {project.status}
                                                        </Badge>
                                                    </div>
                                                    {project.description && (
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            {project.description}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                                        {project.budget && (
                                                            <span className="flex items-center gap-1">
                                                                <DollarSign className="w-3 h-3" />
                                                                {project.budget.toLocaleString()} {project.currency}
                                                            </span>
                                                        )}
                                                        {project.deadline && (
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                {new Date(project.deadline).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() => deleteProject(project.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </TabsContent>

                        <TabsContent value="tickets" className="mt-4 space-y-3">
                            {clientTickets.length === 0 ? (
                                <Card className="bg-card border-border">
                                    <CardContent className="py-8 text-center text-muted-foreground">
                                        <Ticket className="w-12 h-12 mx-auto mb-4 opacity-30" />
                                        <p>No tickets linked to this client</p>
                                        <Link href="/kanban">
                                            <Button variant="outline" size="sm" className="mt-4">
                                                Go to Kanban
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            ) : (
                                clientTickets.map((ticket) => (
                                    <Card key={ticket.id} className="bg-card border-border">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="font-medium">{ticket.title}</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {ticket.status} • {ticket.priority} priority
                                                    </p>
                                                </div>
                                                <Badge variant="outline">{ticket.status}</Badge>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* Edit Dialog */}
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogContent className="bg-card border-border">
                    <DialogHeader>
                        <DialogTitle>Edit Client</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Name</Label>
                            <Input
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                className="bg-secondary border-border"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                    className="bg-secondary border-border"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Phone</Label>
                                <Input
                                    value={editForm.phone}
                                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                    className="bg-secondary border-border"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Industry</Label>
                            <Input
                                value={editForm.industry}
                                onChange={(e) => setEditForm({ ...editForm, industry: e.target.value })}
                                className="bg-secondary border-border"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Notes</Label>
                            <Textarea
                                value={editForm.notes}
                                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                                className="bg-secondary border-border"
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                        <Button onClick={handleSave}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="bg-card border-border">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Client</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete {client.name} and all associated projects. Tickets will be unlinked.
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

            {/* New Project Dialog */}
            <Dialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
                <DialogContent className="bg-card border-border">
                    <DialogHeader>
                        <DialogTitle>New Project</DialogTitle>
                        <DialogDescription>
                            Create a project for {client.name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Name *</Label>
                            <Input
                                value={newProject.name}
                                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                                placeholder="Project name"
                                className="bg-secondary border-border"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                value={newProject.description}
                                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                                placeholder="Brief description"
                                className="bg-secondary border-border"
                                rows={2}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Budget (EUR)</Label>
                                <Input
                                    type="number"
                                    value={newProject.budget}
                                    onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })}
                                    placeholder="10000"
                                    className="bg-secondary border-border"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Deadline</Label>
                                <Input
                                    type="date"
                                    value={newProject.deadline}
                                    onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
                                    className="bg-secondary border-border"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setProjectDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateProject} disabled={!newProject.name || isCreatingProject}>
                            {isCreatingProject && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    )
}
