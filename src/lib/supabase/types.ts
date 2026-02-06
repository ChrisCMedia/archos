export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            // =====================================================
            // BUSINESS TABLES
            // =====================================================
            tickets: {
                Row: {
                    id: string
                    title: string
                    description: string | null
                    status: 'backlog' | 'active' | 'review' | 'done'
                    agent_mode: 'manual' | 'assisted' | 'autonomous'
                    priority: 'low' | 'medium' | 'high' | 'critical'
                    source: 'internal' | 'telegram' | 'email' | 'web'
                    assignee: string | null
                    due_date: string | null
                    client_id: string | null
                    project_id: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    description?: string | null
                    status?: 'backlog' | 'active' | 'review' | 'done'
                    agent_mode?: 'manual' | 'assisted' | 'autonomous'
                    priority?: 'low' | 'medium' | 'high' | 'critical'
                    source?: 'internal' | 'telegram' | 'email' | 'web'
                    assignee?: string | null
                    due_date?: string | null
                    client_id?: string | null
                    project_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    description?: string | null
                    status?: 'backlog' | 'active' | 'review' | 'done'
                    agent_mode?: 'manual' | 'assisted' | 'autonomous'
                    priority?: 'low' | 'medium' | 'high' | 'critical'
                    source?: 'internal' | 'telegram' | 'email' | 'web'
                    assignee?: string | null
                    due_date?: string | null
                    client_id?: string | null
                    project_id?: string | null
                    updated_at?: string
                }
            }
            messages: {
                Row: {
                    id: string
                    ticket_id: string | null
                    role: 'user' | 'assistant' | 'system'
                    channel: 'web' | 'telegram' | 'email'
                    content: string
                    metadata: Json
                    created_at: string
                }
                Insert: {
                    id?: string
                    ticket_id?: string | null
                    role: 'user' | 'assistant' | 'system'
                    channel?: 'web' | 'telegram' | 'email'
                    content: string
                    metadata?: Json
                    created_at?: string
                }
                Update: {
                    id?: string
                    ticket_id?: string | null
                    role?: 'user' | 'assistant' | 'system'
                    channel?: 'web' | 'telegram' | 'email'
                    content?: string
                    metadata?: Json
                }
            }
            brain_dump: {
                Row: {
                    id: string
                    content: string
                    processed: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    content: string
                    processed?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    content?: string
                    processed?: boolean
                }
            }
            knowledge_vault: {
                Row: {
                    id: string
                    title: string
                    content: string
                    category: string | null
                    tags: string[] | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    content: string
                    category?: string | null
                    tags?: string[] | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    content?: string
                    category?: string | null
                    tags?: string[] | null
                    updated_at?: string
                }
            }

            // =====================================================
            // CRM TABLES
            // =====================================================
            clients: {
                Row: {
                    id: string
                    name: string
                    email: string | null
                    phone: string | null
                    status: 'lead' | 'prospect' | 'active' | 'churned'
                    industry: string | null
                    notes: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    email?: string | null
                    phone?: string | null
                    status?: 'lead' | 'prospect' | 'active' | 'churned'
                    industry?: string | null
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    email?: string | null
                    phone?: string | null
                    status?: 'lead' | 'prospect' | 'active' | 'churned'
                    industry?: string | null
                    notes?: string | null
                    updated_at?: string
                }
            }
            projects: {
                Row: {
                    id: string
                    client_id: string
                    name: string
                    description: string | null
                    status: 'planning' | 'active' | 'paused' | 'completed' | 'cancelled'
                    budget: number | null
                    currency: string
                    deadline: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    client_id: string
                    name: string
                    description?: string | null
                    status?: 'planning' | 'active' | 'paused' | 'completed' | 'cancelled'
                    budget?: number | null
                    currency?: string
                    deadline?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    client_id?: string
                    name?: string
                    description?: string | null
                    status?: 'planning' | 'active' | 'paused' | 'completed' | 'cancelled'
                    budget?: number | null
                    currency?: string
                    deadline?: string | null
                    updated_at?: string
                }
            }

            // =====================================================
            // BOT CONTROL TABLES
            // =====================================================
            bot_config: {
                Row: {
                    id: string
                    key: string
                    value: Json
                    updated_at: string
                }
                Insert: {
                    id?: string
                    key: string
                    value: Json
                    updated_at?: string
                }
                Update: {
                    id?: string
                    key?: string
                    value?: Json
                    updated_at?: string
                }
            }
            bot_secrets: {
                Row: {
                    id: string
                    name: string
                    encrypted_value: string
                    provider: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    encrypted_value: string
                    provider?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    encrypted_value?: string
                    provider?: string | null
                    updated_at?: string
                }
            }
            bot_skills: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    enabled: boolean
                    config: Json
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    enabled?: boolean
                    config?: Json
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    enabled?: boolean
                    config?: Json
                }
            }
            bot_cron: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    schedule: string
                    command: string
                    enabled: boolean
                    last_run: string | null
                    next_run: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    schedule: string
                    command: string
                    enabled?: boolean
                    last_run?: string | null
                    next_run?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    schedule?: string
                    command?: string
                    enabled?: boolean
                    last_run?: string | null
                    next_run?: string | null
                    updated_at?: string
                }
            }
            bot_heartbeat: {
                Row: {
                    id: string
                    service: string
                    status: 'online' | 'offline' | 'error'
                    last_beat: string
                    metadata: Json
                }
                Insert: {
                    id?: string
                    service?: string
                    status?: 'online' | 'offline' | 'error'
                    last_beat?: string
                    metadata?: Json
                }
                Update: {
                    id?: string
                    service?: string
                    status?: 'online' | 'offline' | 'error'
                    last_beat?: string
                    metadata?: Json
                }
            }
            bot_files: {
                Row: {
                    id: string
                    name: string
                    path: string
                    size_bytes: number | null
                    mime_type: string | null
                    category: 'context' | 'template' | 'asset' | 'export'
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    path: string
                    size_bytes?: number | null
                    mime_type?: string | null
                    category?: 'context' | 'template' | 'asset' | 'export'
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    path?: string
                    size_bytes?: number | null
                    mime_type?: string | null
                    category?: 'context' | 'template' | 'asset' | 'export'
                }
            }
            bot_models: {
                Row: {
                    id: string
                    name: string
                    provider: string
                    model_id: string
                    enabled: boolean
                    is_default: boolean
                    config: Json
                }
                Insert: {
                    id?: string
                    name: string
                    provider: string
                    model_id: string
                    enabled?: boolean
                    is_default?: boolean
                    config?: Json
                }
                Update: {
                    id?: string
                    name?: string
                    provider?: string
                    model_id?: string
                    enabled?: boolean
                    is_default?: boolean
                    config?: Json
                }
            }
            bot_voices: {
                Row: {
                    id: string
                    name: string
                    provider: string
                    voice_id: string
                    language: string
                    enabled: boolean
                    is_default: boolean
                }
                Insert: {
                    id?: string
                    name: string
                    provider: string
                    voice_id: string
                    language?: string
                    enabled?: boolean
                    is_default?: boolean
                }
                Update: {
                    id?: string
                    name?: string
                    provider?: string
                    voice_id?: string
                    language?: string
                    enabled?: boolean
                    is_default?: boolean
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}

// Helper types for easier usage
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
