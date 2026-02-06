-- ARCHOS Security Fix: WITH CHECK Policies
-- Run this AFTER the Fort Knox migration
-- =====================================================

-- Fix all policies with proper WITH CHECK clauses
-- This ensures INSERT operations are also validated

-- 1. TICKETS
DROP POLICY IF EXISTS "Owner Access Tickets" ON tickets;
CREATE POLICY "Owner Access Tickets" ON tickets
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 2. CLIENTS
DROP POLICY IF EXISTS "Owner Access Clients" ON clients;
CREATE POLICY "Owner Access Clients" ON clients
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. PROJECTS
DROP POLICY IF EXISTS "Owner Access Projects" ON projects;
CREATE POLICY "Owner Access Projects" ON projects
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. BOT CONFIG
DROP POLICY IF EXISTS "Owner Access Config" ON bot_config;
CREATE POLICY "Owner Access Config" ON bot_config
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. MESSAGES
DROP POLICY IF EXISTS "Owner Access Messages" ON messages;
CREATE POLICY "Owner Access Messages" ON messages
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6. BOT SKILLS
DROP POLICY IF EXISTS "Owner Access Skills" ON bot_skills;
CREATE POLICY "Owner Access Skills" ON bot_skills
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 7. KNOWLEDGE VAULT
DROP POLICY IF EXISTS "Owner Access Knowledge" ON knowledge_vault;
CREATE POLICY "Owner Access Knowledge" ON knowledge_vault
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 8. BOT CRON
DROP POLICY IF EXISTS "Owner Access Cron" ON bot_cron;
CREATE POLICY "Owner Access Cron" ON bot_cron
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 9. BOT SECRETS
DROP POLICY IF EXISTS "Owner Access Secrets" ON bot_secrets;
CREATE POLICY "Owner Access Secrets" ON bot_secrets
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Heartbeat policies are already correct (public read, service_role write)

-- =====================================================
-- SEED DATA (Optional - for testing)
-- =====================================================

-- Insert default heartbeat entry for Klaus
INSERT INTO bot_heartbeat (service, status, last_beat, metadata)
VALUES ('klaus', 'offline', NOW() - INTERVAL '1 hour', '{}')
ON CONFLICT DO NOTHING;
