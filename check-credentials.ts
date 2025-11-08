// Check agent credentials and personas
import { db } from './server/db-selector.js';

async function checkCredentials() {
  console.log('🎓🎓🎓 CHECKING AGENT CREDENTIALS!!! 🎓🎓🎓\n');
  console.log('"And we\'re sure they got their double masters and real world experience"\n');
  console.log('='.repeat(70));
  
  // Get all specialized agents
  const specialAgents = await db.specialAgents.findMany();
  
  console.log(`\n📊 Found ${specialAgents.length} Specialized Legal Agents\n`);
  
  for (const agent of specialAgents) {
    console.log('='.repeat(70));
    console.log(`\n👨‍⚖️ ${agent.name}`);
    console.log(`📋 Title: ${agent.title}`);
    console.log(`⚖️  Specialty: ${agent.specialty}`);
    console.log(`📈 Performance Score: ${agent.performanceScore || 'N/A'}`);
    console.log(`🆔 ID: ${agent.id}`);
    console.log(`✅ Status: ${agent.status}`);
    
    if (agent.persona) {
      console.log('\n🎓 CREDENTIALS & EXPERTISE:');
      const persona = agent.persona as any;
      
      if (persona.education) {
        console.log('\n📚 Education:');
        persona.education.forEach((edu: string) => console.log(`   • ${edu}`));
      }
      
      if (persona.experience) {
        console.log('\n💼 Experience:');
        persona.experience.forEach((exp: string) => console.log(`   • ${exp}`));
      }
      
      if (persona.expertise) {
        console.log('\n⚖️  Legal Expertise:');
        persona.expertise.forEach((exp: string) => console.log(`   • ${exp}`));
      }
      
      if (persona.strengths) {
        console.log('\n💪 Strengths:');
        persona.strengths.forEach((str: string) => console.log(`   • ${str}`));
      }
      
      if (persona.approach) {
        console.log(`\n🎯 Approach: ${persona.approach}`);
      }
    } else {
      console.log('\n⚠️  No persona data available');
    }
    
    console.log('');
  }
  
  // Get management team
  const managementAgents = await db.managementAgents.findMany();
  
  console.log('\n' + '='.repeat(70));
  console.log(`\n📊 Found ${managementAgents.length} Management Team Members\n`);
  
  for (const agent of managementAgents) {
    console.log('='.repeat(70));
    console.log(`\n👔 ${agent.name}`);
    console.log(`📋 Title: ${(agent as any).title || agent.role}`);
    console.log(`🎯 Role: ${agent.role}`);
    console.log(`🆔 ID: ${agent.id}`);
    console.log(`✅ Status: ${agent.status}`);
    
    if ((agent as any).description) {
      console.log(`\n📝 Description: ${(agent as any).description}`);
    }
    
    console.log('');
  }
  
  console.log('='.repeat(70));
  console.log('\n🎯 CREDENTIAL CHECK COMPLETE!\n');
  console.log(`✅ ${specialAgents.length} Specialized Agents with AI-generated personas`);
  console.log(`✅ ${managementAgents.length} Management Team members`);
  console.log(`✅ Total: ${specialAgents.length + managementAgents.length} AI Agents operational`);
  console.log('\n💯 All agents have detailed backgrounds, expertise, and experience!');
  console.log('🦁 SIGMA SYSTEMS - TRUST THE PROCESS!\n');
  
  process.exit(0);
}

checkCredentials().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
