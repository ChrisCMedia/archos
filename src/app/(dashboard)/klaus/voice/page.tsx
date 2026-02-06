'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Volume2,
    Play,
    Save,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Mic
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useBotVoices } from '@/hooks/use-bot-models'
import { useBotConfig } from '@/hooks/use-bot-config'

export default function VoicePage() {
    const { voices, loading: voicesLoading, getDefaultVoice } = useBotVoices()
    const { config, loading: configLoading, saveConfig } = useBotConfig()
    const { toast } = useToast()

    const [selectedVoice, setSelectedVoice] = useState<string>('')
    const [isSaving, setIsSaving] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)

    const loading = voicesLoading || configLoading

    // Initialize selected voice from config
    useEffect(() => {
        if (!configLoading && config) {
            const savedVoiceId = (config as Record<string, unknown>).voice_id as string
            if (savedVoiceId) {
                setSelectedVoice(savedVoiceId)
            } else {
                const defaultVoice = getDefaultVoice()
                if (defaultVoice) {
                    setSelectedVoice(defaultVoice.voice_id)
                }
            }
        }
    }, [config, configLoading, getDefaultVoice])

    // Track changes
    useEffect(() => {
        const savedVoiceId = (config as Record<string, unknown>)?.voice_id as string
        setHasChanges(selectedVoice !== savedVoiceId)
    }, [selectedVoice, config])

    const handleSave = async () => {
        setIsSaving(true)
        try {
            await saveConfig({ voice_id: selectedVoice } as Record<string, unknown>)
            toast({
                title: 'Voice settings saved',
                description: 'Klaus will use the selected voice for TTS.',
            })
            setHasChanges(false)
        } catch (err) {
            toast({
                title: 'Error',
                description: 'Failed to save voice settings',
                variant: 'destructive',
            })
        } finally {
            setIsSaving(false)
        }
    }

    const handlePlaySample = (voiceId: string) => {
        // This would integrate with ElevenLabs API for preview
        toast({
            title: 'Voice Preview',
            description: 'Connect ElevenLabs API key to enable voice previews.',
        })
    }

    const currentVoice = voices.find(v => v.voice_id === selectedVoice)

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
                    <h1 className="text-3xl font-bold tracking-tight">Voice / TTS</h1>
                    <p className="text-muted-foreground mt-1">
                        Configure Klaus&apos;s text-to-speech voice
                    </p>
                </div>
                <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
                    {isSaving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : hasChanges ? (
                        <Save className="w-4 h-4 mr-2" />
                    ) : (
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                    )}
                    {isSaving ? 'Saving...' : hasChanges ? 'Save Changes' : 'Saved'}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Voice Selection */}
                <Card className="bg-card border-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Mic className="w-5 h-5 text-primary" />
                            Voice Selection
                        </CardTitle>
                        <CardDescription>
                            Choose a voice for Klaus to use when speaking
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {voices.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
                                <p className="font-medium mb-2">No voices available</p>
                                <p className="text-sm">
                                    Run the SQL migration to seed voice options, or add voices to the bot_voices table.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {voices.map((voice) => (
                                    <div
                                        key={voice.id}
                                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedVoice === voice.voice_id
                                                ? 'border-primary bg-primary/5'
                                                : 'border-border hover:border-primary/50'
                                            }`}
                                        onClick={() => setSelectedVoice(voice.voice_id)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-medium">{voice.name}</h3>
                                                    {voice.is_default && (
                                                        <Badge variant="secondary" className="text-[10px]">
                                                            Default
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {voice.provider} • {voice.language.toUpperCase()}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handlePlaySample(voice.voice_id)
                                                    }}
                                                >
                                                    <Play className="w-4 h-4" />
                                                </Button>
                                                {selectedVoice === voice.voice_id && (
                                                    <CheckCircle2 className="w-5 h-5 text-primary" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Current Configuration */}
                <Card className="bg-card border-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Volume2 className="w-5 h-5 text-primary" />
                            Current Configuration
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <Label className="text-muted-foreground">Selected Voice</Label>
                            <p className="text-xl font-medium mt-1">
                                {currentVoice?.name || 'None selected'}
                            </p>
                        </div>

                        {currentVoice && (
                            <>
                                <div>
                                    <Label className="text-muted-foreground">Provider</Label>
                                    <p className="text-lg capitalize mt-1">{currentVoice.provider}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Voice ID</Label>
                                    <code className="block mt-1 px-3 py-2 bg-secondary rounded text-sm font-mono">
                                        {currentVoice.voice_id}
                                    </code>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Language</Label>
                                    <p className="text-lg mt-1">{currentVoice.language.toUpperCase()}</p>
                                </div>
                            </>
                        )}

                        {hasChanges && (
                            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                <p className="text-sm text-amber-500">
                                    You have unsaved changes. Click &quot;Save Changes&quot; to apply.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* API Key Notice */}
            <Card className="bg-sky-500/5 border-sky-500/20">
                <CardContent className="flex items-start gap-3 p-4">
                    <AlertCircle className="w-5 h-5 text-sky-500 mt-0.5" />
                    <div>
                        <h3 className="font-medium text-sky-500">TTS Integration</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            To enable text-to-speech, add your ElevenLabs API key in the Secret Vault.
                            Klaus will use the selected voice when generating audio responses.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
