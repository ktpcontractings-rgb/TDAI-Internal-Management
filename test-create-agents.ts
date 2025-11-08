// Direct database test to create 5 new agents
import { createSpecialAgent } from './server/lib/trainer-agent.js';
import { db } from './server/db-selector.js';

const newAgents = [
  { specialty: 'IMMIGRATION', name: 'Immigration Law' },
  { specialty: 'PERSONAL_INJURY', name: 'Personal Injury' },
  { specialty: 'EMPLOYMENT', name: 'Employment Law' },
  { specialty: 'REAL_ESTATE', name: 'Real Estate Law' },
  { specialty: 'ESTATE_PLANNING', name: 'Estate Planning' }
];

async function createAgent(specialty: string, name: string) {
  console.log(`\n🚀 Creating ${name} agent...`);
  console.log(`Specialty: ${specialty}`);
  
  try {
    // Create the agent using the trainer library
    const agent = await createSpecialAgent(specialty as any);
    
    // Save to database
    const savedAgent = await db.specialAgents.create({
      name: agent.name,
      title: agent.title,
      specialty: specialty.toLowerCase(),
      status: 'active',
      persona: agent.persona,
      knowledgeBaseId: `kb_${specialty.toLowerCase()}`,
      performanceScore: '85.0',
    });
    
    // Update trainer's agent count
    const trainer = await db.trainerAgent.findFirst();
    if (trainer) {
      await db.trainerAgent.update(trainer.id, {
        totalAgentsTrained: (trainer.totalAgentsTrained || 0) + 1,
      });
    }
    
    console.log(`✅ ${name} agent created successfully!`);
    console.log(`   Name: ${savedAgent.name}`);
    console.log(`   Title: ${savedAgent.title}`);
    console.log(`   ID: ${savedAgent.id}`);
    console.log(`   Status: ${savedAgent.status}`);
    
    return { success: true, agent: savedAgent };
  } catch (error: any) {
    console.error(`❌ Failed to create ${name} agent:`, error.message);
    return { success: false, error: error.message };
  }
}

async function createAllAgents() {
  console.log('🔥🔥🔥 CREATING 5 NEW AGENTS!!! 🔥🔥🔥\n');
  
  const results = [];
  
  for (const agent of newAgents) {
    const result = await createAgent(agent.specialty, agent.name);
    results.push({ ...agent, ...result });
    
    // Wait 1 second between creations
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n\n📊 SUMMARY:');
  console.log('='.repeat(50));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Successful: ${successful.length}/${results.length}`);
  console.log(`❌ Failed: ${failed.length}/${results.length}`);
  
  if (successful.length > 0) {
    console.log('\n✅ Successfully created:');
    successful.forEach(r => console.log(`   - ${r.name} (${r.agent?.name})`));
  }
  
  if (failed.length > 0) {
    console.log('\n❌ Failed to create:');
    failed.forEach(r => console.log(`   - ${r.name}: ${r.error}`));
  }
  
  console.log('\n🎯 DONE!');
  console.log('🌐 View agents at: https://tdai-internal-management.vercel.app/trainer');
  
  process.exit(0);
}

createAllAgents().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
