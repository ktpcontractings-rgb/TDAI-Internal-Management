-- Migration: Add Trainer Agent and Special Agents System
-- This creates all necessary tables for the Trainer, Special Agents, and Knowledge Base

-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Trainer Agent table
CREATE TABLE IF NOT EXISTS trainer_agent (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive')),
  total_agents_trained INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Special Agents (Customer-Facing Legal Specialists)
CREATE TABLE IF NOT EXISTS special_agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  nickname TEXT,
  specialty TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  persona JSONB,
  system_prompt TEXT,
  key_areas JSONB,
  jurisdictions JSONB,
  knowledge_base_id TEXT,
  performance_score DECIMAL(5, 2) DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('active', 'training', 'inactive')),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  last_trained_at TIMESTAMP
);

-- Knowledge Bases (One per legal specialty)
CREATE TABLE IF NOT EXISTS knowledge_bases (
  id TEXT PRIMARY KEY,
  specialty TEXT NOT NULL UNIQUE,
  documents JSONB DEFAULT '[]'::jsonb,
  document_count INTEGER DEFAULT 0,
  last_updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Legal Documents with vector embeddings
CREATE TABLE IF NOT EXISTS legal_documents (
  id TEXT PRIMARY KEY,
  specialty TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('statute', 'case_law', 'practice_guide', 'regulation', 'form_template')),
  jurisdiction TEXT NOT NULL,
  citation TEXT,
  summary TEXT,
  key_points JSONB DEFAULT '[]'::jsonb,
  embedding vector(1536), -- OpenAI text-embedding-3-small produces 1536-dimensional vectors
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS legal_documents_embedding_idx 
ON legal_documents USING ivfflat (embedding vector_cosine_ops);

-- Create index for specialty filtering
CREATE INDEX IF NOT EXISTS legal_documents_specialty_idx 
ON legal_documents(specialty);

-- Training Sessions
CREATE TABLE IF NOT EXISTS training_sessions (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL REFERENCES special_agents(id) ON DELETE CASCADE,
  trainer_id TEXT NOT NULL REFERENCES trainer_agent(id),
  training_type TEXT NOT NULL CHECK (training_type IN ('initial', 'update', 'remedial')),
  knowledge_added JSONB DEFAULT '[]'::jsonb,
  performance_before DECIMAL(5, 2),
  performance_after DECIMAL(5, 2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Agent Performance Metrics
CREATE TABLE IF NOT EXISTS agent_metrics (
  id SERIAL PRIMARY KEY,
  agent_id TEXT NOT NULL REFERENCES special_agents(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('accuracy', 'customer_satisfaction', 'response_time', 'knowledge_coverage')),
  value DECIMAL(10, 2) NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create index for efficient metric queries
CREATE INDEX IF NOT EXISTS agent_metrics_agent_timestamp_idx 
ON agent_metrics(agent_id, timestamp DESC);

-- Customer Interactions (for learning and improvement)
CREATE TABLE IF NOT EXISTS customer_interactions (
  id SERIAL PRIMARY KEY,
  agent_id TEXT NOT NULL REFERENCES special_agents(id) ON DELETE CASCADE,
  customer_id TEXT,
  customer_query TEXT NOT NULL,
  agent_response TEXT NOT NULL,
  customer_feedback TEXT,
  satisfaction_score INTEGER CHECK (satisfaction_score BETWEEN 1 AND 5),
  flagged_for_review BOOLEAN DEFAULT FALSE,
  reviewed_by TEXT,
  review_notes TEXT,
  timestamp TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create index for flagged interactions
CREATE INDEX IF NOT EXISTS customer_interactions_flagged_idx 
ON customer_interactions(flagged_for_review, timestamp DESC) 
WHERE flagged_for_review = TRUE;

-- Agent Prompts (versioned for A/B testing)
CREATE TABLE IF NOT EXISTS agent_prompts (
  id SERIAL PRIMARY KEY,
  agent_id TEXT NOT NULL REFERENCES special_agents(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  system_prompt TEXT NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  performance_score DECIMAL(5, 2),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE(agent_id, version)
);

-- Ensure only one active prompt per agent
CREATE UNIQUE INDEX IF NOT EXISTS agent_prompts_active_idx 
ON agent_prompts(agent_id) 
WHERE is_active = TRUE;

-- Agent Conversations (for context and learning)
CREATE TABLE IF NOT EXISTS agent_conversations (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL REFERENCES special_agents(id) ON DELETE CASCADE,
  customer_id TEXT,
  messages JSONB DEFAULT '[]'::jsonb,
  started_at TIMESTAMP DEFAULT NOW() NOT NULL,
  last_message_at TIMESTAMP DEFAULT NOW() NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'archived'))
);

-- Create index for active conversations
CREATE INDEX IF NOT EXISTS agent_conversations_active_idx 
ON agent_conversations(agent_id, status, last_message_at DESC) 
WHERE status = 'active';

-- Insert initial Trainer agent
INSERT INTO trainer_agent (id, name, status, total_agents_trained, created_at)
VALUES ('trainer_001', 'Professor Atlas Sterling', 'active', 0, NOW())
ON CONFLICT (id) DO NOTHING;

-- Create function to update last_message_at on conversation updates
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_message_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for conversation updates
DROP TRIGGER IF EXISTS update_conversation_timestamp_trigger ON agent_conversations;
CREATE TRIGGER update_conversation_timestamp_trigger
BEFORE UPDATE ON agent_conversations
FOR EACH ROW
EXECUTE FUNCTION update_conversation_timestamp();

-- Create function to increment trainer's agent count
CREATE OR REPLACE FUNCTION increment_trainer_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE trainer_agent 
  SET total_agents_trained = total_agents_trained + 1
  WHERE id = 'trainer_001';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new agent creation
DROP TRIGGER IF EXISTS increment_trainer_count_trigger ON special_agents;
CREATE TRIGGER increment_trainer_count_trigger
AFTER INSERT ON special_agents
FOR EACH ROW
EXECUTE FUNCTION increment_trainer_count();
