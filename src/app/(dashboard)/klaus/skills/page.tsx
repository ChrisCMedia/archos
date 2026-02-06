'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Bot, Sparkles, Loader2, Power, Settings } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useBotSkills, AVAILABLE_SKILLS } from '@/hooks/use-bot-skills'

export default function SkillsPage() {
    const { skills, loading, addSkill, toggleSkill, deleteSkill } = useBotSkills()
    const { toast } = useToast()
    const [processingId, setProcessingId] = useState<string | null>(null)

    const enabledCount = skills.filter(s => s.enabled).length

    const isSkillAdded = (skillId: string) => skills.some(s => s.skill_id === skillId)
    const getAddedSkill = (skillId: string) => skills.find(s => s.skill_id === skillId)

    const handleToggle = async (skillId: string, enabled: boolean) => {
        const skill = getAddedSkill(skillId)
        if (!skill) {
            try {
                setProcessingId(skillId)
                await addSkill({ skill_id: skillId, enabled: true })
                toast({ title: 'Skill enabled' })
            } catch { toast({ title: 'Error', variant: 'destructive' }) }
            finally { setProcessingId(null) }
        } else {
            try {
                setProcessingId(skillId)
                await toggleSkill(skill.id, enabled)
                toast({ title: enabled ? 'Skill enabled' : 'Skill disabled' })
            } catch { toast({ title: 'Error', variant: 'destructive' }) }
            finally { setProcessingId(null) }
        }
    }

    if (loading) return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-cyan-500/20">
                    <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Skills</h1>
                    <p className="text-muted-foreground">Manage Klaus capabilities</p>
                </div>
                <Badge variant="outline" className="ml-auto">{enabledCount} / {AVAILABLE_SKILLS.length} enabled</Badge>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {AVAILABLE_SKILLS.map(skill => {
                    const added = getAddedSkill(skill.skill_id)
                    const isEnabled = added?.enabled ?? false
                    const isProcessing = processingId === skill.skill_id

                    return (
                        <Card key={skill.skill_id} className={`bg-card border-border transition-colors ${isEnabled ? 'ring-1 ring-primary/50' : ''}`}>
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        <Bot className={`w-5 h-5 ${isEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
                                        <CardTitle className="text-base">{skill.name}</CardTitle>
                                    </div>
                                    {isProcessing ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Switch checked={isEnabled} onCheckedChange={(checked) => handleToggle(skill.skill_id, checked)} />
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <CardDescription>{skill.description}</CardDescription>
                                <div className="flex items-center justify-between mt-4">
                                    <Badge variant={isEnabled ? 'default' : 'secondary'} className="text-xs">
                                        <Power className="w-3 h-3 mr-1" />
                                        {isEnabled ? 'Active' : 'Inactive'}
                                    </Badge>
                                    <Button variant="ghost" size="sm" disabled className="text-muted-foreground">
                                        <Settings className="w-3 h-3 mr-1" />Config
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </motion.div>
    )
}
