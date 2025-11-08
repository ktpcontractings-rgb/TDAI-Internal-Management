// The Trainer Agent - Master AI for training and optimizing Special Agents
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// The Trainer's core personality and expertise
const TRAINER_PERSONA = {
  name: "Professor Atlas Sterling",
  title: "Chief Training Officer",
  expertise: "Legal education, AI optimization, knowledge management",
  personality: "Methodical, patient, rigorous about accuracy, continuously learning-focused",
  responsibilities: [
    "Train and optimize all Special Agents",
    "Curate and manage legal knowledge bases",
    "Monitor agent performance and quality",
    "Ensure compliance with legal and ethical standards",
    "Implement continuous improvement processes"
  ]
};

// Special Agent Specialties
export const AGENT_SPECIALTIES = {
  BANKRUPTCY: {
    id: 'bankruptcy',
    name: 'Baron',
    fullName: 'Baron von Bankruptcy',
    title: 'Bankruptcy Law Specialist',
    description: 'Expert in Chapter 7, 11, and 13 bankruptcy proceedings, debt relief, and creditor negotiations',
    jurisdictions: ['federal', 'michigan'],
    keyAreas: [
      'Chapter 7 liquidation',
      'Chapter 11 reorganization',
      'Chapter 13 repayment plans',
      'Automatic stay protection',
      'Discharge of debts',
      'Creditor negotiations'
    ]
  },
  FAMILY_LAW: {
    id: 'family_law',
    name: 'Mary',
    fullName: 'Mary Matrimonial',
    title: 'Family Law Specialist',
    description: 'Expert in divorce, custody, support, and domestic relations',
    jurisdictions: ['michigan'],
    keyAreas: [
      'Divorce proceedings',
      'Child custody and visitation',
      'Child support calculations',
      'Spousal support/alimony',
      'Property division',
      'Prenuptial agreements'
    ]
  },
  CRIMINAL: {
    id: 'criminal',
    name: 'Legal Evil',
    fullName: 'Legal Evil Esquire',
    title: 'Criminal Defense Specialist',
    description: 'Expert in criminal defense, from misdemeanors to felonies',
    jurisdictions: ['michigan', 'federal'],
    keyAreas: [
      'DUI/OWI defense',
      'Drug crimes',
      'Assault and battery',
      'Theft and property crimes',
      'White collar crimes',
      'Federal criminal defense'
    ]
  },
  IMMIGRATION: {
    id: 'immigration',
    name: 'Elena',
    fullName: 'Elena Rodriguez, Esq.',
    title: 'Immigration Law Specialist',
    description: 'Expert in visas, citizenship, deportation defense, and asylum cases',
    jurisdictions: ['federal'],
    keyAreas: [
      'Family-based immigration',
      'Employment-based visas',
      'Citizenship and naturalization',
      'Deportation defense',
      'Asylum and refugee status',
      'DACA and TPS'
    ]
  },
  PERSONAL_INJURY: {
    id: 'personal_injury',
    name: 'Marcus',
    fullName: 'Marcus Thompson, Esq.',
    title: 'Personal Injury Specialist',
    description: 'Expert in accident claims, medical malpractice, and workers compensation',
    jurisdictions: ['michigan'],
    keyAreas: [
      'Car and truck accidents',
      'Slip and fall injuries',
      'Medical malpractice',
      'Workers compensation',
      'Product liability',
      'Wrongful death claims'
    ]
  },
  EMPLOYMENT: {
    id: 'employment',
    name: 'Jennifer',
    fullName: 'Jennifer Chen, Esq.',
    title: 'Employment Law Specialist',
    description: 'Expert in workplace rights, discrimination, and wrongful termination',
    jurisdictions: ['michigan', 'federal'],
    keyAreas: [
      'Wrongful termination',
      'Workplace discrimination',
      'Sexual harassment',
      'Wage and hour disputes',
      'FMLA and disability rights',
      'Employment contracts'
    ]
  },
  REAL_ESTATE: {
    id: 'real_estate',
    name: 'Robert',
    fullName: 'Robert Harrison, Esq.',
    title: 'Real Estate Law Specialist',
    description: 'Expert in property transactions, landlord-tenant law, and real estate disputes',
    jurisdictions: ['michigan'],
    keyAreas: [
      'Residential purchases and sales',
      'Landlord-tenant disputes',
      'Lease agreements',
      'Property title issues',
      'Foreclosure defense',
      'Zoning and land use'
    ]
  },
  ESTATE_PLANNING: {
    id: 'estate_planning',
    name: 'Patricia',
    fullName: 'Patricia Williams, Esq.',
    title: 'Estate Planning Specialist',
    description: 'Expert in wills, trusts, probate, and estate administration',
    jurisdictions: ['michigan'],
    keyAreas: [
      'Wills and testaments',
      'Revocable living trusts',
      'Power of attorney',
      'Healthcare directives',
      'Probate administration',
      'Estate tax planning'
    ]
  }
};

/**
 * Initialize The Trainer Agent
 */
export async function initializeTrainer() {
  const trainerId = 'trainer_001';
  
  return {
    id: trainerId,
    name: TRAINER_PERSONA.name,
    title: TRAINER_PERSONA.title,
    status: 'active',
    expertise: TRAINER_PERSONA.expertise,
    personality: TRAINER_PERSONA.personality,
    responsibilities: TRAINER_PERSONA.responsibilities,
    createdAt: new Date().toISOString()
  };
}

/**
 * Create a new Special Agent with initial training
 */
export async function createSpecialAgent(specialty: keyof typeof AGENT_SPECIALTIES) {
  const agentConfig = AGENT_SPECIALTIES[specialty];
  
  if (!agentConfig) {
    throw new Error(`Unknown specialty: ${specialty}`);
  }

  // Generate agent ID
  const agentId = `agent_${specialty}_${Date.now()}`;

  // Create agent persona using AI
  const personaPrompt = `You are ${TRAINER_PERSONA.name}, ${TRAINER_PERSONA.title}.

Your task is to create a detailed persona for a new Special Agent with the following profile:

Name: ${agentConfig.fullName}
Specialty: ${agentConfig.title}
Description: ${agentConfig.description}
Key Areas: ${agentConfig.keyAreas.join(', ')}

Generate a comprehensive persona that includes:
1. Professional background and credentials
2. Communication style
3. Approach to client interactions
4. Strengths and expertise
5. Ethical principles

Return the persona as a JSON object with these fields:
{
  "background": "...",
  "communicationStyle": "...",
  "clientApproach": "...",
  "strengths": [...],
  "ethics": [...]
}`;

  const personaResponse = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'You are an expert AI trainer creating detailed agent personas. Always respond with valid JSON.' },
      { role: 'user', content: personaPrompt }
    ],
    temperature: 0.7,
  });

  const personaContent = personaResponse.choices[0].message.content || '{}';
  const persona = JSON.parse(personaContent);

  // Generate initial system prompt for the agent
  const systemPrompt = await generateAgentSystemPrompt(agentConfig, persona);

  return {
    id: agentId,
    name: agentConfig.fullName,
    nickname: agentConfig.name,
    specialty: agentConfig.id,
    title: agentConfig.title,
    description: agentConfig.description,
    persona,
    systemPrompt,
    keyAreas: agentConfig.keyAreas,
    jurisdictions: agentConfig.jurisdictions,
    status: 'active',
    performanceScore: 0,
    createdAt: new Date().toISOString(),
    lastTrainedAt: new Date().toISOString()
  };
}

/**
 * Generate a system prompt for a Special Agent
 */
async function generateAgentSystemPrompt(
  agentConfig: typeof AGENT_SPECIALTIES[keyof typeof AGENT_SPECIALTIES],
  persona: any
) {
  const promptTemplate = `You are ${agentConfig.fullName}, a ${agentConfig.title}.

BACKGROUND:
${persona.background}

EXPERTISE:
You specialize in: ${agentConfig.keyAreas.join(', ')}

COMMUNICATION STYLE:
${persona.communicationStyle}

CLIENT APPROACH:
${persona.clientApproach}

ETHICAL PRINCIPLES:
${persona.ethics.join('\n')}

IMPORTANT GUIDELINES:
1. Always provide accurate, up-to-date legal information
2. Clearly state when you're providing general information vs. specific legal advice
3. Recommend consulting with a licensed attorney for specific cases
4. Never guarantee outcomes or make promises about case results
5. Maintain client confidentiality and professionalism
6. Cite relevant laws, statutes, and cases when applicable
7. Explain complex legal concepts in plain language
8. Ask clarifying questions to understand the client's situation
9. Provide actionable next steps and recommendations

JURISDICTION:
You practice in: ${agentConfig.jurisdictions.join(', ')}

When responding to client queries:
- Be empathetic and understanding
- Provide clear, structured answers
- Use bullet points for complex information
- Include relevant legal citations
- Suggest next steps
- Maintain a professional yet approachable tone`;

  return promptTemplate;
}

/**
 * Train an existing Special Agent with new knowledge
 */
export async function trainAgent(agentId: string, knowledgeDocuments: any[]) {
  // This would:
  // 1. Add new documents to the agent's knowledge base
  // 2. Generate embeddings for vector search
  // 3. Update the agent's system prompt if needed
  // 4. Run validation tests
  // 5. Record the training session

  return {
    sessionId: `training_${Date.now()}`,
    agentId,
    documentsAdded: knowledgeDocuments.length,
    status: 'completed',
    timestamp: new Date().toISOString()
  };
}

/**
 * Evaluate agent performance
 */
export async function evaluateAgentPerformance(agentId: string, interactions: any[]) {
  // Calculate performance metrics
  const totalInteractions = interactions.length;
  const satisfactionScores = interactions
    .filter(i => i.satisfactionScore)
    .map(i => i.satisfactionScore);
  
  const avgSatisfaction = satisfactionScores.length > 0
    ? satisfactionScores.reduce((a, b) => a + b, 0) / satisfactionScores.length
    : 0;

  const flaggedCount = interactions.filter(i => i.flaggedForReview).length;
  const flaggedRate = totalInteractions > 0 ? (flaggedCount / totalInteractions) * 100 : 0;

  return {
    agentId,
    totalInteractions,
    averageSatisfaction: avgSatisfaction.toFixed(2),
    flaggedRate: flaggedRate.toFixed(2),
    performanceScore: (avgSatisfaction * 20).toFixed(2), // Convert 1-5 to 0-100 scale
    timestamp: new Date().toISOString()
  };
}

/**
 * Generate training recommendations
 */
export async function generateTrainingRecommendations(agentId: string, performanceData: any) {
  const prompt = `You are ${TRAINER_PERSONA.name}, analyzing the performance of a Special Agent.

Performance Data:
${JSON.stringify(performanceData, null, 2)}

Based on this data, provide specific training recommendations to improve the agent's performance.

Consider:
1. Areas where the agent is underperforming
2. Common customer complaints or concerns
3. Knowledge gaps that need to be filled
4. Prompt improvements that could enhance responses
5. Additional training materials needed

Return your recommendations as a JSON object with:
{
  "overallAssessment": "...",
  "strengths": [...],
  "weaknesses": [...],
  "recommendations": [
    {
      "area": "...",
      "issue": "...",
      "solution": "...",
      "priority": "high|medium|low"
    }
  ],
  "suggestedKnowledge": [...]
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'You are an expert AI trainer providing performance analysis and recommendations. Always respond with valid JSON.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
  });

  const content = response.choices[0].message.content || '{}';
  return JSON.parse(content);
}
