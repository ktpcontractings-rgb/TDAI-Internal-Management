import { pgTable, serial, text, timestamp, boolean } from 'drizzle-orm/pg-core';

// --- Mock Schema for Type Safety ---
export const agents = pgTable('agents', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  status: text('status').notNull(), // e.g., 'idle', 'working', 'learning'
  lastSeen: timestamp('last_seen').notNull(),
});

export const agentDecisions = pgTable('agentDecisions', {
  id: text('id').primaryKey(),
  agentId: text('agent_id').notNull(),
  description: text('description').notNull(),
  status: text('status').notNull(), // 'pending', 'approved', 'rejected'
});

export const agentCommunications = pgTable('agentCommunications', {
  id: serial('id').primaryKey(),
  agentId: text('agent_id').notNull(),
  message: text('message').notNull(),
  direction: text('direction').notNull(), // 'ceo_to_agent', 'agent_to_ceo'
  timestamp: timestamp('timestamp').notNull(),
});

// --- Mock Data ---
let MOCK_AGENTS = [
    { id: 'cto_agent_001', name: 'Dr. Zade Sterling (CTO)', status: 'working', lastSeen: new Date() },
    { id: 'pm_agent_001', name: 'Ms. Elara Vance (PM)', status: 'idle', lastSeen: new Date(Date.now() - 60000) },
];

let MOCK_DECISIONS = [
    { id: 'dec_001', agentId: 'cto_agent_001', description: 'Approve $50k budget for Q4 cloud infrastructure.', status: 'pending' },
    { id: 'dec_002', agentId: 'pm_agent_001', description: 'Reject feature request for "AI-powered coffee maker".', status: 'pending' },
];

let MOCK_MESSAGES = [
    { id: 1, agentId: 'cto_agent_001', message: 'Please provide a 3-month scaling plan.', direction: 'ceo_to_agent', timestamp: new Date(Date.now() - 120000) },
    { id: 2, agentId: 'cto_agent_001', message: 'Scaling plan submitted for review.', direction: 'agent_to_ceo', timestamp: new Date(Date.now() - 60000) },
];

// --- Mock DB Implementation ---
export const db = {
    // Select/Query operations
    query: {
        agents: {
            findMany: () => Promise.resolve(MOCK_AGENTS),
        },
        agentDecisions: {
            findMany: () => Promise.resolve(MOCK_DECISIONS),
        },
        agentCommunications: {
            findMany: () => Promise.resolve(MOCK_MESSAGES),
        },
    },
    // Insert operations
    insert: {
        agents: (newAgent: typeof MOCK_AGENTS[number]) => {
            MOCK_AGENTS.push(newAgent);
            return Promise.resolve([newAgent]);
        },
        agentCommunications: (newMessage: typeof MOCK_MESSAGES[number]) => {
            MOCK_MESSAGES.push(newMessage);
            return Promise.resolve([newMessage]);
        },
    },
    // Update operations
    update: {
        agentDecisions: (decisionId: string, status: string) => {
            const decision = MOCK_DECISIONS.find(d => d.id === decisionId);
            if (decision) {
                decision.status = status;
            }
            MOCK_DECISIONS = MOCK_DECISIONS.filter(d => d.id !== decisionId || d.status === 'pending');
            return Promise.resolve(decision);
        }
    }
};

// Export types
export type Agent = typeof MOCK_AGENTS[number];
export type Decision = typeof MOCK_DECISIONS[number];
export type Communication = typeof MOCK_MESSAGES[number];
