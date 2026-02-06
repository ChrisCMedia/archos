-- ARCHOS Phase 3: Knowledge Vault
-- Run this in Supabase SQL Editor

-- =====================================================
-- KNOWLEDGE VAULT TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS knowledge_vault (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  category TEXT DEFAULT 'General',
  tags TEXT[] DEFAULT '{}',
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_knowledge_vault_category ON knowledge_vault(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_vault_pinned ON knowledge_vault(is_pinned);

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE OR REPLACE TRIGGER update_knowledge_vault_updated_at
  BEFORE UPDATE ON knowledge_vault
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE knowledge_vault ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to knowledge_vault" ON knowledge_vault
  FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- REALTIME
-- =====================================================

ALTER PUBLICATION supabase_realtime ADD TABLE knowledge_vault;

-- =====================================================
-- SEED DATA
-- =====================================================

INSERT INTO knowledge_vault (title, content, category, is_pinned) VALUES
  ('Welcome to Knowledge Vault', '# Welcome to the Knowledge Vault

This is your personal wiki for storing important information, documentation, and notes.

## Features
- **Markdown Support**: Write in Markdown for rich formatting
- **Categories**: Organize entries by category
- **Search**: Quickly find what you need
- **Pin Important**: Keep critical docs at the top

## Getting Started
Click "New Entry" to create your first knowledge article.', 'Getting Started', true),
  ('API Documentation', '# API Endpoints

## Authentication
All requests require the `Authorization: Bearer <token>` header.

## Endpoints

### GET /api/status
Returns system health status.

### POST /api/messages
Send a message to Klaus.

```json
{
  "content": "Hello Klaus",
  "channel": "web"
}
```', 'Technical', false),
  ('Meeting Notes Template', '# Meeting Notes - [DATE]

## Attendees
- 

## Agenda
1. 
2. 
3. 

## Discussion Points


## Action Items
- [ ] 
- [ ] 

## Next Meeting
Date: ', 'Templates', false)
ON CONFLICT DO NOTHING;
