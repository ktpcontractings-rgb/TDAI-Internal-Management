import { Pinecone } from "@pinecone-database/pinecone";
import { generateEmbedding } from "./llm";

/**
 * Pinecone Integration for TDAI Knowledge Base
 * Stores and retrieves management knowledge (case studies, best practices)
 */

// Initialize Pinecone client
let pineconeClient: Pinecone | null = null;

function getPineconeClient(): Pinecone {
  if (!pineconeClient) {
    const apiKey = process.env.PINECONE_API_KEY;
    if (!apiKey || apiKey === "placeholder") {
      throw new Error("PINECONE_API_KEY is not set or is placeholder");
    }
    pineconeClient = new Pinecone({ apiKey });
  }
  return pineconeClient;
}

// Get or create index
async function getIndex() {
  const client = getPineconeClient();
  const indexName = "tdai-agent-knowledge";
  const index = client.Index(indexName);
  return index;
}

// Types for knowledge base
export interface KnowledgeDocument {
  id: string;
  type: "curriculum" | "case_study" | "scenario" | "best_practice";
  agent: "cto" | "pm" | "em" | "le" | "ceo" | "cfo" | "gc";
  title: string;
  content: string;
  metadata: {
    course?: string;
    company?: string;
    industry?: string;
    tags: string[];
  };
}

/**
 * Upload knowledge document to Pinecone
 */
export async function uploadKnowledgeDocument(doc: KnowledgeDocument) {
  try {
    const index = await getIndex();
    const embedding = await generateEmbedding(doc.content);

    await index.upsert([
      {
        id: doc.id,
        values: embedding,
        metadata: {
          type: doc.type,
          agent: doc.agent,
          title: doc.title,
          content: doc.content.substring(0, 1000), // Store first 1000 chars
          tags: doc.metadata.tags.join(","),
          company: doc.metadata.company || "",
          industry: doc.metadata.industry || "",
          course: doc.metadata.course || "",
        },
      },
    ]);

    console.log(`✅ Uploaded knowledge document: ${doc.id}`);
    return { success: true, id: doc.id };
  } catch (error) {
    console.error("❌ Error uploading knowledge document:", error);
    throw error;
  }
}

/**
 * Search knowledge base
 */
export async function searchKnowledge(
  query: string,
  agent: string,
  topK: number = 5
) {
  try {
    const index = await getIndex();
    const queryEmbedding = await generateEmbedding(query);

    const results = await index.query({
      vector: queryEmbedding,
      topK,
      filter: {
        agent: { $eq: agent },
      },
      includeMetadata: true,
    });

    return results.matches.map((match) => ({
      id: match.id,
      score: match.score,
      metadata: match.metadata,
    }));
  } catch (error) {
    console.error("❌ Error searching knowledge base:", error);
    throw error;
  }
}

/**
 * Retrieve relevant knowledge for agent recommendation
 */
export async function retrieveKnowledgeForRecommendation(
  agent: string,
  topic: string,
  context: string
) {
  try {
    console.log(`📚 Retrieving knowledge for ${agent} on topic: ${topic}`);

    // Search for relevant curriculum
    const curriculumResults = await searchKnowledge(
      `${topic} ${context}`,
      agent,
      3
    );

    // Search for relevant case studies
    const caseStudyResults = await searchKnowledge(
      `case study ${topic}`,
      agent,
      2
    );

    // Search for relevant scenarios
    const scenarioResults = await searchKnowledge(`scenario ${topic}`, agent, 2);

    console.log(`✅ Retrieved ${curriculumResults.length + caseStudyResults.length + scenarioResults.length} knowledge documents`);

    return {
      curriculum: curriculumResults,
      caseStudies: caseStudyResults,
      scenarios: scenarioResults,
    };
  } catch (error) {
    console.error("❌ Error retrieving knowledge:", error);
    throw error;
  }
}

export default {
  getIndex,
  uploadKnowledgeDocument,
  searchKnowledge,
  retrieveKnowledgeForRecommendation,
};
