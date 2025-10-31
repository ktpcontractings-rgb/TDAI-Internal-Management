import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { db } from './db';
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
        const allAgents = await db.agents.findMany();
        return allAgents;
    }),
    communications: router({
        list: publicProcedure
            .input(z.object({ agentId: z.string() }))
            .query(async ({ input }) => {
                const messages = await db.agentCommunications.findByAgentId(input.agentId);
                return messages;
            }),
        send: publicProcedure
            .input(z.object({
                agentId: z.string(),
                message: z.string(),
                direction: z.enum(['ceo_to_agent', 'agent_to_ceo']),
            }))
            .mutation(async ({ input }) => {
                // For mock: we'll create a simple communication
                // In real implementation, this would trigger agent response
                const newMessage = await db.agentCommunications.create({
                    fromAgentId: input.direction === 'ceo_to_agent' ? 'ceo' : input.agentId,
                    toAgentId: input.direction === 'ceo_to_agent' ? input.agentId : 'ceo',
                    message: input.message,
                });
                return newMessage;
            }),
    }),
    decisions: router({
        list: publicProcedure
            .input(z.object({ agentId: z.string() }))
            .query(async ({ input }) => {
                const decisions = await db.agentDecisions.findByAgentId(input.agentId);
                return decisions;
            }),
        approve: publicProcedure
            .input(z.object({ decisionId: z.string() }))
            .mutation(async ({ input }) => {
                const updated = await db.agentDecisions.update(input.decisionId, {
                    status: 'approved',
                });
                return updated;
            }),
        reject: publicProcedure
            .input(z.object({ decisionId: z.string() }))
            .mutation(async ({ input }) => {
                const updated = await db.agentDecisions.update(input.decisionId, {
                    status: 'rejected',
                });
                return updated;
            }),
    }),
    initialize: publicProcedure
        .input(z.object({ role: z.enum(['PM', 'CTO']) }))
        .mutation(async ({ input }) => {
            const agentId = nanoid();
            const agent = await db.agents.create({
                name: `${input.role} Agent`,
                role: input.role,
                status: 'active',
            });

            // Create initial decision for approval
            const decision = await db.agentDecisions.create({
                agentId: agent.id,
                decision: `Initialize ${input.role} agent with RAG capabilities`,
                status: 'pending',
            });

            return { agent, decision };
        }),
});

// --- MAIN ROUTER ---
export const appRouter = router({
    agents: agentsRouter,
});

export type AppRouter = typeof appRouter;
