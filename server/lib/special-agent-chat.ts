// Special Agent Chat System with RAG (Retrieval-Augmented Generation)
import OpenAI from 'openai';
import { getRelevantContext } from './knowledge-base';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AgentChatRequest {
  agentId: string;
  agentName: string;
  specialty: string;
  systemPrompt: string;
  userMessage: string;
  conversationHistory?: ChatMessage[];
}

export interface AgentChatResponse {
  response: string;
  agentId: string;
  tokensUsed: number;
  relevantKnowledge?: string[];
}

/**
 * Chat with a Special Agent using RAG
 */
export async function chatWithAgent(request: AgentChatRequest): Promise<AgentChatResponse> {
  const {
    agentId,
    agentName,
    specialty,
    systemPrompt,
    userMessage,
    conversationHistory = []
  } = request;

  // Step 1: Retrieve relevant knowledge from the knowledge base
  const relevantContext = await getRelevantContext(specialty, userMessage, 2000);

  // Step 2: Build the enhanced system prompt with retrieved knowledge
  const enhancedSystemPrompt = `${systemPrompt}

RELEVANT LEGAL KNOWLEDGE FOR THIS QUERY:
${relevantContext}

Use the above legal knowledge to inform your response, but always cite specific sources when referencing laws, cases, or regulations.`;

  // Step 3: Build conversation messages
  const messages: ChatMessage[] = [
    { role: 'system', content: enhancedSystemPrompt },
    ...conversationHistory,
    { role: 'user', content: userMessage }
  ];

  // Step 4: Generate response using OpenAI
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: messages as any,
    temperature: 0.7,
    max_tokens: 1000,
  });

  const response = completion.choices[0].message.content || "I apologize, but I'm unable to provide a response at this time.";
  const tokensUsed = completion.usage?.total_tokens || 0;

  // Step 5: Extract relevant knowledge sources mentioned
  const relevantKnowledge = extractKnowledgeSources(relevantContext);

  return {
    response,
    agentId,
    tokensUsed,
    relevantKnowledge
  };
}

/**
 * Extract knowledge sources from context
 */
function extractKnowledgeSources(context: string): string[] {
  const sources: string[] = [];
  const lines = context.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('[') && line.includes(']')) {
      const match = line.match(/\[(.*?)\] (.*)/);
      if (match) {
        sources.push(match[2].trim());
      }
    }
  }

  return sources;
}

/**
 * Generate a quick legal assessment
 */
export async function generateQuickAssessment(
  specialty: string,
  situation: string
): Promise<string> {
  const relevantContext = await getRelevantContext(specialty, situation, 1500);

  const prompt = `Based on the following legal knowledge and the client's situation, provide a brief initial assessment.

LEGAL KNOWLEDGE:
${relevantContext}

CLIENT SITUATION:
${situation}

Provide a structured assessment including:
1. Initial Analysis
2. Relevant Laws/Regulations
3. Potential Options
4. Recommended Next Steps
5. Important Disclaimers

Keep the assessment concise but informative.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'You are a legal AI assistant providing initial case assessments. Be thorough but concise.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 800,
  });

  return completion.choices[0].message.content || "Unable to generate assessment.";
}

/**
 * Generate a legal document based on user input
 */
export async function generateLegalDocument(
  specialty: string,
  documentType: string,
  userInputs: Record<string, any>
): Promise<string> {
  const prompt = `Generate a ${documentType} for ${specialty} with the following information:

${JSON.stringify(userInputs, null, 2)}

The document should be professionally formatted, legally sound, and include all necessary clauses and disclaimers.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'You are a legal document drafting assistant. Generate professional, accurate legal documents.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.5, // Lower temperature for more consistent formatting
    max_tokens: 2000,
  });

  return completion.choices[0].message.content || "Unable to generate document.";
}
