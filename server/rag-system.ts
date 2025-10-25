import { OpenAI } from 'openai';
import { pineconeIndex } from './pinecone';
import { nanoid } from 'nanoid';

// The handoff document states the LLM API is a Manus built-in LLM API
// and the environment variables are already set.
const openai = new OpenAI();

// Mock Embedding function since we don't have a real embedding model
async function getMockEmbedding(text: string): Promise<number[]> {
    // In a real scenario, this would call an embedding model (e.g., text-embedding-3-small)
    // For now, return a fixed vector to ensure Pinecone mock query is deterministic.
    return [0.01, 0.02, 0.03, 0.04, 0.05];
}

/**
 * Executes the RAG process to generate a strategic recommendation.
 * @param params - The input parameters for the recommendation.
 */
export async function generateAgentRecommendation(params: {
    agent: string;
    topic: string;
    context: string;
    businessSituation: string;
}) {
    // 1. Create a query vector
    const query = `${params.agent} recommendation for ${params.topic} in the context of ${params.context} and business situation: ${params.businessSituation}`;
    const queryVector = await getMockEmbedding(query);

    // 2. Retrieve relevant knowledge from Pinecone
    const retrievalResult = await pineconeIndex.query({
        vector: queryVector,
        topK: 5,
        includeMetadata: true,
    });

    // 3. Construct the RAG prompt
    const retrievedContext = retrievalResult.matches.map(m => m.metadata.text).join('\\n---\\n');

    const prompt = `
    You are a hyper-specialized AI agent (${params.agent.toUpperCase()}) for TDAI.
    Your task is to provide a world-class, strategic recommendation.
    
    Topic: ${params.topic}
    Context: ${params.context}
    Situation: ${params.businessSituation}
    
    Retrieved Knowledge (Grounded in real-world case studies):
    ---
    ${retrievedContext}
    ---
    
    Based ONLY on the retrieved knowledge, generate your recommendation.
    `;

    // 4. Generate the recommendation using the LLM
    const response = await openai.chat.completions.create({
        model: 'gpt-4.1-mini', // Using a capable, fast model
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
    });

    const recommendation = response.choices[0].message.content || "Failed to generate recommendation.";
    const source = retrievalResult.matches.map(m => m.metadata.text.substring(0, 30) + '...').join(', ');

    return {
        recommendation,
        source: source || "No knowledge retrieved from Pinecone.",
        timestamp: new Date().toISOString(),
    };
}
