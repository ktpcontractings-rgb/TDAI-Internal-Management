import { readFileSync } from 'fs';
import { join } from 'path';
import OpenAI from 'openai';
import { db } from '../db-selector';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface KnowledgeDocument {
  id: string;
  title: string;
  specialty: 'BANKRUPTCY' | 'FAMILY_LAW' | 'CRIMINAL';
  content: string;
  category: string;
  tags: string[];
  relevance_score: number;
}

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return response.data[0].embedding;
}

async function seedKnowledgeBase() {
  console.log('🌱 Starting knowledge base seeding...\n');

  const specialties = [
    { name: 'bankruptcy-law', specialty: 'BANKRUPTCY' as const },
    { name: 'family-law', specialty: 'FAMILY_LAW' as const },
    { name: 'criminal-defense', specialty: 'CRIMINAL' as const },
  ];

  let totalDocuments = 0;
  let totalErrors = 0;

  for (const { name, specialty } of specialties) {
    console.log(`\n📚 Processing ${name}...`);
    
    try {
      const filePath = join(__dirname, '..', 'knowledge', `${name}.json`);
      const fileContent = readFileSync(filePath, 'utf-8');
      const documents: KnowledgeDocument[] = JSON.parse(fileContent);

      console.log(`   Found ${documents.length} documents`);

      for (const doc of documents) {
        try {
          // Generate embedding for the document content
          console.log(`   - Embedding: ${doc.title.substring(0, 50)}...`);
          const embedding = await generateEmbedding(
            `${doc.title}\n\n${doc.content}`
          );

          // Store in database
          await db.knowledgeBases.create({
            specialty: doc.specialty,
            title: doc.title,
            content: doc.content,
            category: doc.category,
            tags: doc.tags,
            embedding: embedding,
            relevanceScore: doc.relevance_score,
          });

          totalDocuments++;
          console.log(`   ✅ Stored: ${doc.title}`);
        } catch (error) {
          console.error(`   ❌ Error processing ${doc.title}:`, error);
          totalErrors++;
        }
      }

      console.log(`   ✅ Completed ${name}: ${documents.length} documents`);
    } catch (error) {
      console.error(`   ❌ Error loading ${name}:`, error);
      totalErrors++;
    }
  }

  console.log(`\n🎉 Seeding complete!`);
  console.log(`   ✅ Total documents: ${totalDocuments}`);
  console.log(`   ❌ Total errors: ${totalErrors}`);
}

// Run the seeding
seedKnowledgeBase()
  .then(() => {
    console.log('\n✅ Knowledge base seeding finished!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  });
