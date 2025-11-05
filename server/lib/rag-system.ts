import { retrieveKnowledgeForRecommendation } from "./neon-vector";
import { getFallbackKnowledge } from "./knowledge-fallback";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface RecommendationRequest {
  agent: "cto" | "pm" | "ceo";
  topic: string;
  context: string;
  businessSituation: string;
}

export interface AgentRecommendation {
  title: string;
  summary: string;
  reasoning: string;
  actionItems: string[];
  references: string[];
}

export async function generateAgentRecommendation(
  request: RecommendationRequest
): Promise<AgentRecommendation> {
  try {
    console.log(`🧠 Generating recommendation for ${request.agent}...`);

    // Try to retrieve knowledge from Neon vector database
    let knowledge;
    try {
      knowledge = await retrieveKnowledgeForRecommendation(
        request.agent,
        request.topic,
        request.context
      );
    } catch (error) {
      console.warn("⚠️  Vector search failed, using fallback knowledge");
      knowledge = getFallbackKnowledge(request.agent, request.topic, request.context);
    }

    // Build context from retrieved knowledge
    const curriculumContext = knowledge.curriculum
      .map((doc: any) => `- ${doc.metadata.title}: ${doc.metadata.content}`)
      .join("\n");

    const caseStudyContext = knowledge.caseStudies
      .map((doc: any) => `- ${doc.metadata.company || doc.metadata.title}: ${doc.metadata.content}`)
      .join("\n");

    const scenarioContext = knowledge.scenarios
      .map((doc: any) => `- ${doc.metadata.title}: ${doc.metadata.content}`)
      .join("\n");

    // Generate recommendation using GPT-4
    const systemPrompt = `You are a world-class ${request.agent.toUpperCase()} advisor. 
You provide strategic recommendations based on industry best practices, case studies, and proven frameworks.
Your recommendations are actionable, specific, and grounded in real-world examples.`;

    const userPrompt = `
Business Context: ${request.context}

Current Situation: ${request.businessSituation}

Topic: ${request.topic}

Relevant Best Practices:
${curriculumContext}

Relevant Case Studies:
${caseStudyContext}

Relevant Scenarios:
${scenarioContext}

Based on the above context, provide a strategic recommendation with:
1. A clear, actionable title
2. A brief summary (2-3 sentences)
3. Detailed reasoning explaining why this recommendation is important
4. 3-5 specific action items
5. References to the case studies or best practices that support this recommendation

Format your response as JSON with the following structure:
{
  "title": "string",
  "summary": "string",
  "reasoning": "string",
  "actionItems": ["string"],
  "references": ["string"]
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const recommendation = JSON.parse(
      response.choices[0].message.content || "{}"
    );

    console.log(`✅ Recommendation generated: ${recommendation.title}`);

    return recommendation;
  } catch (error) {
    console.error("❌ Error generating recommendation:", error);
    throw error;
  }
}
