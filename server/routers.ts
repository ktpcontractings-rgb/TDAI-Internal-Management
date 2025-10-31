import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { db } from './db-selector';
import { nanoid } from 'nanoid';
import { generateAgentRecommendation } from './lib/rag-system';
import { initializeKnowledgeBase } from './lib/knowledge-loader';

const t = initTRPC.create();

const publicProcedure = t.procedure;
const router = t.router;

// Track if knowledge base has been initialized
let knowledgeBaseInitialized = false;

// Agent personas
const AGENT_PERSONAS = {
  CTO: {
    name: "Dr. Zade Sterling",
    role: "CTO",
    title: "Chief Technology Officer",
    description: "World-class CTO with expertise in system design, distributed systems, and cloud architecture",
  },
  PM: {
    name: "Maya Singh",
    role: "PM",
    title: "Product Manager",
    description: "World-class PM with expertise in product strategy, customer research, and go-to-market",
  },
  CEO: {
    name: "Dr. Evelyn Reed",
    role: "CEO",
    title: "Chief Executive Officer",
    description: "Visionary CEO with expertise in strategy, fundraising, and company building",
  },
  CFO: {
    name: "Marcus Chen",
    role: "CFO",
    title: "Chief Financial Officer",
    description: "Expert CFO with expertise in financial planning, unit economics, and investor relations",
  },
  GC: {
    name: "Sarah Martinez",
    role: "GC",
    title: "General Counsel",
    description: "Expert General Counsel with expertise in corporate law, compliance, and risk management",
  },
};

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

  /**
   * Initialize an intelligent agent with RAG-powered recommendations
   */
  initialize: publicProcedure
    .input(z.object({ role: z.enum(['PM', 'CTO', 'CEO', 'CFO', 'GC']) }))
    .mutation(async ({ input }) => {
      console.log(`\n🚀 Initializing ${input.role} Agent...`);

      // Initialize knowledge base on first agent creation
      if (!knowledgeBaseInitialized) {
        try {
          console.log("📚 Initializing knowledge base (first time)...");
          await initializeKnowledgeBase();
          knowledgeBaseInitialized = true;
          console.log("✅ Knowledge base initialized!");
        } catch (error) {
          console.error("⚠️  Knowledge base initialization failed (will continue with agent creation):", error);
          // Continue anyway - agent can still be created without knowledge base
        }
      }

      // Get agent persona
      const persona = AGENT_PERSONAS[input.role];

      // Create agent in database
      const agent = await db.agents.create({
        name: persona.name,
        role: input.role,
        status: 'active',
      });

      console.log(`✅ Created agent: ${persona.name} (${agent.id})`);

      // Generate initial strategic recommendation using RAG
      let recommendation = null;
      let decision = null;

      try {
        console.log(`🧠 Generating strategic recommendation for ${persona.name}...`);

        const recommendationRequest = {
          agent: input.role.toLowerCase() as "cto" | "pm" | "ceo",
          topic: getInitialTopic(input.role),
          context: "TDAI is a pre-seed legal tech startup in Michigan building AI-powered legal management platform",
          businessSituation: getBusinessSituation(input.role),
        };

        recommendation = await generateAgentRecommendation(recommendationRequest);

        console.log(`✅ Recommendation generated: ${recommendation.title}`);

        // Create decision for CEO approval
        decision = await db.agentDecisions.create({
          agentId: agent.id,
          decision: recommendation.title,
          status: 'pending',
        });

        console.log(`✅ Decision created for approval`);
      } catch (error) {
        console.error(`⚠️  Failed to generate recommendation:`, error);
        // Create fallback decision
        decision = await db.agentDecisions.create({
          agentId: agent.id,
          decision: `Initialize ${persona.name} as ${persona.title}`,
          status: 'pending',
        });
      }

      console.log(`\n🎉 ${persona.name} initialized successfully!\n`);

      return {
        agent,
        decision,
        recommendation,
      };
    }),
});

/**
 * Get initial topic for agent's first recommendation
 */
function getInitialTopic(role: string): string {
  const topics: Record<string, string> = {
    CTO: "System architecture and technology stack for legal tech platform",
    PM: "Product strategy and go-to-market for legal tech SaaS",
    CEO: "Strategic vision and fundraising strategy",
    CFO: "Financial planning and unit economics",
    GC: "Legal structure and compliance requirements",
  };
  return topics[role] || "Strategic recommendation";
}

/**
 * Get business situation context for agent
 */
function getBusinessSituation(role: string): string {
  const situations: Record<string, string> = {
    CTO: `TDAI is building an AI-powered legal management platform. We need to decide on our technology stack, system architecture, and infrastructure approach. We're a pre-seed startup with limited resources but ambitious goals to serve law firms and corporate legal departments. We need recommendations on:
- Technology stack (backend, frontend, database)
- System architecture (monolith vs microservices)
- AI/LLM integration approach
- Infrastructure and hosting strategy
- Security and compliance considerations for legal data`,

    PM: `TDAI is entering the legal tech market with an AI-powered management platform. We need to define our product strategy, identify our target customers, and plan our go-to-market approach. We're competing with established players but have unique AI capabilities. We need recommendations on:
- Target customer segments (law firms vs corporate legal)
- Product positioning and differentiation
- Pricing strategy and business model
- Go-to-market and customer acquisition
- Product roadmap and feature prioritization`,

    CEO: `TDAI is a pre-seed legal tech startup with a vision to transform legal management with AI. We need to define our strategic vision, plan our fundraising approach, and build the right team. We're based in Michigan and targeting the legal tech market. We need recommendations on:
- Strategic vision and mission
- Fundraising strategy and investor targeting
- Team building and hiring priorities
- Market opportunity and competitive positioning
- Milestones and timeline for next 12-18 months`,

    CFO: `TDAI is a pre-seed startup planning to raise our seed round. We need to establish our financial planning, understand our unit economics, and prepare for investor due diligence. We need recommendations on:
- Financial model and projections
- Unit economics and pricing strategy
- Burn rate and runway planning
- Fundraising targets and use of funds
- Key financial metrics to track`,

    GC: `TDAI is building an AI-powered legal platform handling sensitive legal data. We need to establish our legal structure, ensure compliance, and manage risk. We need recommendations on:
- Corporate structure and governance
- Data privacy and security compliance (GDPR, CCPA)
- Terms of service and customer contracts
- Intellectual property protection
- Regulatory compliance for legal tech`,
  };

  return situations[role] || "Provide strategic recommendations for TDAI's growth";
}

// --- MAIN ROUTER ---
export const appRouter = router({
  agents: agentsRouter,
});

export type AppRouter = typeof appRouter;
