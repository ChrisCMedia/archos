-- ARCHOS Phase 2: CRM, Clawdbot Parity, Real Status
-- Run this in Supabase SQL Editor AFTER the initial migration

-- =====================================================
-- CRM TABLES
-- =====================================================

-- Clients
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  status TEXT DEFAULT 'lead' CHECK (status IN ('lead', 'prospect', 'active', 'churned')),
  industry TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'paused', 'completed', 'cancelled')),
  budget DECIMAL(12,2),
  currency TEXT DEFAULT 'EUR',
  deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update tickets table to link to clients/projects
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE SET NULL;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE SET NULL;

-- =====================================================
-- CLAWDBOT PARITY TABLES
-- =====================================================

-- Bot Cronjobs (Scheduled Tasks)
CREATE TABLE IF NOT EXISTS bot_cron (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  schedule TEXT NOT NULL, -- cron expression e.g. "0 9 * * *"
  command TEXT NOT NULL, -- what to execute
  enabled BOOLEAN DEFAULT TRUE,
  last_run TIMESTAMPTZ,
  next_run TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bot Heartbeat (Real Status Tracking)
CREATE TABLE IF NOT EXISTS bot_heartbeat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service TEXT NOT NULL DEFAULT 'klaus',
  status TEXT DEFAULT 'online' CHECK (status IN ('online', 'offline', 'error')),
  last_beat TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Bot Files (References to Storage)
CREATE TABLE IF NOT EXISTS bot_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  size_bytes BIGINT,
  mime_type TEXT,
  category TEXT DEFAULT 'context' CHECK (category IN ('context', 'template', 'asset', 'export')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bot Models (Available AI Models)
CREATE TABLE IF NOT EXISTS bot_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  model_id TEXT NOT NULL UNIQUE,
  enabled BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  config JSONB DEFAULT '{}'
);

-- Bot Voices (TTS Voices)
CREATE TABLE IF NOT EXISTS bot_voices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'elevenlabs',
  voice_id TEXT NOT NULL UNIQUE,
  language TEXT DEFAULT 'en',
  enabled BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_tickets_client_id ON tickets(client_id);
CREATE INDEX IF NOT EXISTS idx_tickets_project_id ON tickets(project_id);
CREATE INDEX IF NOT EXISTS idx_bot_cron_enabled ON bot_cron(enabled);
CREATE INDEX IF NOT EXISTS idx_bot_heartbeat_service ON bot_heartbeat(service);

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE OR REPLACE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_bot_cron_updated_at
  BEFORE UPDATE ON bot_cron
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_cron ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_heartbeat ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_voices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can access clients" ON clients
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can access projects" ON projects
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can access bot_cron" ON bot_cron
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can access bot_heartbeat" ON bot_heartbeat
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can access bot_files" ON bot_files
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can access bot_models" ON bot_models
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can access bot_voices" ON bot_voices
  FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- REALTIME SUBSCRIPTIONS
-- =====================================================

ALTER PUBLICATION supabase_realtime ADD TABLE clients;
ALTER PUBLICATION supabase_realtime ADD TABLE projects;
ALTER PUBLICATION supabase_realtime ADD TABLE bot_cron;
ALTER PUBLICATION supabase_realtime ADD TABLE bot_heartbeat;

-- =====================================================
-- SEED DATA
-- =====================================================

-- Insert default heartbeat (offline until bot connects)
INSERT INTO bot_heartbeat (service, status, last_beat) VALUES
  ('klaus', 'offline', NOW() - INTERVAL '1 hour')
ON CONFLICT DO NOTHING;

-- Insert available models
INSERT INTO bot_models (name, provider, model_id, enabled, is_default) VALUES
  ('Claude Opus 4', 'Anthropic', 'claude-opus-4', true, true),
  ('Claude Sonnet 4', 'Anthropic', 'claude-sonnet-4', true, false),
  ('GPT-4o', 'OpenAI', 'gpt-4o', true, false),
  ('GPT-4 Turbo', 'OpenAI', 'gpt-4-turbo', true, false),
  ('Gemini 2.0 Flash', 'Google', 'gemini-2.0-flash', true, false),
  ('Gemini 2.0 Pro', 'Google', 'gemini-2.0-pro', false, false)
ON CONFLICT (model_id) DO NOTHING;

-- Insert available voices
INSERT INTO bot_voices (name, provider, voice_id, language, enabled, is_default) VALUES
  ('Adam', 'elevenlabs', 'pNInz6obpgDQGcFmaJgB', 'en', true, true),
  ('Rachel', 'elevenlabs', '21m00Tcm4TlvDq8ikWAM', 'en', true, false),
  ('Domi', 'elevenlabs', 'AZnzlk1XvdvUeBnXmlld', 'en', true, false),
  ('Bella', 'elevenlabs', 'EXAVITQu4vr4xnSDxMaL', 'en', true, false),
  ('Antoni', 'elevenlabs', 'ErXwobaYiN019PkySvjV', 'en', true, false)
ON CONFLICT (voice_id) DO NOTHING;

-- Insert sample cron jobs
INSERT INTO bot_cron (name, description, schedule, command, enabled) VALUES
  ('Daily Summary', 'Generate daily business summary', '0 9 * * *', 'generate_summary', true),
  ('Ticket Cleanup', 'Archive old completed tickets', '0 0 * * 0', 'archive_tickets', true),
  ('Health Check', 'Ping all integrations', '*/15 * * * *', 'health_check', false)
ON CONFLICT DO NOTHING;
