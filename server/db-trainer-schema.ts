// Database schema for Trainer Agent and Special Agents system
import { pgTable, text, timestamp, serial, jsonb, decimal, boolean, integer } from 'drizzle-orm/pg-core';

// The Trainer Agent
export const trainerAgentTable = pgTable('trainer_agent', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  status: text('status').notNull(), // 'active', 'inactive'
  totalAgentsTrained: integer('total_agents_trained').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Special Agents (Customer-Facing Legal Specialists)
export const specialAgentsTable = pgTable('special_agents', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  specialty: text('specialty').notNull(), // 'bankruptcy', 'family_law', 'criminal', etc.
  persona: jsonb('persona'), // Agent personality and expertise profile
  knowledgeBaseId: text('knowledge_base_id'),
  performanceScore: decimal('performance_score', { precision: 5, scale: 2 }),
  status: text('status').notNull(), // 'active', 'training', 'inactive'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastTrainedAt: timestamp('last_trained_at'),
});

// Knowledge Bases (One per legal specialty)
export const knowledgeBasesTable = pgTable('knowledge_bases', {
  id: text('id').primaryKey(),
  specialty: text('specialty').notNull().unique(),
  documents: jsonb('documents'), // Array of legal documents
  documentCount: integer('document_count').default(0),
  lastUpdatedAt: timestamp('last_updated_at').defaultNow().notNull(),
});

// Legal Documents (Individual documents with embeddings for RAG)
export const legalDocumentsTable = pgTable('legal_documents', {
  id: serial('id').primaryKey(),
  specialty: text('specialty').notNull(), // 'BANKRUPTCY', 'FAMILY_LAW', 'CRIMINAL'
  title: text('title').notNull(),
  content: text('content').notNull(),
  category: text('category'),
  tags: jsonb('tags'), // Array of tags
  embedding: jsonb('embedding'), // Vector embedding for similarity search
  relevanceScore: decimal('relevance_score', { precision: 3, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Training Sessions
export const trainingSessionsTable = pgTable('training_sessions', {
  id: text('id').primaryKey(),
  agentId: text('agent_id').notNull(),
  trainerId: text('trainer_id').notNull(),
  trainingType: text('training_type').notNull(), // 'initial', 'update', 'remedial'
  knowledgeAdded: jsonb('knowledge_added'),
  performanceBefore: decimal('performance_before', { precision: 5, scale: 2 }),
  performanceAfter: decimal('performance_after', { precision: 5, scale: 2 }),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Agent Performance Metrics
export const agentMetricsTable = pgTable('agent_metrics', {
  id: serial('id').primaryKey(),
  agentId: text('agent_id').notNull(),
  metricType: text('metric_type').notNull(), // 'accuracy', 'customer_satisfaction', 'response_time'
  value: decimal('value', { precision: 10, scale: 2 }).notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

// Customer Interactions (for learning and improvement)
export const customerInteractionsTable = pgTable('customer_interactions', {
  id: serial('id').primaryKey(),
  agentId: text('agent_id').notNull(),
  customerQuery: text('customer_query').notNull(),
  agentResponse: text('agent_response').notNull(),
  customerFeedback: text('customer_feedback'),
  satisfactionScore: integer('satisfaction_score'), // 1-5
  flaggedForReview: boolean('flagged_for_review').default(false),
  reviewedBy: text('reviewed_by'), // Regulatory board member
  reviewNotes: text('review_notes'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

// Agent Prompts (versioned for A/B testing)
export const agentPromptsTable = pgTable('agent_prompts', {
  id: serial('id').primaryKey(),
  agentId: text('agent_id').notNull(),
  version: integer('version').notNull(),
  systemPrompt: text('system_prompt').notNull(),
  isActive: boolean('is_active').default(false),
  performanceScore: decimal('performance_score', { precision: 5, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
