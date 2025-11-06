// Production database configuration using Drizzle ORM and Neon PostgreSQL
import { pgTable, text, timestamp, serial, jsonb, integer, decimal, boolean } from 'drizzle-orm/pg-core';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config();

// --- Database Schema ---
export const agentsTable = pgTable('agents', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  role: text('role').notNull(),
  status: text("status").notNull(),
  recommendation: jsonb("recommendation"),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const agentDecisionsTable = pgTable('agentDecisions', {
  id: text('id').primaryKey(),
  agentId: text('agent_id').notNull(),
  decision: text('decision').notNull(),
  status: text('status').notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

export const agentCommunicationsTable = pgTable('agentCommunications', {
  id: serial('id').primaryKey(),
  fromAgentId: text('from_agent_id').notNull(),
  toAgentId: text('to_agent_id').notNull(),
  message: text('message').notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  role: text('role').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Trainer Agent Table
export const trainerAgentTable = pgTable('trainer_agent', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  status: text('status').notNull(),
  totalAgentsTrained: integer('total_agents_trained').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Special Agents Table
export const specialAgentsTable = pgTable('special_agents', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  title: text('title'),
  specialty: text('specialty').notNull(),
  persona: jsonb('persona'),
  knowledgeBaseId: text('knowledge_base_id'),
  performanceScore: decimal('performance_score', { precision: 5, scale: 2 }),
  status: text('status').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastTrainedAt: timestamp('last_trained_at'),
});

// --- Database Connection ---
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const queryClient = postgres(DATABASE_URL);
const drizzleDb = drizzle(queryClient, {
  schema: { 
    agents: agentsTable, 
    agentDecisions: agentDecisionsTable, 
    agentCommunications: agentCommunicationsTable, 
    users: usersTable,
    trainerAgent: trainerAgentTable,
    specialAgents: specialAgentsTable
  },
});

// --- Database Interface (compatible with mock db) ---
export const db = {
  agents: {
    findMany: async () => {
      const results = await drizzleDb.select().from(agentsTable);
      return results;
    },
    create: async (agent: { name: string; role: string; status: string; recommendation?: any }) => {
      const id = `agent_${Date.now()}`;
      const [newAgent] = await drizzleDb.insert(agentsTable).values({
        id,
        ...agent,
      }).returning();
      return newAgent;
    },
    findById: async (id: string) => {
      const [agent] = await drizzleDb.select().from(agentsTable).where(eq(agentsTable.id, id));
      return agent || null;
    },
    update: async (id: string, data: Partial<{ name: string; role: string; status: string; recommendation?: any }>) => {
      const [updated] = await drizzleDb.update(agentsTable)
        .set(data)
        .where(eq(agentsTable.id, id))
        .returning();
      return updated || null;
    },
    delete: async (id: string) => {
      const result = await drizzleDb.delete(agentsTable).where(eq(agentsTable.id, id));
      return true;
    },
  },
  agentCommunications: {
    findMany: async () => {
      const results = await drizzleDb.select().from(agentCommunicationsTable);
      return results;
    },
    create: async (comm: { fromAgentId: string; toAgentId: string; message: string }) => {
      const [newComm] = await drizzleDb.insert(agentCommunicationsTable).values(comm).returning();
      return newComm;
    },
    findByAgentId: async (agentId: string) => {
      const results = await drizzleDb.select().from(agentCommunicationsTable).where(
        eq(agentCommunicationsTable.fromAgentId, agentId)
      );
      return results;
    },
  },
  agentDecisions: {
    findMany: async () => {
      const results = await drizzleDb.select().from(agentDecisionsTable);
      return results;
    },
    create: async (decision: { agentId: string; decision: string; status: string }) => {
      const id = `decision_${Date.now()}`;
      const [newDecision] = await drizzleDb.insert(agentDecisionsTable).values({
        id,
        ...decision,
      }).returning();
      return newDecision;
    },
    findByAgentId: async (agentId: string) => {
      const results = await drizzleDb.select().from(agentDecisionsTable).where(
        eq(agentDecisionsTable.agentId, agentId)
      );
      return results;
    },
    update: async (id: string, data: Partial<{ status: string }>) => {
      const [updated] = await drizzleDb.update(agentDecisionsTable)
        .set(data)
        .where(eq(agentDecisionsTable.id, id))
        .returning();
      return updated || null;
    },
  },
  users: {
    findMany: async () => {
      const results = await drizzleDb.select().from(usersTable);
      return results;
    },
    create: async (user: { email: string; name: string; role: string }) => {
      const [newUser] = await drizzleDb.insert(usersTable).values(user).returning();
      return newUser;
    },
  },
  trainerAgent: {
    findFirst: async () => {
      const [trainer] = await drizzleDb.select().from(trainerAgentTable).limit(1);
      return trainer || null;
    },
    create: async (trainer: { name: string; status: string; totalAgentsTrained?: number }) => {
      const id = `trainer_${Date.now()}`;
      const [newTrainer] = await drizzleDb.insert(trainerAgentTable).values({
        id,
        totalAgentsTrained: 0,
        ...trainer,
      }).returning();
      return newTrainer;
    },
    update: async (id: string, data: Partial<{ status: string; totalAgentsTrained: number }>) => {
      const [updated] = await drizzleDb.update(trainerAgentTable)
        .set(data)
        .where(eq(trainerAgentTable.id, id))
        .returning();
      return updated || null;
    },
  },
  specialAgents: {
    findMany: async () => {
      const results = await drizzleDb.select().from(specialAgentsTable);
      return results;
    },
    create: async (agent: { 
      name: string; 
      title?: string;
      specialty: string; 
      status: string; 
      persona?: any;
      knowledgeBaseId?: string;
      performanceScore?: string;
    }) => {
      const id = `agent_${Date.now()}`;
      const [newAgent] = await drizzleDb.insert(specialAgentsTable).values({
        id,
        ...agent,
      }).returning();
      return newAgent;
    },
    findById: async (id: string) => {
      const [agent] = await drizzleDb.select().from(specialAgentsTable).where(eq(specialAgentsTable.id, id));
      return agent || null;
    },
    update: async (id: string, data: Partial<{ 
      status: string; 
      performanceScore: string;
      lastTrainedAt: Date;
    }>) => {
      const [updated] = await drizzleDb.update(specialAgentsTable)
        .set(data)
        .where(eq(specialAgentsTable.id, id))
        .returning();
      return updated || null;
    },
  },
};}
