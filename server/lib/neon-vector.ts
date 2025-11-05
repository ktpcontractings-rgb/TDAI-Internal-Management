import { neon } from "@neondatabase/serverless";
import { generateEmbedding } from "./llm";

const sql = neon(process.env.DATABASE_URL!);

// Initialize pgvector extension
export async function initializeVectorDB() {
  try {
    await sql`CREATE EXTENSION IF NOT EXISTS vector`;
    
    await sql`
      CREATE TABLE IF NOT EXISTS knowledge_documents (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        agent TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        embedding vector(1536),
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    
    await sql`
      CREATE INDEX IF NOT EXISTS knowledge_documents_embedding_idx 
      ON knowledge_documents 
      USING hnsw (embedding vector_cosine_ops)
    `;
    
    console.log("✅ Vector database initialized");
  } catch (error) {
    console.error("❌ Error initializing vector database:", error);
    throw error;
  }
}

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

export async function uploadKnowledgeDocument(doc: KnowledgeDocument) {
  try {
    const embedding = await generateEmbedding(doc.content);
    
    await sql`
      INSERT INTO knowledge_documents (id, type, agent, title, content, embedding, metadata)
      VALUES (
        ${doc.id},
        ${doc.type},
        ${doc.agent},
        ${doc.title},
        ${doc.content},
        ${JSON.stringify(embedding)},
        ${JSON.stringify(doc.metadata)}
      )
      ON CONFLICT (id) DO UPDATE SET
        type = EXCLUDED.type,
        agent = EXCLUDED.agent,
        title = EXCLUDED.title,
        content = EXCLUDED.content,
        embedding = EXCLUDED.embedding,
        metadata = EXCLUDED.metadata
    `;
    
    console.log(`✅ Uploaded knowledge document: ${doc.id}`);
    return { success: true, id: doc.id };
  } catch (error) {
    console.error("❌ Error uploading knowledge document:", error);
    throw error;
  }
}

export async function searchKnowledge(
  query: string,
  agent: string,
  topK: number = 5
) {
  try {
    const queryEmbedding = await generateEmbedding(query);
    
    const results = await sql`
      SELECT 
        id,
        type,
        agent,
        title,
        content,
        metadata,
        1 - (embedding <=> ${JSON.stringify(queryEmbedding)}::vector) as score
      FROM knowledge_documents
      WHERE agent = ${agent}
      ORDER BY embedding <=> ${JSON.stringify(queryEmbedding)}::vector
      LIMIT ${topK}
    `;
    
    return results.map((row) => ({
      id: row.id,
      score: row.score,
      metadata: {
        type: row.type,
        agent: row.agent,
        title: row.title,
        content: row.content,
        ...row.metadata,
      },
    }));
  } catch (error) {
    console.error("❌ Error searching knowledge base:", error);
    throw error;
  }
}

export async function retrieveKnowledgeForRecommendation(
  agent: string,
  topic: string,
  context: string
) {
  try {
    console.log(`📚 Retrieving knowledge for ${agent} on topic: ${topic}`);
    
    const curriculumResults = await searchKnowledge(
      `${topic} ${context}`,
      agent,
      3
    );
    
    const caseStudyResults = await searchKnowledge(
      `case study ${topic}`,
      agent,
      2
    );
    
    const scenarioResults = await searchKnowledge(
      `scenario ${topic}`,
      agent,
      2
    );
    
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
  initializeVectorDB,
  uploadKnowledgeDocument,
  searchKnowledge,
  retrieveKnowledgeForRecommendation,
};
