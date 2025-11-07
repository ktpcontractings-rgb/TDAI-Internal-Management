// tRPC Router for Trainer Agent and Special Agents
import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import {
  initializeTrainer,
  createSpecialAgent,
  trainAgent,
  evaluateAgentPerformance,
  generateTrainingRecommendations,
  AGENT_SPECIALTIES
} from './lib/trainer-agent';
import { db } from './db-selector';

const t = initTRPC.create();
const publicProcedure = t.procedure;
const router = t.router;

export const trainerRouter = router({
  // Initialize The Trainer
  initialize: publicProcedure.mutation(async () => {
    // Check if trainer already exists
    const existingTrainer = await db.trainerAgent.findFirst();
    if (existingTrainer) {
      return { trainer: existingTrainer };
    }
    
    // Create new trainer
    const trainer = await initializeTrainer();
    const savedTrainer = await db.trainerAgent.create({
      name: trainer.name,
      status: 'active',
      totalAgentsTrained: 0,
    });
    return { trainer: savedTrainer };
  }),

  // Get Trainer status (renamed from status to getStatus)
  getStatus: publicProcedure.query(async () => {
    const trainer = await db.trainerAgent.findFirst();
    if (!trainer) {
      return null;
    }
    
    const agents = await db.specialAgents.findMany();
    const activeAgents = agents.filter(a => a.status === 'active').length;
    
    return {
      id: trainer.id,
      name: trainer.name,
      status: trainer.status,
      totalAgentsTrained: trainer.totalAgentsTrained || 0,
      activeAgents,
    };
  }),

  // Special Agents Management
  specialAgents: router({
    // Create a new Special Agent
    create: publicProcedure
      .input(z.object({
        specialty: z.string()
      }))
      .mutation(async ({ input }) => {
        // Map specialty to uppercase format for the lib function
        const specialtyUpper = input.specialty.toUpperCase().replace(' ', '_') as any;
        const agent = await createSpecialAgent(specialtyUpper);
        
        // Save to database
        const savedAgent = await db.specialAgents.create({
          name: agent.name,
          title: agent.title,
          specialty: input.specialty,
          status: 'active',
          persona: agent.persona,
          knowledgeBaseId: `kb_${input.specialty}`,
          performanceScore: '85.0',
        });
        
        // Update trainer's agent count
        const trainer = await db.trainerAgent.findFirst();
        if (trainer) {
          await db.trainerAgent.update(trainer.id, {
            totalAgentsTrained: (trainer.totalAgentsTrained || 0) + 1,
          });
        }
        
        return { agent: savedAgent };
      }),

    // List all Special Agents
    list: publicProcedure.query(async () => {
      const agents = await db.specialAgents.findMany();
      return agents;
    }),

    // Get specific agent details
    get: publicProcedure
      .input(z.object({ agentId: z.string() }))
      .query(async ({ input }) => {
        const agent = await db.specialAgents.findById(input.agentId);
        return agent;
      }),

    // Train an agent
    train: publicProcedure
      .input(z.object({
        agentId: z.string(),
        knowledgeDocuments: z.array(z.any())
      }))
      .mutation(async ({ input }) => {
        const result = await trainAgent(input.agentId, input.knowledgeDocuments);
        // TODO: Save training session to database
        return result;
      }),

    // Delete a Special Agent
    delete: publicProcedure
      .input(z.object({ agentId: z.string() }))
      .mutation(async ({ input }) => {
        await db.specialAgents.delete(input.agentId);
        
        // Update trainer's agent count
        const trainer = await db.trainerAgent.findFirst();
        if (trainer && trainer.totalAgentsTrained > 0) {
          await db.trainerAgent.update(trainer.id, {
            totalAgentsTrained: trainer.totalAgentsTrained - 1,
          });
        }
        
        return { success: true };
      }),

    // Cleanup duplicates and rename to professional names
    cleanup: publicProcedure.mutation(async () => {
      const allAgents = await db.specialAgents.findMany();
      
      // Group agents by specialty
      const agentsBySpecialty: Record<string, any[]> = {};
      for (const agent of allAgents) {
        const specialty = agent.specialty || 'unknown';
        if (!agentsBySpecialty[specialty]) {
          agentsBySpecialty[specialty] = [];
        }
        agentsBySpecialty[specialty].push(agent);
      }

      // Professional name mapping
      const professionalNames: Record<string, { name: string; title: string }> = {
        'bankruptcy': { name: 'Michael Sterling', title: 'Bankruptcy Law Specialist' },
        'family_law': { name: 'Sarah Mitchell', title: 'Family Law Specialist' },
        'criminal': { name: 'David Morrison', title: 'Criminal Defense Specialist' }
      };

      let deletedCount = 0;
      let renamedCount = 0;

      // Process each specialty
      for (const [specialty, agents] of Object.entries(agentsBySpecialty)) {
        if (agents.length === 0) continue;

        // Keep the first agent, delete the rest
        const keepAgent = agents[0];
        const deleteAgents = agents.slice(1);

        // Rename the kept agent if we have a professional name
        const professionalName = professionalNames[specialty];
        if (professionalName) {
          await db.specialAgents.update(keepAgent.id, {
            name: `${professionalName.name}, Esq.`,
            title: professionalName.title
          });
          renamedCount++;
        }

        // Delete duplicates
        for (const agent of deleteAgents) {
          await db.specialAgents.delete(agent.id);
          deletedCount++;
        }
      }

      return { 
        success: true, 
        deletedCount, 
        renamedCount,
        remainingAgents: allAgents.length - deletedCount
      };
    }),

    // Chat with a Special Agent
    chat: publicProcedure
      .input(z.object({
        agentId: z.string(),
        message: z.string(),
        conversationHistory: z.array(z.object({
          role: z.enum(['user', 'assistant']),
          content: z.string()
        })).optional()
      }))
      .mutation(async ({ input }) => {
        // Get agent details
        const agent = await db.specialAgents.findById(input.agentId);
        if (!agent) {
          throw new Error('Agent not found');
        }

        // Build system prompt from agent persona
        const systemPrompt = `You are ${agent.name}, ${agent.title || 'a specialized legal AI agent'}.

Your specialty: ${agent.specialty}

${agent.persona ? JSON.stringify(agent.persona) : 'You provide expert legal guidance and support.'}

Provide helpful, professional, and accurate responses. Always maintain your character and expertise.`;

        // Call OpenAI
        const messages = [
          { role: 'system', content: systemPrompt },
          ...(input.conversationHistory || []),
          { role: 'user', content: input.message }
        ];

        try {
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
              model: 'gpt-4.1-mini',
              messages: messages,
              temperature: 0.7,
              max_tokens: 1000
            })
          });

          const data = await response.json();
          
          if (!response.ok) {
            console.error('OpenAI error:', data);
            throw new Error(data.error?.message || 'Failed to get response from AI');
          }

          return {
            response: data.choices[0].message.content,
            agentId: input.agentId
          };
        } catch (error) {
          console.error('Chat error:', error);
          return {
            response: `I apologize, but I'm having trouble connecting right now. As ${agent.name}, I'm here to help with ${agent.specialty}. Please try again in a moment.`,
            agentId: input.agentId
          };
        }
      })
  }),

  // Knowledge Base Management
  knowledge: router({
    // Upload legal documents
    upload: publicProcedure
      .input(z.object({
        specialty: z.string(),
        documents: z.array(z.object({
          title: z.string(),
          content: z.string(),
          type: z.enum(['statute', 'case_law', 'practice_guide', 'regulation']),
          jurisdiction: z.string(),
          metadata: z.any().optional()
        }))
      }))
      .mutation(async ({ input }) => {
        // TODO: Add documents to knowledge base
        // TODO: Generate embeddings
        // TODO: Store in Neon vector database
        return {
          specialty: input.specialty,
          documentsAdded: input.documents.length
        };
      }),

    // Get knowledge base for a specialty
    get: publicProcedure
      .input(z.object({ specialty: z.string() }))
      .query(async ({ input }) => {
        // TODO: Fetch from database
        return {
          specialty: input.specialty,
          documentCount: 0,
          documents: []
        };
      }),

    // Search knowledge base
    search: publicProcedure
      .input(z.object({
        specialty: z.string(),
        query: z.string(),
        limit: z.number().optional()
      }))
      .query(async ({ input }) => {
        // TODO: Vector similarity search in Neon
        return {
          results: []
        };
      })
  }),

  // Performance & Analytics
  metrics: router({
    // Get agent performance metrics
    agent: publicProcedure
      .input(z.object({ agentId: z.string() }))
      .query(async ({ input }) => {
        // TODO: Fetch metrics from database
        return {
          agentId: input.agentId,
          totalInteractions: 0,
          averageSatisfaction: 0,
          performanceScore: 0
        };
      }),

    // Get overall system metrics
    overall: publicProcedure.query(async () => {
      // TODO: Aggregate metrics across all agents
      return {
        totalAgents: 0,
        totalInteractions: 0,
        averageSatisfaction: 0,
        activeUsers: 0
      };
    }),

    // Evaluate agent performance
    evaluate: publicProcedure
      .input(z.object({ agentId: z.string() }))
      .mutation(async ({ input }) => {
        // TODO: Fetch interactions from database
        const interactions: any[] = [];
        const performance = await evaluateAgentPerformance(input.agentId, interactions);
        return performance;
      })
  }),

  // Feedback & Learning
  feedback: router({
    // Submit customer feedback
    submit: publicProcedure
      .input(z.object({
        agentId: z.string(),
        query: z.string(),
        response: z.string(),
        satisfactionScore: z.number().min(1).max(5),
        feedback: z.string().optional()
      }))
      .mutation(async ({ input }) => {
        // TODO: Save to customer_interactions table
        return {
          success: true,
          interactionId: `interaction_${Date.now()}`
        };
      }),

    // Get flagged interactions for review
    review: publicProcedure.query(async () => {
      // TODO: Fetch flagged interactions from database
      return [];
    }),

    // Generate training recommendations
    recommendations: publicProcedure
      .input(z.object({ agentId: z.string() }))
      .mutation(async ({ input }) => {
        // TODO: Fetch performance data
        const performanceData = {};
        const recommendations = await generateTrainingRecommendations(input.agentId, performanceData);
        return recommendations;
      })
  }),

  // Available specialties
  specialties: publicProcedure.query(async () => {
    return Object.values(AGENT_SPECIALTIES).map(s => ({
      id: s.id,
      name: s.name,
      fullName: s.fullName,
      title: s.title,
      description: s.description,
      keyAreas: s.keyAreas
    }));
  })
});

export type TrainerRouter = typeof trainerRouter;
