'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Building2, Mail, Phone, Calendar, Edit2, Trash2, Plus, Loader2, Folder, Ticket, DollarSign, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { useClients, Client } from '@/hooks/use-clients'
import { useProjects } from '@/hooks/use-projects'
import { useTickets } from '@/hooks/use-tickets'

const statusColors: Record<string, string> = { lead: 'bg-slate-500/20 text-slate-400', prospect: 'bg-sky-500/20 text-sky-400', active: 'bg-emerald-500/20 text-emerald-400', churned: 'bg-red-500/20 text-red-400' }
const projectStatusColors: Record<string, string> = { planning: 'bg-slate-500/20 text-slate-400', active: 'bg-sky-500/20 text-sky-500', paused: 'bg-amber-500/20 text-amber-500', completed: 'bg-emerald-500/20 text-emerald-500', cancelled: 'bg-red-500/20 text-red-400' }

export default function ClientDetailPage() {
    const params = useParams()
    const router = useRouter()
    const clientId = params.id as string
    const { clients, loading: clientsLoading, updateClient, deleteClient } = useClients()
    const { projects, loading: projectsLoading, createProject, deleteProject } = useProjects(clientId)
    const { tickets } = useTickets()
    const { toast } = useToast()

    const [client, setClient] = useState<Client | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [projectDialogOpen, setProjectDialogOpen] = useState(false)
    const [isCreatingProject, setIsCreatingProject] = useState(false)
    const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', industry: '', notes: '' })
    const [newProject, setNewProject] = useState({ name: '', value: '', deadline: '' })

    useEffect(() => {
        const found = clients.find(c => c.id === clientId)
        if (found) setClient(found)
    }, [clients, clientId])

    const loading = clientsLoading || projectsLoading

    const handleEdit = () => {
        if (client) {
            setEditForm({ name: client.name, email: client.contact_info?.email || '', phone: client.contact_info?.phone || '', industry: client.industry || '', notes: client.contact_info?.notes || '' })
            setIsEditing(true)
        }
    }

    const handleSave = async () => {
        if (!client) return
        try {
            await updateClient(client.id, { name: editForm.name, industry: editForm.industry || undefined, contact_info: { email: editForm.email || undefined, phone: editForm.phone || undefined, notes: editForm.notes || undefined } })
            toast({ title: 'Client updated' })
            setIsEditing(false)
        } catch { toast({ title: 'Error', variant: 'destructive' }) }
    }

    const handleDelete = async () => {
        if (!client) return
        try { await deleteClient(client.id); toast({ title: 'Deleted' }); router.push('/crm') }
        catch { toast({ title: 'Error', variant: 'destructive' }) }
    }

    const handleCreateProject = async () => {
        if (!newProject.name) return
        setIsCreatingProject(true)
        try {
            await createProject({ client_id: clientId, name: newProject.name, value: newProject.value ? parseFloat(newProject.value) : undefined, deadline: newProject.deadline || undefined })
            toast({ title: 'Project created' })
            setNewProject({ name: '', value: '', deadline: '' })
            setProjectDialogOpen(false)
        } catch { toast({ title: 'Error', variant: 'destructive' }) }
        finally { setIsCreatingProject(false) }
    }

    if (loading || !client) return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/crm"><Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button></Link>
                    <div>
                        <div className="flex items-center gap-3"><h1 className="text-3xl font-bold tracking-tight">{client.name}</h1><Badge className={statusColors[client.status]}>{client.status}</Badge></div>
                        <p className="text-muted-foreground mt-1">Added {new Date(client.created_at).toLocaleDateString()}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handleEdit}><Edit2 className="w-4 h-4 mr-2" />Edit</Button>
                    <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}><Trash2 className="w-4 h-4 mr-2" />Delete</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="bg-card border-border">
                    <CardHeader><CardTitle className="text-lg">Contact Information</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        {client.industry && <div className="flex items-center gap-3"><Building2 className="w-4 h-4 text-muted-foreground" /><span>{client.industry}</span></div>}
                        {client.contact_info?.email && <div className="flex items-center gap-3"><Mail className="w-4 h-4 text-muted-foreground" /><a href={`mailto:${client.contact_info.email}`} className="text-primary hover:underline">{client.contact_info.email}</a></div>}
                        {client.contact_info?.phone && <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-muted-foreground" /><a href={`tel:${client.contact_info.phone}`} className="text-primary hover:underline">{client.contact_info.phone}</a></div>}
                        <div className="flex items-center gap-3"><Calendar className="w-4 h-4 text-muted-foreground" /><span className="text-sm text-muted-foreground">Created {new Date(client.created_at).toLocaleDateString()}</span></div>
                        {client.contact_info?.notes && <div className="pt-4 border-t border-border"><h4 className="text-sm font-medium mb-2">Notes</h4><p className="text-sm text-muted-foreground">{client.contact_info.notes}</p></div>}
                    </CardContent>
                </Card>

                <div className="lg:col-span-2">
                    <Tabs defaultValue="projects">
                        <TabsList className="bg-secondary/50"><TabsTrigger value="projects" className="gap-1.5"><Folder className="w-4 h-4" />Projects ({projects.length})</TabsTrigger><TabsTrigger value="tickets" className="gap-1.5"><Ticket className="w-4 h-4" />Tickets (0)</TabsTrigger></TabsList>
                        <TabsContent value="projects" className="mt-4 space-y-3">
                            <div className="flex justify-end"><Button size="sm" onClick={() => setProjectDialogOpen(true)}><Plus className="w-4 h-4 mr-1" />New Project</Button></div>
                            {projects.length === 0 ? <Card className="bg-card border-border"><CardContent className="py-8 text-center text-muted-foreground"><Folder className="w-12 h-12 mx-auto mb-4 opacity-30" /><p>No projects yet</p></CardContent></Card> : projects.map((project) => (
                                <Card key={project.id} className="bg-card border-border">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="flex items-center gap-2"><h3 className="font-medium">{project.name}</h3><Badge className={projectStatusColors[project.status]}>{project.status}</Badge></div>
                                                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                                    {project.value && <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{project.value.toLocaleString()}</span>}
                                                    {project.deadline && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(project.deadline).toLocaleDateString()}</span>}
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteProject(project.id)}><Trash2 className="w-4 h-4" /></Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </TabsContent>
                        <TabsContent value="tickets" className="mt-4"><Card className="bg-card border-border"><CardContent className="py-8 text-center text-muted-foreground"><Ticket className="w-12 h-12 mx-auto mb-4 opacity-30" /><p>No tickets linked</p></CardContent></Card></TabsContent>
                    </Tabs>
                </div>
            </div>

            <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogContent className="bg-card border-border"><DialogHeader><DialogTitle>Edit Client</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2"><Label>Name</Label><Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="bg-secondary border-border" /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Email</Label><Input value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="bg-secondary border-border" /></div>
                            <div className="space-y-2"><Label>Phone</Label><Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="bg-secondary border-border" /></div>
                        </div>
                        <div className="space-y-2"><Label>Industry</Label><Input value={editForm.industry} onChange={(e) => setEditForm({ ...editForm, industry: e.target.value })} className="bg-secondary border-border" /></div>
                        <div className="space-y-2"><Label>Notes</Label><Textarea value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} className="bg-secondary border-border" rows={3} /></div>
                    </div>
                    <DialogFooter><Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button><Button onClick={handleSave}>Save</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="bg-card border-border"><AlertDialogHeader><AlertDialogTitle>Delete Client</AlertDialogTitle><AlertDialogDescription>Delete {client.name} and all projects?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
            </AlertDialog>

            <Dialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
                <DialogContent className="bg-card border-border"><DialogHeader><DialogTitle>New Project</DialogTitle><DialogDescription>Create project for {client.name}</DialogDescription></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2"><Label>Name *</Label><Input value={newProject.name} onChange={(e) => setNewProject({ ...newProject, name: e.target.value })} className="bg-secondary border-border" /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Value</Label><Input type="number" value={newProject.value} onChange={(e) => setNewProject({ ...newProject, value: e.target.value })} className="bg-secondary border-border" /></div>
                            <div className="space-y-2"><Label>Deadline</Label><Input type="date" value={newProject.deadline} onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })} className="bg-secondary border-border" /></div>
                        </div>
                    </div>
                    <DialogFooter><Button variant="outline" onClick={() => setProjectDialogOpen(false)}>Cancel</Button><Button onClick={handleCreateProject} disabled={!newProject.name || isCreatingProject}>{isCreatingProject && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Create</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    )
}
