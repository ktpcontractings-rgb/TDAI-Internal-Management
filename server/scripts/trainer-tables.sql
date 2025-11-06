-- Database Migration for Trainer Tables
-- Run this in your Neon database SQL editor

-- Create trainer_agent table
CREATE TABLE IF NOT EXISTS trainer_agent (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL,
  total_agents_trained INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create special_agents table
CREATE TABLE IF NOT EXISTS special_agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT,
  specialty TEXT NOT NULL,
  persona JSONB,
  knowledge_base_id TEXT,
  performance_score DECIMAL(5, 2),
  status TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  last_trained_at TIMESTAMP
);

-- Verify tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('trainer_agent', 'special_agents');

-- Show table structures
\d trainer_agent
\d special_agents
