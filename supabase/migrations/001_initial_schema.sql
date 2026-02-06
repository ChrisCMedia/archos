-- ARCHOS Database Schema
-- Run this in Supabase SQL Editor

-- =====================================================
-- BUSINESS TABLES
-- =====================================================

-- Tickets (The Work)
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'backlog' CHECK (status IN ('backlog', 'active', 'review', 'done')),
  agent_mode TEXT DEFAULT 'manual' CHECK (agent_mode IN ('manual', 'assisted', 'autonomous')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  source TEXT DEFAULT 'internal' CHECK (source IN ('internal', 'telegram', 'email', 'web')),
  assignee TEXT,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages (The Chat)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  channel TEXT DEFAULT 'web' CHECK (channel IN ('web', 'telegram', 'email')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Brain Dump (Quick Capture)
CREATE TABLE IF NOT EXISTS brain_dump (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Knowledge Vault (Context/Wiki)
CREATE TABLE IF NOT EXISTS knowledge_vault (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- BOT CONTROL TABLES
-- =====================================================

-- Bot Configuration
CREATE TABLE IF NOT EXISTS bot_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bot Secrets (Encrypted API Keys)
CREATE TABLE IF NOT EXISTS bot_secrets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  encrypted_value TEXT NOT NULL,
  provider TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bot Skills
CREATE TABLE IF NOT EXISTS bot_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT TRUE,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_agent_mode ON tickets(agent_mode);
CREATE INDEX IF NOT EXISTS idx_messages_ticket_id ON messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_brain_dump_processed ON brain_dump(processed);
CREATE INDEX IF NOT EXISTS idx_bot_config_key ON bot_config(key);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_knowledge_vault_updated_at
  BEFORE UPDATE ON knowledge_vault
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_bot_config_updated_at
  BEFORE UPDATE ON bot_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_bot_secrets_updated_at
  BEFORE UPDATE ON bot_secrets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE brain_dump ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_vault ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_skills ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to access business tables
CREATE POLICY "Authenticated users can access tickets" ON tickets
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can access messages" ON messages
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can access brain_dump" ON brain_dump
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can access knowledge_vault" ON knowledge_vault
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can access bot_config" ON bot_config
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can access bot_skills" ON bot_skills
  FOR ALL USING (auth.role() = 'authenticated');

-- CRITICAL: Only admin users can access bot_secrets
-- Adjust this based on your auth setup
CREATE POLICY "Admin only for bot_secrets" ON bot_secrets
  FOR ALL USING (
    auth.role() = 'authenticated' AND 
    (auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'user_metadata' LIKE '%admin%')
  );

-- =====================================================
-- REALTIME SUBSCRIPTIONS
-- =====================================================

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE bot_config;
ALTER PUBLICATION supabase_realtime ADD TABLE bot_skills;

-- =====================================================
-- SEED DATA
-- =====================================================

-- Insert default bot configuration
INSERT INTO bot_config (key, value) VALUES
  ('system_prompt', '"You are Klaus, an intelligent AI assistant for ARCHOS."'::jsonb),
  ('temperature', '0.7'::jsonb),
  ('model', '"claude-opus-4"'::jsonb),
  ('streaming', 'true'::jsonb),
  ('autonomous_mode', 'false'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Insert default skills
INSERT INTO bot_skills (name, description, enabled, config) VALUES
  ('web_search', 'Search the web for information', true, '{}'::jsonb),
  ('code_execution', 'Run code snippets and scripts', true, '{}'::jsonb),
  ('database_access', 'Query and modify Supabase data', true, '{}'::jsonb),
  ('file_system', 'Read and write local files', false, '{}'::jsonb),
  ('telegram_bot', 'Send and receive Telegram messages', true, '{}'::jsonb),
  ('calendar_sync', 'Manage Google Calendar events', false, '{}'::jsonb),
  ('email', 'Send emails via SMTP', false, '{}'::jsonb),
  ('github', 'Interact with GitHub repos', true, '{}'::jsonb),
  ('webhooks', 'Trigger external webhooks', false, '{}'::jsonb)
ON CONFLICT (name) DO NOTHING;
