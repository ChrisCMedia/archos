'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Settings,
    Save,
    RotateCcw,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Sliders,
    Brain
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useBotConfig } from '@/hooks/use-bot-config'
import { useBotModels } from '@/hooks/use-bot-models'
import dynamic from 'next/dynamic'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

interface ConfigValues {
    system_prompt: string
    temperature: number
    max_tokens: number
    model: string
    auto_reply: boolean
    auto_execute: boolean
    context_limit: number
}

const defaultConfig: ConfigValues = {
    system_prompt: 'You are Klaus, a helpful AI assistant.',
    temperature: 0.7,
    max_tokens: 2048,
    model: 'claude-opus-4',
    auto_reply: true,
    auto_execute: false,
    context_limit: 10,
}

export default function ConfigDeckPage() {
    const { config, loading: configLoading, saveConfig } = useBotConfig()
    const { models, loading: modelsLoading, getDefaultModel } = useBotModels()
    const { toast } = useToast()

    const [localConfig, setLocalConfig] = useState<ConfigValues>(defaultConfig)
    const [hasChanges, setHasChanges] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    const loading = configLoading || modelsLoading

    // Initialize from database config
    useEffect(() => {
        if (!configLoading && config) {
            const configObj = config as Record<string, unknown>
            setLocalConfig({
                system_prompt: (configObj.system_prompt as string) || defaultConfig.system_prompt,
                temperature: (configObj.temperature as number) ?? defaultConfig.temperature,
                max_tokens: (configObj.max_tokens as number) ?? defaultConfig.max_tokens,
                model: (configObj.model as string) || getDefaultModel()?.model_id || defaultConfig.model,
                auto_reply: (configObj.auto_reply as boolean) ?? defaultConfig.auto_reply,
                auto_execute: (configObj.auto_execute as boolean) ?? defaultConfig.auto_execute,
                context_limit: (configObj.context_limit as number) ?? defaultConfig.context_limit,
            })
        }
    }, [config, configLoading, getDefaultModel])

    // Track changes
    useEffect(() => {
        if (!config) return
        const configObj = config as Record<string, unknown>
        const isDifferent =
            localConfig.system_prompt !== (configObj.system_prompt || defaultConfig.system_prompt) ||
            localConfig.temperature !== (configObj.temperature ?? defaultConfig.temperature) ||
            localConfig.max_tokens !== (configObj.max_tokens ?? defaultConfig.max_tokens) ||
            localConfig.model !== (configObj.model || defaultConfig.model) ||
            localConfig.auto_reply !== (configObj.auto_reply ?? defaultConfig.auto_reply) ||
            localConfig.auto_execute !== (configObj.auto_execute ?? defaultConfig.auto_execute) ||
            localConfig.context_limit !== (configObj.context_limit ?? defaultConfig.context_limit)
        setHasChanges(isDifferent)
    }, [localConfig, config])

    const handleSave = async () => {
        setIsSaving(true)
        try {
            await saveConfig(localConfig as unknown as Record<string, unknown>)
            toast({
                title: 'Configuration saved',
                description: 'Klaus will use the new settings immediately.',
            })
            setHasChanges(false)
        } catch (err) {
            toast({
                title: 'Error',
                description: 'Failed to save configuration',
                variant: 'destructive',
            })
        } finally {
            setIsSaving(false)
        }
    }

    const handleReset = () => {
        setLocalConfig(defaultConfig)
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
                    <h1 className="text-3xl font-bold tracking-tight">Config Deck</h1>
                    <p className="text-muted-foreground mt-1">
                        Configure Klaus AI behavior and parameters
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handleReset} disabled={!hasChanges}>
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset
                    </Button>
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
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* System Prompt */}
                <Card className="lg:col-span-2 bg-card border-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Brain className="w-5 h-5 text-primary" />
                            System Prompt
                        </CardTitle>
                        <CardDescription>
                            Define Klaus&apos;s personality and base instructions
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] rounded-lg overflow-hidden border border-border">
                            <MonacoEditor
                                height="100%"
                                defaultLanguage="markdown"
                                theme="vs-dark"
                                value={localConfig.system_prompt}
                                onChange={(value) => setLocalConfig({ ...localConfig, system_prompt: value || '' })}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    lineNumbers: 'off',
                                    wordWrap: 'on',
                                    padding: { top: 16, bottom: 16 },
                                }}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Model Selection */}
                <Card className="bg-card border-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="w-5 h-5 text-primary" />
                            Model
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label>AI Model</Label>
                            {models.length === 0 ? (
                                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                    <p className="text-sm text-amber-500 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        No models available
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Run the SQL migration to add models
                                    </p>
                                </div>
                            ) : (
                                <Select
                                    value={localConfig.model}
                                    onValueChange={(v) => setLocalConfig({ ...localConfig, model: v })}
                                >
                                    <SelectTrigger className="bg-secondary border-border">
                                        <SelectValue placeholder="Select model" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {models.map((model) => (
                                            <SelectItem key={model.id} value={model.model_id}>
                                                <div className="flex items-center gap-2">
                                                    <span>{model.name}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        ({model.provider})
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <Label>Temperature</Label>
                                    <span className="text-sm text-muted-foreground">
                                        {localConfig.temperature.toFixed(1)}
                                    </span>
                                </div>
                                <Slider
                                    value={[localConfig.temperature]}
                                    onValueChange={([v]) => setLocalConfig({ ...localConfig, temperature: v })}
                                    min={0}
                                    max={2}
                                    step={0.1}
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Lower = focused, Higher = creative
                                </p>
                            </div>

                            <div>
                                <Label>Max Tokens</Label>
                                <Input
                                    type="number"
                                    value={localConfig.max_tokens}
                                    onChange={(e) => setLocalConfig({ ...localConfig, max_tokens: parseInt(e.target.value) || 2048 })}
                                    className="mt-2 bg-secondary border-border"
                                />
                            </div>

                            <div>
                                <Label>Context Limit</Label>
                                <Input
                                    type="number"
                                    value={localConfig.context_limit}
                                    onChange={(e) => setLocalConfig({ ...localConfig, context_limit: parseInt(e.target.value) || 10 })}
                                    className="mt-2 bg-secondary border-border"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Messages to include in context
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Behavior Settings */}
            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sliders className="w-5 h-5 text-primary" />
                        Behavior Settings
                    </CardTitle>
                    <CardDescription>
                        Control Klaus&apos;s autonomous capabilities
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                            <div>
                                <h4 className="font-medium">Auto Reply</h4>
                                <p className="text-sm text-muted-foreground">
                                    Automatically respond to incoming messages
                                </p>
                            </div>
                            <Switch
                                checked={localConfig.auto_reply}
                                onCheckedChange={(checked) => setLocalConfig({ ...localConfig, auto_reply: checked })}
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                            <div>
                                <h4 className="font-medium">Auto Execute</h4>
                                <p className="text-sm text-muted-foreground">
                                    Execute actions without confirmation
                                </p>
                            </div>
                            <Switch
                                checked={localConfig.auto_execute}
                                onCheckedChange={(checked) => setLocalConfig({ ...localConfig, auto_execute: checked })}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {hasChanges && (
                <div className="fixed bottom-6 right-6 p-4 rounded-lg bg-primary text-primary-foreground shadow-lg flex items-center gap-3">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">You have unsaved changes</span>
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? 'Saving...' : 'Save Now'}
                    </Button>
                </div>
            )}
        </motion.div>
    )
}
