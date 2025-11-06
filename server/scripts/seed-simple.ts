/**
 * Simple Knowledge Base Seeder
 * 
 * This script seeds the knowledge_bases table with legal specialty data
 * for Baron von Bankruptcy, Mary Matrimonial, and Legal Evil Esquire.
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface KnowledgeDocument {
  id: string;
  title: string;
  specialty: string;
  content: string;
  category: string;
  tags: string[];
  relevance_score: number;
}

async function seedKnowledgeBase() {
  console.log('🌱 Starting knowledge base seeding...\n');

  const specialties = [
    { name: 'bankruptcy-law', specialty: 'BANKRUPTCY', agentName: 'Baron von Bankruptcy' },
    { name: 'family-law', specialty: 'FAMILY_LAW', agentName: 'Mary Matrimonial' },
    { name: 'criminal-defense', specialty: 'CRIMINAL', agentName: 'Legal Evil Esquire' },
  ];

  const knowledgeBases: any[] = [];

  for (const { name, specialty, agentName } of specialties) {
    console.log(`\n📚 Processing ${name} for ${agentName}...`);
    
    try {
      const filePath = join(__dirname, '..', 'knowledge', `${name}.json`);
      const fileContent = readFileSync(filePath, 'utf-8');
      const documents: KnowledgeDocument[] = JSON.parse(fileContent);

      console.log(`   Found ${documents.length} documents`);

      const knowledgeBase = {
        id: `kb_${specialty.toLowerCase()}`,
        specialty: specialty,
        documents: documents,
        documentCount: documents.length,
        lastUpdatedAt: new Date().toISOString(),
      };

      knowledgeBases.push(knowledgeBase);
      
      console.log(`   ✅ Prepared knowledge base for ${agentName}`);
      console.log(`   📊 Total documents: ${documents.length}`);
    } catch (error) {
      console.error(`   ❌ Error loading ${name}:`, error);
    }
  }

  console.log(`\n\n🎉 Knowledge bases prepared!`);
  console.log(`   Total specialties: ${knowledgeBases.length}`);
  console.log(`   Total documents: ${knowledgeBases.reduce((sum, kb) => sum + kb.documentCount, 0)}`);
  
  console.log(`\n📝 Knowledge Base Summary:\n`);
  for (const kb of knowledgeBases) {
    console.log(`   ${kb.specialty}:`);
    console.log(`      - ID: ${kb.id}`);
    console.log(`      - Documents: ${kb.documentCount}`);
    console.log(`      - Categories: ${[...new Set(kb.documents.map((d: any) => d.category))].join(', ')}`);
    console.log(``);
  }

  // Output as JSON for manual insertion if needed
  console.log(`\n💾 Saving to knowledge-bases-seed.json...`);
  const outputPath = join(__dirname, '..', 'knowledge', 'knowledge-bases-seed.json');
  const fs = await import('fs/promises');
  await fs.writeFile(outputPath, JSON.stringify(knowledgeBases, null, 2));
  console.log(`   ✅ Saved to ${outputPath}`);
  
  return knowledgeBases;
}

// Run the seeding
seedKnowledgeBase()
  .then((result) => {
    console.log('\n✅ Knowledge base preparation complete!');
    console.log(`\n🚀 Next steps:`);
    console.log(`   1. The knowledge bases are ready to be used by Special Agents`);
    console.log(`   2. When a Special Agent is created, it will reference these knowledge bases`);
    console.log(`   3. The RAG system will use these documents to answer customer questions`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Preparation failed:', error);
    process.exit(1);
  });
