import { db } from '../db-selector';

async function cleanupAndRenameAgents() {
  console.log('🧹 Starting agent cleanup and rename...\n');

  // Get all agents
  const allAgents = await db.specialAgents.findMany();
  console.log(`Found ${allAgents.length} total agents\n`);

  // Group agents by specialty
  const agentsBySpecialty: Record<string, any[]> = {};
  for (const agent of allAgents) {
    const specialty = agent.specialty || 'unknown';
    if (!agentsBySpecialty[specialty]) {
      agentsBySpecialty[specialty] = [];
    }
    agentsBySpecialty[specialty].push(agent);
  }

  // Professional name mapping
  const professionalNames: Record<string, { name: string; title: string }> = {
    'bankruptcy': {
      name: 'Michael Sterling',
      title: 'Bankruptcy Law Specialist'
    },
    'family_law': {
      name: 'Sarah Mitchell',
      title: 'Family Law Specialist'
    },
    'criminal': {
      name: 'David Morrison',
      title: 'Criminal Defense Specialist'
    }
  };

  // Process each specialty
  for (const [specialty, agents] of Object.entries(agentsBySpecialty)) {
    console.log(`\n📂 Processing ${specialty}:`);
    console.log(`   Found ${agents.length} agent(s)`);

    if (agents.length === 0) continue;

    // Keep the first agent, delete the rest
    const keepAgent = agents[0];
    const deleteAgents = agents.slice(1);

    // Rename the kept agent if we have a professional name
    const professionalName = professionalNames[specialty];
    if (professionalName) {
      console.log(`   ✏️  Renaming to: ${professionalName.name}, Esq.`);
      await db.specialAgents.update(keepAgent.id, {
        name: `${professionalName.name}, Esq.`,
        title: professionalName.title
      });
    }

    // Delete duplicates
    for (const agent of deleteAgents) {
      console.log(`   🗑️  Deleting duplicate: ${agent.name} (${agent.id})`);
      await db.specialAgents.delete(agent.id);
    }
  }

  // Get final count
  const finalAgents = await db.specialAgents.findMany();
  console.log(`\n✅ Cleanup complete!`);
  console.log(`   Agents remaining: ${finalAgents.length}`);
  console.log('\n📋 Current agents:');
  for (const agent of finalAgents) {
    console.log(`   - ${agent.name} (${agent.specialty})`);
  }
}

// Run the cleanup
cleanupAndRenameAgents()
  .then(() => {
    console.log('\n✅ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
