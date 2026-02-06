'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Search,
    Globe,
    Code,
    Database,
    FileText,
    Send,
    Calendar,
    Mail,
    Github,
    Webhook,
    Plus,
    Cpu,
    Loader2
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { useBotSkills } from '@/hooks/use-bot-skills'

// Map skill names to icons
const skillIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    web_search: Globe,
    code_execution: Code,
    database_access: Database,
    file_system: FileText,
    telegram_bot: Send,
    calendar_sync: Calendar,
    email: Mail,
    github: Github,
    webhooks: Webhook,
}

// Skill categories based on name patterns
const categorizeSkill = (name: string): 'core' | 'integrations' | 'utilities' => {
    const coreSkills = ['web_search', 'code_execution', 'database_access']
    const integrations = ['telegram_bot', 'calendar_sync', 'email', 'github']

    if (coreSkills.includes(name)) return 'core'
    if (integrations.includes(name)) return 'integrations'
    return 'utilities'
}

const categoryLabels = {
    core: 'Core Capabilities',
    integrations: 'Integrations',
    utilities: 'Utilities',
}

export default function SkillMatrixPage() {
    const { skills, loading, toggleSkill } = useBotSkills()
    const { toast } = useToast()
    const [searchQuery, setSearchQuery] = useState('')
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [togglingId, setTogglingId] = useState<string | null>(null)

    const filteredSkills = skills.filter(skill =>
        skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const groupedSkills = filteredSkills.reduce((acc, skill) => {
        const category = categorizeSkill(skill.name)
        if (!acc[category]) acc[category] = []
        acc[category].push(skill)
        return acc
    }, {} as Record<string, typeof skills>)

    const handleToggle = async (skillId: string, enabled: boolean) => {
        setTogglingId(skillId)
        try {
            await toggleSkill(skillId, enabled)
            toast({
                title: enabled ? 'Skill enabled' : 'Skill disabled',
                description: `Skill has been ${enabled ? 'activated' : 'deactivated'}.`,
            })
        } catch (err) {
            toast({
                title: 'Error',
                description: 'Failed to toggle skill',
                variant: 'destructive',
            })
        } finally {
            setTogglingId(null)
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
                    <h1 className="text-3xl font-bold tracking-tight">Skill Matrix</h1>
                    <p className="text-muted-foreground mt-1">
                        Enable or disable Klaus&apos;s capabilities
                    </p>
                </div>
                <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Skill
                </Button>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search skills..."
                    className="pl-9 bg-secondary border-border"
                />
            </div>

            {/* Skill Categories */}
            {(['core', 'integrations', 'utilities'] as const).map((category) => {
                const categorySkills = groupedSkills[category] || []
                if (categorySkills.length === 0) return null

                return (
                    <div key={category} className="space-y-3">
                        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            {categoryLabels[category]}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {categorySkills.map((skill) => {
                                const Icon = skillIcons[skill.name] || Cpu
                                return (
                                    <Card
                                        key={skill.id}
                                        className={`bg-card border-border transition-all ${skill.enabled
                                            ? 'border-primary/30'
                                            : 'opacity-60'
                                            }`}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-3">
                                                    <div className={`p-2 rounded-lg ${skill.enabled ? 'bg-primary/10' : 'bg-secondary'}`}>
                                                        <Icon className={`w-5 h-5 ${skill.enabled ? 'text-primary' : 'text-muted-foreground'}`} />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-medium text-sm capitalize">
                                                            {skill.name.replace(/_/g, ' ')}
                                                        </h3>
                                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                            {skill.description || 'No description'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {togglingId === skill.id && (
                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                    )}
                                                    <Switch
                                                        checked={skill.enabled ?? false}
                                                        onCheckedChange={(checked) => handleToggle(skill.id, checked)}
                                                        disabled={togglingId === skill.id}
                                                    />
                                                </div>
                                            </div>
                                            <div className="mt-3 flex items-center gap-2">
                                                <Badge variant="outline" className="text-[10px]">
                                                    {category}
                                                </Badge>
                                                {skill.enabled && (
                                                    <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-500">
                                                        Active
                                                    </Badge>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    </div>
                )
            })}

            {filteredSkills.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    <Cpu className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>No skills found</p>
                </div>
            )}

            {/* Add Skill Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-card border-border">
                    <DialogHeader>
                        <DialogTitle>Add Custom Skill</DialogTitle>
                        <DialogDescription>
                            Define a new capability for Klaus
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-8 text-center text-muted-foreground">
                        <Cpu className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        Custom skill creation will be available in a future update.
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    )
}
