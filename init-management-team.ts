// Initialize Management Team: CEO, CTO, PM
import { db } from './server/db-selector.js';

const managementTeam = [
  {
    role: 'CEO',
    name: 'Dr. Evelyn Reed',
    title: 'Chief Executive Officer',
    description: 'Visionary CEO with expertise in strategy, fundraising, and company building'
  },
  {
    role: 'CTO',
    name: 'Dr. Zade Sterling',
    title: 'Chief Technology Officer',
    description: 'World-class CTO with expertise in system design, distributed systems, and cloud architecture'
  },
  {
    role: 'PM',
    name: 'Maya Singh',
    title: 'Product Manager',
    description: 'World-class PM with expertise in product strategy, customer research, and go-to-market'
  }
];

async function initializeAgent(agent: typeof managementTeam[0]) {
  console.log(`\n🚀 Initializing ${agent.role}: ${agent.name}...`);
  
  try {
    // Check if agent already exists
    const existing = await db.managementAgents.findByRole(agent.role);
    if (existing) {
      console.log(`⚠️  ${agent.role} already exists: ${existing.name}`);
      return { success: true, agent: existing, existed: true };
    }
    
    // Create new management agent
    const newAgent = await db.managementAgents.create({
      name: agent.name,
      role: agent.role,
      title: agent.title,
      status: 'active',
      description: agent.description,
    });
    
    console.log(`✅ ${agent.role} initialized successfully!`);
    console.log(`   Name: ${newAgent.name}`);
    console.log(`   Title: ${newAgent.title}`);
    console.log(`   ID: ${newAgent.id}`);
    console.log(`   Status: ${newAgent.status}`);
    
    return { success: true, agent: newAgent, existed: false };
  } catch (error: any) {
    console.error(`❌ Failed to initialize ${agent.role}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function initializeManagementTeam() {
  console.log('🔥🔥🔥 INITIALIZING MANAGEMENT TEAM!!! 🔥🔥🔥\n');
  console.log('👔 CEO + CTO + PM 👔\n');
  
  const results = [];
  
  for (const agent of managementTeam) {
    const result = await initializeAgent(agent);
    results.push({ ...agent, ...result });
    
    // Wait 1 second between creations
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n\n📊 SUMMARY:');
  console.log('='.repeat(50));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  const created = successful.filter(r => !r.existed);
  const existed = successful.filter(r => r.existed);
  
  console.log(`✅ Successful: ${successful.length}/${results.length}`);
  console.log(`🆕 Created: ${created.length}`);
  console.log(`♻️  Already Existed: ${existed.length}`);
  console.log(`❌ Failed: ${failed.length}`);
  
  if (created.length > 0) {
    console.log('\n✅ Successfully created:');
    created.forEach(r => console.log(`   - ${r.role}: ${r.name}`));
  }
  
  if (existed.length > 0) {
    console.log('\n♻️  Already existed:');
    existed.forEach(r => console.log(`   - ${r.role}: ${r.agent?.name}`));
  }
  
  if (failed.length > 0) {
    console.log('\n❌ Failed to create:');
    failed.forEach(r => console.log(`   - ${r.role}: ${r.error}`));
  }
  
  console.log('\n🎯 MANAGEMENT TEAM READY!');
  console.log('🌐 View at: https://tdai-internal-management.vercel.app/management');
  
  process.exit(0);
}

initializeManagementTeam().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
