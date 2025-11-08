// Cleanup duplicate agents - keep only professional names
import { db } from './server/db-selector.js';

// Professional names to keep
const KEEP_AGENTS = [
  'Michael Sterling, Esq.',
  'Sarah Mitchell, Esq.',
  'David Morrison, Esq.',
  'Elena Rodriguez, Esq.',
  'Marcus Thompson, Esq.',
  'Jennifer Chen, Esq.',
  'Robert Harrison, Esq.',
  'Patricia Williams, Esq.',
];

async function cleanupDuplicates() {
  console.log('🧹🧹🧹 CLEANING UP DUPLICATE AGENTS!!! 🧹🧹🧹\n');
  
  // Get all specialized agents
  const allAgents = await db.specialAgents.findMany();
  
  console.log(`📊 Found ${allAgents.length} total agents\n`);
  
  const toKeep: any[] = [];
  const toDelete: any[] = [];
  
  // Categorize agents
  for (const agent of allAgents) {
    if (KEEP_AGENTS.includes(agent.name)) {
      toKeep.push(agent);
      console.log(`✅ KEEP: ${agent.name} (${agent.specialty})`);
    } else {
      toDelete.push(agent);
      console.log(`❌ DELETE: ${agent.name} (${agent.specialty})`);
    }
  }
  
  console.log('\n' + '='.repeat(70));
  console.log(`\n📊 SUMMARY:`);
  console.log(`✅ Agents to keep: ${toKeep.length}`);
  console.log(`❌ Agents to delete: ${toDelete.length}`);
  
  if (toDelete.length === 0) {
    console.log('\n🎯 No duplicates found! Database is clean!');
    process.exit(0);
  }
  
  console.log('\n🗑️  Deleting duplicate agents...\n');
  
  let deletedCount = 0;
  for (const agent of toDelete) {
    try {
      console.log(`   Deleting: ${agent.name} (ID: ${agent.id})`);
      await db.specialAgents.delete(agent.id);
      
      deletedCount++;
    } catch (error: any) {
      console.error(`   ❌ Failed to delete ${agent.name}:`, error.message);
    }
  }
  
  console.log(`\n✅ Deleted ${deletedCount} duplicate agents`);
  console.log(`✅ Kept ${toKeep.length} professional agents`);
  
  console.log('\n🎯 CLEANUP COMPLETE!');
  console.log('🌐 View at: https://tdai-internal-management.vercel.app/trainer');
  
  process.exit(0);
}

cleanupDuplicates().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
