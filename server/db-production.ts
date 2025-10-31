// Production database configuration using Drizzle ORM and Neon PostgreSQL
import { pgTable, text, timestamp, serial } from 'drizzle-orm/pg-core';
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
  status: text('status').notNull(),
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
    users: usersTable 
  },
});

// --- Database Interface (compatible with mock db) ---
export const db = {
  agents: {
    findMany: async () => {
      const results = await drizzleDb.select().from(agentsTable);
      return results;
    },
    create: async (agent: { name: string; role: string; status: string }) => {
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
    update: async (id: string, data: Partial<{ name: string; role: string; status: string }>) => {
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
};
