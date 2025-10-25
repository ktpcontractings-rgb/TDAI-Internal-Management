import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { db, Agent, Decision, Communication } from './db';
import { nanoid } from 'nanoid';
import { generateAgentRecommendation } from './rag-system';
import { retrieveAndDecryptCodex } from './encryption';
import { loadKnowledgeBase } from './knowledge-loader';

const t = initTRPC.create();

const publicProcedure = t.procedure;
const router = t.router;

// --- AGENTS ROUTER ---
const agentsRouter = router({
    list: publicProcedure.query(async () => {
        // Simulate fetching agents from DB
        const agents = await db.query.agents.findMany();
        return agents.map(agent => ({
            ...agent,
            lastSeen: agent.lastSeen.toISOString(), // Ensure ISO string for frontend
        }));
    }),
    communications: router({
        list: publicProcedure
            .input(z.object({ agentId: z.string() }))
            .query(async ({ input }) => {
                // Simulate fetching messages for a specific agent
                const allMessages = await db.query.agentCommunications.findMany();
                return allMessages.filter(m => m.agentId === input.agentId).map(msg => ({
                    ...msg,
                    timestamp: msg.timestamp.toISOString(), // Ensure ISO string for frontend
                }));
            }),
        send: publicProcedure
            .input(z.object({
                agentId: z.string(),
                message: z.string(),
                direction: z.enum(['ceo_to_agent', 'agent_to_ceo']),
            }))
            .mutation(async ({ input }) => {
                const newMessage: Communication = {
                    id: Math.floor(Math.random() * 1000) + 3, // Mock ID
                    agentId: input.agentId,
                    message: input.message,
                    direction: input.direction,
                    timestamp: new Date(),
                };
                await db.insert.agentCommunications(newMessage);
                return { ...newMessage, timestamp: newMessage.timestamp.toISOString() };
            }),
    }),
    decisions: router({
        list: publicProcedure.query(async () => {
            // Simulate fetching pending decisions
            const allDecisions = await db.query.agentDecisions.findMany();
            return allDecisions.filter(d => d.status === 'pending');
        }),
        update: publicProcedure
            .input(z.object({
                decisionId: z.string(),
                status: z.enum(['approved', 'rejected']),
            }))
            .mutation(async ({ input }) => {
                // Simulate updating decision status
                const updatedDecision = await db.update.agentDecisions(input.decisionId, input.status);
                if (!updatedDecision) {
                    throw new Error("Decision not found");
                }
                return updatedDecision;
            }),
    }),
});

// --- AGENT REASONING ROUTER ---
const agentReasoningRouter = router({
    initializeAgent: publicProcedure
        .input(z.object({ agent: z.enum(['cto', 'pm', 'em', 'le', 'ceo']) }))
        .mutation(async ({ input }) => {
            // Simulate agent initialization
            const agentNameMap: Record<z.infer<typeof input>['agent'], string> = {
                cto: 'Dr. Zade Sterling (CTO)',
                pm: 'Ms. Elara Vance (PM)',
                em: 'Mr. Alex Chen (EM)',
                le: 'Dr. Jane Doe (LE)',
                ceo: 'Mr. Teddy Danger (CEO)',
            };

            const newAgent: Agent = {
                id: `${input.agent}_agent_${nanoid(5)}`,
                name: agentNameMap[input.agent],
                status: 'learning',
                lastSeen: new Date(),
            };
            await db.insert.agents(newAgent);
            return { ...newAgent, lastSeen: newAgent.lastSeen.toISOString() };
        }),
    generateRecommendation: publicProcedure
        .input(z.object({
            agent: z.string(),
            topic: z.string(),
            context: z.string(),
            businessSituation: z.string(),
        }))
        .query(async ({ input }) => {
            // Use the mock RAG system
            return generateAgentRecommendation(input);
        }),
    loadKnowledgeBase: publicProcedure.mutation(async () => {
        // Use the mock knowledge loader
        return loadKnowledgeBase();
    }),
});

// --- DOCUMENTS ROUTER ---
const documentsRouter = router({
    retrieve: publicProcedure
        .input(z.object({
            documentId: z.string(),
            password: z.string(),
        }))
        .mutation(async ({ input }) => {
            // Use the mock encryption system
            if (input.documentId !== 'TDAI_GENESIS_CODEX') {
                throw new Error("Document not found.");
            }
            return retrieveAndDecryptCodex(input.password);
        }),
});

// --- METRICS ROUTER ---
const metricsRouter = router({
    // Placeholder for metrics.*
});

export const appRouter = router({
    agents: agentsRouter,
    agentReasoning: agentReasoningRouter,
    documents: documentsRouter,
    metrics: metricsRouter,
});

export type AppRouter = typeof appRouter;
