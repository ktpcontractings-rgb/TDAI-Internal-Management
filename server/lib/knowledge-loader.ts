import { uploadKnowledgeDocument } from "./pinecone";
import type { KnowledgeDocument } from "./pinecone";

/**
 * Initialize Knowledge Base
 * Loads management team knowledge into Pinecone
 * This runs once when the server starts (or on demand)
 */

export async function initializeKnowledgeBase() {
  console.log("🚀 Initializing TDAI Management Knowledge Base...");

  const allDocuments: KnowledgeDocument[] = [
    // CTO Knowledge
    {
      id: "cto-case-netflix",
      type: "case_study",
      agent: "cto",
      title: "Netflix: Monolith to Microservices Transformation",
      content: `Netflix transformed from a monolithic architecture to microservices to scale to 270M+ users globally.
      
Initial Challenge:
- Monolithic Java application couldn't scale
- Single points of failure
- Slow deployment cycles
- Limited innovation velocity

Solution Implemented:
- Migrated to microservices on AWS
- Service boundaries based on business domains
- Independent deployment and scaling per service
- Implemented resilience patterns (circuit breakers, timeouts, bulkheads)
- Built comprehensive observability and monitoring

Key Technologies:
- AWS cloud infrastructure
- Docker containers and Kubernetes
- Cassandra for distributed data
- Kafka for event streaming
- Zuul API gateway

Results Achieved:
- 99.99% uptime SLA
- 270M+ users worldwide
- 5000+ microservices in production
- Deployment frequency: multiple times per day
- Reduced time-to-market for new features

Lessons Learned:
- Start with clear service boundaries
- Invest heavily in observability from day one
- Build resilience into every service
- Automate everything (testing, deployment, monitoring)
- Culture change is as important as technical change`,
      metadata: {
        company: "Netflix",
        industry: "streaming",
        tags: ["microservices", "scaling", "aws", "architecture"],
      },
    },
    {
      id: "cto-case-stripe",
      type: "case_study",
      agent: "cto",
      title: "Stripe: Building Payment Infrastructure at Scale",
      content: `Stripe built payment infrastructure processing billions in payments with strict reliability requirements.

Challenge:
- Process billions in payments reliably
- Handle 5M+ queries per second
- Operate in 70+ countries with different regulations
- Maintain 99.99%+ uptime

Architecture Decisions:
- Distributed systems with strict consistency
- Real-time transaction processing
- Database sharding for horizontal scale
- Idempotency for reliability
- Global infrastructure deployment

Key Technologies:
- Ruby on Rails (API layer)
- Scala (core payment processing)
- MongoDB and PostgreSQL (data storage)
- Redis (caching and queuing)
- Custom distributed systems

Results:
- Processing billions in payments annually
- 5M+ API requests per second
- 99.999% uptime
- Sub-second response times globally
- Trusted by millions of businesses

Lessons Learned:
- Reliability over speed in financial systems
- Idempotent operations are critical
- Think globally from day one
- Invest in developer experience (great APIs)
- Monitoring and alerting are non-negotiable`,
      metadata: {
        company: "Stripe",
        industry: "fintech",
        tags: ["payments", "distributed-systems", "reliability", "scale"],
      },
    },

    // PM Knowledge
    {
      id: "pm-case-slack",
      type: "case_study",
      agent: "pm",
      title: "Slack: Achieving Product-Market Fit in 8 Months",
      content: `Slack achieved product-market fit in just 8 months and reached unicorn status in record time.

Origin Story:
- Started as internal tool at Tiny Speck (gaming company)
- Realized the tool was more valuable than the game
- Pivoted to focus on team communication

Product Strategy:
- Solved a real pain point (fragmented team communication)
- Superior UX compared to email and existing tools
- Freemium model for viral growth
- Focus on delighting users, not just features

Go-to-Market Approach:
- Beta launch with select companies
- Word-of-mouth and community building
- Strong focus on customer feedback
- Rapid iteration based on user needs

Key Metrics:
- 8 months to product-market fit
- 750K+ daily active users by 2015
- $1B valuation in 2 years
- 77% of Fortune 100 companies using Slack

Results:
- Fastest growing B2B SaaS company ever
- $27.7B acquisition by Salesforce (2021)
- Became verb ("let's Slack about it")

Lessons Learned:
- Focus on user experience above all
- Build community, not just product
- Iterate fast based on feedback
- Freemium can drive explosive growth
- Product-market fit feels like magic when you have it`,
      metadata: {
        company: "Slack",
        industry: "saas",
        tags: ["product-market-fit", "growth", "ux", "b2b"],
      },
    },
    {
      id: "pm-case-figma",
      type: "case_study",
      agent: "pm",
      title: "Figma: Disrupting Adobe with Browser-Based Design",
      content: `Figma disrupted the design tool market dominated by Adobe by building a browser-based collaborative tool.

Market Opportunity:
- Adobe dominated with desktop tools (Photoshop, Illustrator)
- Designers struggled with collaboration and version control
- Cloud-based tools were emerging (Google Docs success)

Product Innovation:
- Browser-based (no installation required)
- Real-time collaboration (like Google Docs for design)
- Cloud-based, accessible anywhere
- Strong API and plugin ecosystem
- Freemium pricing model

Competitive Advantages:
- Collaboration as core feature (not add-on)
- Web technology stack (accessible, fast updates)
- Designer-friendly pricing
- Strong community and education

Results:
- 77% market share among design tools
- Used by Google, Microsoft, Uber, Airbnb
- $20B acquisition by Adobe (2022)
- Fastest growing design tool ever

Lessons Learned:
- Identify pain points in incumbent solutions
- Leverage new technology (web vs desktop)
- Build community through education
- Collaboration is a powerful differentiator
- Freemium can win against expensive incumbents`,
      metadata: {
        company: "Figma",
        industry: "design-tools",
        tags: ["disruption", "collaboration", "saas", "product-strategy"],
      },
    },
  ];

  console.log(`📚 Loading ${allDocuments.length} knowledge documents...`);

  let successCount = 0;
  let errorCount = 0;

  for (const doc of allDocuments) {
    try {
      await uploadKnowledgeDocument(doc);
      successCount++;
      console.log(`✅ Loaded: ${doc.title}`);
    } catch (error) {
      errorCount++;
      console.error(`❌ Failed to load: ${doc.title}`, error);
    }
  }

  console.log(`\n✅ Knowledge base initialization complete!`);
  console.log(`   Success: ${successCount} documents`);
  console.log(`   Errors: ${errorCount} documents`);

  return {
    success: errorCount === 0,
    documentsLoaded: successCount,
    errors: errorCount,
  };
}

export default {
  initializeKnowledgeBase,
};
