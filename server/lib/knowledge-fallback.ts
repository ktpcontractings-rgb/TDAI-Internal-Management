/**
 * Knowledge Fallback System - Works WITHOUT Pinecone
 * Provides basic knowledge context for agent recommendations when Pinecone is unavailable
 */

/**
 * Get fallback knowledge context for agent recommendations
 * This provides basic industry knowledge without needing Pinecone
 */
export function getFallbackKnowledge(agent: string, topic: string, context: string) {
  console.log(`📚 Using fallback knowledge (Pinecone unavailable)`);
  
  // Basic knowledge templates for each agent type
  const knowledgeTemplates: Record<string, any> = {
    cto: {
      curriculum: [
        {
          id: "cto-arch-1",
          score: 0.9,
          metadata: {
            title: "System Architecture Best Practices",
            content: "Focus on scalability, reliability, and security. Use microservices for modularity, implement proper caching strategies, and ensure robust error handling. Consider cloud-native architectures for flexibility.",
          },
        },
        {
          id: "cto-tech-2",
          score: 0.85,
          metadata: {
            title: "Technology Stack Selection",
            content: "Choose proven technologies that match team expertise. Balance cutting-edge innovation with stability. Consider: React/Next.js for frontend, Node.js/Python for backend, PostgreSQL for database, and cloud platforms like Vercel/Render for deployment.",
          },
        },
      ],
      caseStudies: [
        {
          id: "netflix-case",
          score: 0.88,
          metadata: {
            company: "Netflix",
            content: "Netflix scaled from monolith to microservices, implemented chaos engineering, and built a resilient cloud-native architecture. Key lessons: gradual migration, strong observability, and culture of reliability.",
          },
        },
        {
          id: "stripe-case",
          score: 0.82,
          metadata: {
            company: "Stripe",
            content: "Stripe prioritized API design, developer experience, and reliability. They built robust payment infrastructure with strong consistency guarantees and comprehensive testing. Key lessons: API-first design, extensive documentation, and reliability as a feature.",
          },
        },
      ],
      scenarios: [
        {
          id: "scaling-scenario",
          score: 0.80,
          metadata: {
            title: "Scaling a Startup Architecture",
            content: "Start simple with monolith, add caching and CDN, implement database optimization, then gradually migrate to microservices as needed. Focus on bottlenecks, not premature optimization.",
          },
        },
      ],
    },
    pm: {
      curriculum: [
        {
          id: "pm-strategy-1",
          score: 0.9,
          metadata: {
            title: "Product Strategy & Vision",
            content: "Define clear product vision aligned with market needs. Focus on solving real customer problems. Use data-driven decision making combined with customer empathy. Prioritize ruthlessly based on impact and effort.",
          },
        },
        {
          id: "pm-market-2",
          score: 0.85,
          metadata: {
            title: "Product-Market Fit",
            content: "Achieve PMF by deeply understanding customer pain points, iterating quickly based on feedback, and measuring retention and engagement. Focus on a narrow niche first, then expand.",
          },
        },
      ],
      caseStudies: [
        {
          id: "slack-case",
          score: 0.88,
          metadata: {
            company: "Slack",
            content: "Slack achieved product-market fit by focusing on team communication pain points, building viral growth loops, and obsessing over user experience. Key lessons: solve a real problem, make it delightful, and enable word-of-mouth growth.",
          },
        },
        {
          id: "figma-case",
          score: 0.82,
          metadata: {
            company: "Figma",
            content: "Figma disrupted design tools by making collaboration seamless, building in the browser, and focusing on real-time multiplayer. Key lessons: challenge industry assumptions, enable collaboration, and build for the web.",
          },
        },
      ],
      scenarios: [
        {
          id: "gtm-scenario",
          score: 0.80,
          metadata: {
            title: "Go-to-Market Strategy for B2B SaaS",
            content: "Start with product-led growth, offer freemium tier, build viral loops, invest in content marketing, and focus on customer success. Measure activation, retention, and expansion revenue.",
          },
        },
      ],
    },
    ceo: {
      curriculum: [
        {
          id: "ceo-vision-1",
          score: 0.9,
          metadata: {
            title: "Strategic Vision & Leadership",
            content: "Set clear company vision and mission. Build strong culture and values. Focus on hiring exceptional talent. Communicate transparently with team and stakeholders. Balance growth with sustainability.",
          },
        },
        {
          id: "ceo-fundraising-2",
          score: 0.85,
          metadata: {
            title: "Fundraising & Investor Relations",
            content: "Tell compelling story, show traction and metrics, build relationships before you need money, understand dilution and valuation, and choose investors who add strategic value beyond capital.",
          },
        },
      ],
      caseStudies: [
        {
          id: "airbnb-case",
          score: 0.88,
          metadata: {
            company: "Airbnb",
            content: "Airbnb survived near-death experiences by focusing on quality over quantity, building trust and safety, and creating magical user experiences. Key lessons: resilience, focus on core value proposition, and build community.",
          },
        },
      ],
      scenarios: [
        {
          id: "fundraising-scenario",
          score: 0.80,
          metadata: {
            title: "Seed Fundraising Strategy",
            content: "Build MVP and get initial traction, create compelling pitch deck, network with angels and seed VCs, show clear path to product-market fit, and demonstrate team's ability to execute.",
          },
        },
      ],
    },
    cfo: {
      curriculum: [
        {
          id: "cfo-finance-1",
          score: 0.9,
          metadata: {
            title: "Financial Planning & Analysis",
            content: "Build detailed financial models, track unit economics, manage cash runway, forecast revenue and expenses, and ensure financial sustainability. Focus on key metrics: CAC, LTV, burn rate, and runway.",
          },
        },
      ],
      caseStudies: [],
      scenarios: [],
    },
    gc: {
      curriculum: [
        {
          id: "gc-compliance-1",
          score: 0.9,
          metadata: {
            title: "Legal Compliance & Risk Management",
            content: "Ensure regulatory compliance, manage legal risks, protect intellectual property, review contracts, and advise on corporate governance. Stay updated on relevant laws and regulations.",
          },
        },
      ],
      caseStudies: [],
      scenarios: [],
    },
  };

  // Return knowledge for the requested agent, or default to CTO
  const agentKnowledge = knowledgeTemplates[agent] || knowledgeTemplates.cto;

  console.log(`✅ Loaded ${agentKnowledge.curriculum.length} curriculum items, ${agentKnowledge.caseStudies.length} case studies`);

  return agentKnowledge;
}
