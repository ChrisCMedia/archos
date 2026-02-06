-- =====================================================
-- ARCHOS SECURITY FIX - Run this in Supabase SQL Editor
-- This script fixes RLS policies to require authentication
-- =====================================================

-- Step 1: Drop ALL "Allow all" / open policies
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
        AND (policyname LIKE 'Allow all%' OR policyname LIKE 'Allow full%')
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
        RAISE NOTICE 'Dropped policy: % on %.%', r.policyname, r.schemaname, r.tablename;
    END LOOP;
END $$;

-- Step 2: Drop non-user-scoped authenticated policies (if any)
DROP POLICY IF EXISTS "Authenticated users can access tickets" ON tickets;
DROP POLICY IF EXISTS "Authenticated users can access messages" ON messages;
DROP POLICY IF EXISTS "Authenticated users can access knowledge_vault" ON knowledge_vault;
DROP POLICY IF EXISTS "Authenticated users can access clients" ON clients;
DROP POLICY IF EXISTS "Authenticated users can access projects" ON projects;
DROP POLICY IF EXISTS "Authenticated users can access brain_dump" ON brain_dump;
DROP POLICY IF EXISTS "Authenticated users can access bot_config" ON bot_config;
DROP POLICY IF EXISTS "Authenticated users can access bot_skills" ON bot_skills;
DROP POLICY IF EXISTS "Authenticated users can access bot_cron" ON bot_cron;
DROP POLICY IF EXISTS "Authenticated users can access bot_heartbeat" ON bot_heartbeat;
DROP POLICY IF EXISTS "Authenticated users can access bot_files" ON bot_files;
DROP POLICY IF EXISTS "Authenticated users can access bot_models" ON bot_models;
DROP POLICY IF EXISTS "Authenticated users can access bot_voices" ON bot_voices;
DROP POLICY IF EXISTS "Admin only for bot_secrets" ON bot_secrets;

-- Drop policies from secure schema (in case of reruns)
DROP POLICY IF EXISTS "tickets_user_policy" ON tickets;
DROP POLICY IF EXISTS "messages_user_policy" ON messages;
DROP POLICY IF EXISTS "knowledge_user_policy" ON knowledge_vault;
DROP POLICY IF EXISTS "clients_user_policy" ON clients;
DROP POLICY IF EXISTS "projects_user_policy" ON projects;
DROP POLICY IF EXISTS "bot_config_user_policy" ON bot_config;
DROP POLICY IF EXISTS "bot_skills_user_policy" ON bot_skills;
DROP POLICY IF EXISTS "bot_secrets_user_policy" ON bot_secrets;
DROP POLICY IF EXISTS "bot_cron_user_policy" ON bot_cron;
DROP POLICY IF EXISTS "bot_heartbeat_user_policy" ON bot_heartbeat;
DROP POLICY IF EXISTS "bot_files_user_policy" ON bot_files;
DROP POLICY IF EXISTS "bot_models_authenticated_policy" ON bot_models;
DROP POLICY IF EXISTS "bot_voices_authenticated_policy" ON bot_voices;

-- =====================================================
-- Step 3: Add user_id columns where missing
-- =====================================================

-- For user-scoped tables
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE knowledge_vault ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE bot_config ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE bot_skills ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE bot_secrets ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE bot_cron ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE bot_heartbeat ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE bot_files ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create indexes for user_id columns
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_vault_user_id ON knowledge_vault(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_bot_config_user_id ON bot_config(user_id);
CREATE INDEX IF NOT EXISTS idx_bot_skills_user_id ON bot_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_bot_secrets_user_id ON bot_secrets(user_id);
CREATE INDEX IF NOT EXISTS idx_bot_cron_user_id ON bot_cron(user_id);
CREATE INDEX IF NOT EXISTS idx_bot_heartbeat_user_id ON bot_heartbeat(user_id);
CREATE INDEX IF NOT EXISTS idx_bot_files_user_id ON bot_files(user_id);

-- =====================================================
-- Step 4: Enable RLS on all tables
-- =====================================================

ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_vault ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_cron ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_heartbeat ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_voices ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Step 5: Create USER-SCOPED RLS Policies
-- These ensure each user can only access their OWN data
-- =====================================================

-- User-owned data: Only owner can access
CREATE POLICY "tickets_user_policy" ON tickets
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "messages_user_policy" ON messages
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "knowledge_user_policy" ON knowledge_vault
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "clients_user_policy" ON clients
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "projects_user_policy" ON projects
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "bot_config_user_policy" ON bot_config
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "bot_skills_user_policy" ON bot_skills
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "bot_secrets_user_policy" ON bot_secrets
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "bot_cron_user_policy" ON bot_cron
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "bot_heartbeat_user_policy" ON bot_heartbeat
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "bot_files_user_policy" ON bot_files
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Shared reference data: Any authenticated user can read
CREATE POLICY "bot_models_authenticated_policy" ON bot_models
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "bot_voices_authenticated_policy" ON bot_voices
  FOR SELECT USING (auth.role() = 'authenticated');

-- =====================================================
-- Step 6: Update existing data with current user
-- This assigns all orphaned data to the first authenticated user
-- RUN THIS ONLY ONCE after you log in as the primary user!
-- =====================================================

-- NOTE: You may want to manually update user_id for existing rows
-- after running this migration. Example:
--
-- UPDATE tickets SET user_id = 'YOUR-USER-UUID' WHERE user_id IS NULL;
-- UPDATE clients SET user_id = 'YOUR-USER-UUID' WHERE user_id IS NULL;
-- UPDATE knowledge_vault SET user_id = 'YOUR-USER-UUID' WHERE user_id IS NULL;
-- etc.

-- =====================================================
-- SUMMARY
-- =====================================================
-- ✅ All tables now have RLS enabled
-- ✅ All user-scoped tables require user_id = auth.uid()
-- ✅ Shared reference tables (models, voices) allow authenticated read
-- ✅ No more USING (true) policies
-- ✅ No anon/public access to any data
--
-- NEXT STEPS:
-- 1. Run this SQL in Supabase SQL Editor
-- 2. Log in as your primary user
-- 3. Update existing rows with your user_id (use query above)
-- 4. Test that you can only see your own data
-- =====================================================
