import { pgTable, serial, text, timestamp, boolean, integer, primaryKey } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const agents = pgTable('agents', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  role: text('role').notNull(), // e.g., 'cto', 'pm', 'em', 'le', 'ceo'
  status: text('status').notNull(), // e.g., 'idle', 'working', 'learning'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastSeen: timestamp('last_seen').defaultNow().notNull(),
});

export const agentCommunications = pgTable('agentCommunications', {
  id: serial('id').primaryKey(),
  agentId: text('agent_id').references(() => agents.id).notNull(),
  message: text('message').notNull(),
  direction: text('direction').notNull(), // 'ceo_to_agent', 'agent_to_ceo'
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

export const agentDecisions = pgTable('agentDecisions', {
  id: text('id').primaryKey(),
  agentId: text('agent_id').references(() => agents.id).notNull(),
  description: text('description').notNull(),
  status: text('status').notNull(), // 'pending', 'approved', 'rejected'
  recommendation: text('recommendation').notNull(), // The RAG system output
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const agentLearningLog = pgTable('agentLearningLog', {
  id: serial('id').primaryKey(),
  agentId: text('agent_id').references(() => agents.id).notNull(),
  experience: text('experience').notNull(), // Log of what the agent learned
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

export const businessMetrics = pgTable('businessMetrics', {
  id: serial('id').primaryKey(),
  metricName: text('metric_name').notNull(),
  value: integer('value').notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

export const encryptedDocuments = pgTable('encryptedDocuments', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  encryptedContent: text('encrypted_content').notNull(),
  encryptionKeyId: text('encryption_key_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const documentAccessLog = pgTable('documentAccessLog', {
  id: serial('id').primaryKey(),
  documentId: text('document_id').references(() => encryptedDocuments.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});
