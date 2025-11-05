import { uploadKnowledgeDocument, initializeVectorDB, type KnowledgeDocument } from "./neon-vector";
import { nanoid } from "nanoid";

// Sample knowledge base for each agent
const knowledgeBase: KnowledgeDocument[] = [
  // CTO Knowledge
  {
    id: nanoid(),
    type: "curriculum",
    agent: "cto",
    title: "System Architecture Best Practices",
    content: "Focus on scalability, reliability, and security. Use microservices for modularity, implement proper caching strategies, and ensure robust error handling. Consider cloud-native architectures for flexibility. Choose proven technologies that match team expertise.",
    metadata: {
      course: "System Design",
      tags: ["architecture", "scalability", "best-practices"],
    },
  },
  {
    id: nanoid(),
    type: "case_study",
    agent: "cto",
    title: "Netflix Microservices Migration",
    content: "Netflix scaled from monolith to microservices, implemented chaos engineering, and built a resilient cloud-native architecture. Key lessons: gradual migration, strong observability, and culture of reliability.",
    metadata: {
      company: "Netflix",
      industry: "Streaming",
      tags: ["microservices", "migration", "case-study"],
    },
  },
  {
    id: nanoid(),
    type: "case_study",
    agent: "cto",
    title: "Stripe API-First Architecture",
    content: "Stripe prioritized API design, developer experience, and reliability. They built robust payment infrastructure with strong consistency guarantees and comprehensive testing. Key lessons: API-first design, extensive documentation, and reliability as a feature.",
    metadata: {
      company: "Stripe",
      industry: "Payments",
      tags: ["api-design", "reliability", "case-study"],
    },
  },
  
  // PM Knowledge
  {
    id: nanoid(),
    type: "curriculum",
    agent: "pm",
    title: "Product Strategy & Vision",
    content: "Define clear product vision aligned with market needs. Focus on solving real customer problems. Use data-driven decision making combined with customer empathy. Prioritize ruthlessly based on impact and effort.",
    metadata: {
      course: "Product Management",
      tags: ["strategy", "vision", "prioritization"],
    },
  },
  {
    id: nanoid(),
    type: "case_study",
    agent: "pm",
    title: "Slack Product-Market Fit Journey",
    content: "Slack achieved product-market fit by focusing on team communication pain points, building viral growth loops, and obsessing over user experience. Key lessons: solve a real problem, make it delightful, and enable word-of-mouth growth.",
    metadata: {
      company: "Slack",
      industry: "Collaboration",
      tags: ["pmf", "viral-growth", "case-study"],
    },
  },
  
  // CEO Knowledge
  {
    id: nanoid(),
    type: "curriculum",
    agent: "ceo",
    title: "Strategic Vision & Leadership",
    content: "Set clear company vision and mission. Build strong culture and values. Focus on hiring exceptional talent. Communicate transparently with team and stakeholders. Balance growth with sustainability.",
    metadata: {
      course: "Leadership",
      tags: ["vision", "leadership", "culture"],
    },
  },
  {
    id: nanoid(),
    type: "case_study",
    agent: "ceo",
    title: "Airbnb Resilience Story",
    content: "Airbnb survived near-death experiences by focusing on quality over quantity, building trust and safety, and creating magical user experiences. Key lessons: resilience, focus on core value proposition, and build community.",
    metadata: {
      company: "Airbnb",
      industry: "Hospitality",
      tags: ["resilience", "crisis-management", "case-study"],
    },
  },
];

export async function initializeKnowledgeBase() {
  try {
    console.log("📚 Initializing knowledge base...");
    
    // Initialize vector database
    await initializeVectorDB();
    
    // Upload all knowledge documents
    for (const doc of knowledgeBase) {
      await uploadKnowledgeDocument(doc);
    }
    
    console.log(`✅ Knowledge base initialized with ${knowledgeBase.length} documents`);
  } catch (error) {
    console.error("❌ Error initializing knowledge base:", error);
    throw error;
  }
}
