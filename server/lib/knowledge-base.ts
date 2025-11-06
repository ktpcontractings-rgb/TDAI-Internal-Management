// Knowledge Base Management System with Neon Vector Storage
import OpenAI from 'openai';
import { neon } from '@neondatabase/serverless';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const sql = neon(process.env.DATABASE_URL!);

// Legal document types
export type DocumentType = 'statute' | 'case_law' | 'practice_guide' | 'regulation' | 'form_template';

export interface LegalDocument {
  id: string;
  title: string;
  content: string;
  type: DocumentType;
  specialty: string;
  jurisdiction: string;
  effectiveDate?: string;
  citation?: string;
  summary?: string;
  keyPoints?: string[];
  relevanceScore?: number;
  metadata?: Record<string, any>;
}

/**
 * Initialize knowledge base for a specialty
 */
export async function initializeKnowledgeBase(specialty: string) {
  const kbId = `kb_${specialty}_${Date.now()}`;
  
  // Create knowledge base record
  await sql`
    INSERT INTO knowledge_bases (id, specialty, documents, document_count, last_updated_at)
    VALUES (${kbId}, ${specialty}, '[]'::jsonb, 0, NOW())
    ON CONFLICT (specialty) DO NOTHING
  `;

  return {
    id: kbId,
    specialty,
    documentCount: 0,
    createdAt: new Date().toISOString()
  };
}

/**
 * Add documents to knowledge base
 */
export async function addDocumentsToKnowledgeBase(
  specialty: string,
  documents: LegalDocument[]
) {
  // Generate embeddings for each document
  const documentsWithEmbeddings = await Promise.all(
    documents.map(async (doc) => {
      const embedding = await generateEmbedding(doc.content);
      return {
        ...doc,
        embedding,
        addedAt: new Date().toISOString()
      };
    })
  );

  // Store in Neon with vector embeddings
  for (const doc of documentsWithEmbeddings) {
    await sql`
      INSERT INTO legal_documents (
        id, specialty, title, content, type, jurisdiction,
        citation, summary, key_points, embedding, metadata, created_at
      ) VALUES (
        ${doc.id},
        ${specialty},
        ${doc.title},
        ${doc.content},
        ${doc.type},
        ${doc.jurisdiction},
        ${doc.citation || null},
        ${doc.summary || null},
        ${JSON.stringify(doc.keyPoints || [])},
        ${JSON.stringify(doc.embedding)},
        ${JSON.stringify(doc.metadata || {})},
        NOW()
      )
    `;
  }

  // Update knowledge base document count
  await sql`
    UPDATE knowledge_bases
    SET document_count = document_count + ${documents.length},
        last_updated_at = NOW()
    WHERE specialty = ${specialty}
  `;

  return {
    specialty,
    documentsAdded: documents.length,
    timestamp: new Date().toISOString()
  };
}

/**
 * Generate embedding for text using OpenAI
 */
async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });

  return response.data[0].embedding;
}

/**
 * Search knowledge base using vector similarity
 */
export async function searchKnowledgeBase(
  specialty: string,
  query: string,
  limit: number = 5
): Promise<LegalDocument[]> {
  // Generate embedding for the query
  const queryEmbedding = await generateEmbedding(query);

  // Vector similarity search in Neon
  // Note: This requires pgvector extension to be enabled
  const results = await sql`
    SELECT 
      id, specialty, title, content, type, jurisdiction,
      citation, summary, key_points, metadata,
      1 - (embedding <=> ${JSON.stringify(queryEmbedding)}::vector) as similarity
    FROM legal_documents
    WHERE specialty = ${specialty}
    ORDER BY embedding <=> ${JSON.stringify(queryEmbedding)}::vector
    LIMIT ${limit}
  `;

  return results.map((row: any) => ({
    id: row.id,
    title: row.title,
    content: row.content,
    type: row.type,
    specialty: row.specialty,
    jurisdiction: row.jurisdiction,
    citation: row.citation,
    summary: row.summary,
    keyPoints: JSON.parse(row.key_points || '[]'),
    relevanceScore: row.similarity,
    metadata: JSON.parse(row.metadata || '{}')
  }));
}

/**
 * Get relevant context for an agent query
 */
export async function getRelevantContext(
  specialty: string,
  query: string,
  maxTokens: number = 2000
): Promise<string> {
  const relevantDocs = await searchKnowledgeBase(specialty, query, 5);

  if (relevantDocs.length === 0) {
    return "No specific legal documents found for this query.";
  }

  // Build context from relevant documents
  let context = "RELEVANT LEGAL KNOWLEDGE:\n\n";
  let tokenCount = 0;

  for (const doc of relevantDocs) {
    const docText = `
[${doc.type.toUpperCase()}] ${doc.title}
${doc.citation ? `Citation: ${doc.citation}` : ''}
${doc.summary || doc.content.substring(0, 500)}
Relevance: ${(doc.relevanceScore! * 100).toFixed(1)}%
---
`;
    
    // Rough token estimation (1 token ≈ 4 characters)
    const estimatedTokens = docText.length / 4;
    
    if (tokenCount + estimatedTokens > maxTokens) {
      break;
    }

    context += docText;
    tokenCount += estimatedTokens;
  }

  return context;
}

/**
 * Seed initial knowledge base with common legal knowledge
 */
export async function seedKnowledgeBase(specialty: string) {
  const seedData = getSeedDataForSpecialty(specialty);
  
  if (seedData.length > 0) {
    await addDocumentsToKnowledgeBase(specialty, seedData);
  }

  return {
    specialty,
    documentsSeed: seedData.length
  };
}

/**
 * Get seed data for a specialty
 */
function getSeedDataForSpecialty(specialty: string): LegalDocument[] {
  const seedData: Record<string, LegalDocument[]> = {
    bankruptcy: [
      {
        id: 'doc_bankruptcy_001',
        title: 'Chapter 7 Bankruptcy Overview',
        content: `Chapter 7 bankruptcy, also known as "liquidation bankruptcy," is the most common form of bankruptcy for individuals. It involves the liquidation of non-exempt assets to pay creditors. Most unsecured debts are discharged, providing the debtor with a fresh financial start. The process typically takes 3-6 months from filing to discharge.

Key aspects:
- Means test requirement to qualify
- Automatic stay stops collection activities
- Trustee appointed to administer the case
- Non-exempt assets may be sold
- Most unsecured debts discharged
- Cannot file again for 8 years

Exempt assets typically include:
- Primary residence (up to state limits)
- Personal vehicle (up to certain value)
- Household goods and furnishings
- Retirement accounts
- Tools of trade`,
        type: 'practice_guide',
        specialty: 'bankruptcy',
        jurisdiction: 'federal',
        summary: 'Overview of Chapter 7 bankruptcy liquidation process',
        keyPoints: [
          'Liquidation of non-exempt assets',
          'Discharge of unsecured debts',
          'Means test requirement',
          'Automatic stay protection',
          '3-6 month process'
        ]
      },
      {
        id: 'doc_bankruptcy_002',
        title: 'Automatic Stay Protection - 11 U.S.C. § 362',
        content: `The automatic stay is one of the most powerful protections in bankruptcy law. Upon filing a bankruptcy petition, an automatic stay immediately goes into effect, halting most collection activities against the debtor.

The stay prohibits:
- Lawsuits and legal proceedings
- Wage garnishments
- Foreclosure proceedings
- Repossession of property
- Collection calls and letters
- Utility disconnections

Exceptions to the stay:
- Criminal proceedings
- Child support and alimony collection
- Tax audits (in some cases)
- Evictions (if judgment already obtained)

Violations of the automatic stay can result in sanctions against creditors, including damages and attorney fees.`,
        type: 'statute',
        specialty: 'bankruptcy',
        jurisdiction: 'federal',
        citation: '11 U.S.C. § 362',
        summary: 'Automatic stay halts collection activities upon bankruptcy filing',
        keyPoints: [
          'Immediate protection upon filing',
          'Stops lawsuits and garnishments',
          'Prevents foreclosure and repossession',
          'Violations can result in sanctions',
          'Some exceptions apply'
        ]
      }
    ],
    family_law: [
      {
        id: 'doc_family_001',
        title: 'Michigan Child Support Guidelines',
        content: `Michigan uses a formula-based system to calculate child support obligations. The Michigan Child Support Formula considers both parents' incomes, the number of children, and the parenting time arrangement.

Key factors:
- Gross income of both parents
- Number of overnight stays with each parent
- Health insurance costs
- Childcare expenses
- Other children from other relationships

The formula aims to ensure children receive financial support proportionate to both parents' incomes. Deviations from the formula are possible but must be justified and in the child's best interest.

Support typically continues until the child turns 18 or graduates from high school, whichever is later, but not beyond age 19.5.`,
        type: 'practice_guide',
        specialty: 'family_law',
        jurisdiction: 'michigan',
        summary: 'Overview of Michigan child support calculation',
        keyPoints: [
          'Formula-based calculation',
          'Considers both parents\' incomes',
          'Accounts for parenting time',
          'Includes health insurance and childcare',
          'Continues until 18 or high school graduation'
        ]
      }
    ],
    criminal: [
      {
        id: 'doc_criminal_001',
        title: 'Michigan OWI/DUI Laws - MCL 257.625',
        content: `Operating While Intoxicated (OWI) in Michigan is a serious offense with significant penalties. A person is considered intoxicated if their blood alcohol content (BAC) is 0.08% or higher, or if they are substantially impaired by alcohol or drugs.

First Offense Penalties:
- Up to 93 days in jail
- Fines up to $500
- License suspension for 30 days, restricted for 150 days
- Possible vehicle immobilization
- 6 points on driving record
- Possible community service

Second Offense (within 7 years):
- Up to 1 year in jail
- Fines up to $1,000
- License revocation for minimum 1 year
- Vehicle immobilization or forfeiture
- Mandatory alcohol treatment

Third Offense:
- Felony charge
- Up to 5 years in prison
- Fines up to $5,000
- License revocation for minimum 5 years
- Vehicle forfeiture

Defenses may include challenging the traffic stop, breathalyzer accuracy, field sobriety test administration, or rising BAC.`,
        type: 'statute',
        specialty: 'criminal',
        jurisdiction: 'michigan',
        citation: 'MCL 257.625',
        summary: 'Michigan OWI/DUI laws and penalties',
        keyPoints: [
          '0.08% BAC legal limit',
          'Escalating penalties for repeat offenses',
          'License suspension/revocation',
          'Possible jail time and fines',
          'Various defenses available'
        ]
      }
    ]
  };

  return seedData[specialty] || [];
}

/**
 * Update knowledge base with new legal developments
 */
export async function updateKnowledgeBase(
  specialty: string,
  updates: LegalDocument[]
) {
  // Add new documents
  await addDocumentsToKnowledgeBase(specialty, updates);

  // TODO: Identify and mark outdated documents
  // TODO: Notify affected agents of updates

  return {
    specialty,
    updatesAdded: updates.length,
    timestamp: new Date().toISOString()
  };
}
