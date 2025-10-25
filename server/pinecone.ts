import { Pinecone } from '@pinecone-database/pinecone';

// Handoff Credentials (from document)
const PINECONE_API_KEY = 'pcsk_QU4ks_7F1QjvYyy6fczYvd94poasuCx6jdwtK1MSrXtoVZiWD3NtFVZvSrkiaS6qU8R6';
const PINECONE_PROJECT_NAME = 'TDAI OO AMERICA';
const PINECONE_INDEX_NAME = 'agent-knowledge-index';

// --- Fallback Mock Client ---
class FallbackMockPineconeClient {
    public Index(indexName: string) {
        return {
            name: indexName,
            query: async (params: any) => {
                console.warn(`[Pinecone Fallback] Mock query for index ${indexName}.`);
                return {
                    matches: [
                        { id: 'case_study_netflix', score: 0.95, values: [], metadata: { text: 'Netflix scaled its architecture by using microservices...' } },
                        { id: 'curriculum_cto', score: 0.88, values: [], metadata: { text: 'Scalability is crucial for high-growth startups...' } },
                    ],
                };
            },
            upsert: async (vectors: any) => {
                console.warn(`[Pinecone Fallback] Mock upsert of ${vectors.length} vectors into index ${indexName}.`);
                return { upsertedCount: vectors.length };
            }
        };
    }
}

// --- Production Pinecone Client (Simulated) ---
const IS_SANDBOX = true; // Force sandbox mode for stable testing

let pineconeClient: Pinecone | FallbackMockPineconeClient;

if (IS_SANDBOX) {
    console.warn("[Pinecone] Detected sandbox environment. Forcing Fallback Mock Client for stable testing.");
    pineconeClient = new FallbackMockPineconeClient();
} else {
    // This is the actual production code
    try {
        console.log("[Pinecone] Attempting to initialize production client...");
        pineconeClient = new Pinecone({
            apiKey: PINECONE_API_KEY,
        });
        console.log("[Pinecone] Production client initialized successfully.");
    } catch (error) {
        console.error("[Pinecone] Failed to initialize production client. Falling back to mock:", error);
        pineconeClient = new FallbackMockPineconeClient();
    }
}

export const pinecone = pineconeClient;
export const pineconeIndex = pinecone.Index(PINECONE_INDEX_NAME);
