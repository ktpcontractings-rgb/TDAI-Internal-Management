# TDAI Internal Management System

**An AI-powered legal tech platform with intelligent management agents**

[![Frontend](https://img.shields.io/badge/Frontend-Live-success)](https://tdai-internal-management.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Live-success)](https://tdai-internal-management.onrender.com)
[![Database](https://img.shields.io/badge/Database-Neon%20PostgreSQL-blue)](https://neon.tech)
[![AI](https://img.shields.io/badge/AI-OpenAI%20%2B%20Pinecone-purple)](https://openai.com)

---

## 🚀 Live Demo

**CEO Command Center:** [https://tdai-internal-management.vercel.app](https://tdai-internal-management.vercel.app)

---

## 📖 Overview

The TDAI Internal Management System is a sophisticated, AI-powered legal tech platform designed to automate the executive functions of a modern legal technology company. The system features a team of intelligent management agents—including a CTO, PM, CEO, CFO, and General Counsel—who autonomously generate strategic recommendations, make decisions, and manage the firm's operations.

This project represents a significant step towards building a **$14.5 billion legal tech AI company** with a fully automated management team.

---

## 🏗️ Architecture

![Architecture Diagram](https://files.manuscdn.com/user_upload_by_module/session_file/310519663109750646/iFdLRXBfOlCsdTGV.png)

### Technology Stack

| Component | Technology | Purpose |
|:----------|:-----------|:--------|
| **Frontend** | React, TypeScript, Tailwind CSS, Shadcn/ui | Beautiful CEO Command Center UI |
| **Backend** | Node.js, Express, tRPC, Drizzle ORM | Robust API server with type-safe endpoints |
| **Database** | Neon PostgreSQL | Serverless database with connection pooling |
| **AI Engine** | OpenAI API (GPT-4) | LLM reasoning and strategic recommendations |
| **Vector DB** | Pinecone | Knowledge retrieval for RAG system |
| **Deployment** | Vercel (Frontend), Render (Backend) | Production-grade hosting |

---

## ✨ Features

### Intelligent Agent System
- **CTO Agent (Dr. Zade Sterling):** Technology strategy, architecture, and engineering leadership
- **PM Agent (Maya Singh):** Product management, roadmap planning, and user experience
- Auto-initialization with AI-generated strategic recommendations
- Agent personas with unique expertise and communication styles

### AI-Powered Recommendations
- Sophisticated **Retrieval-Augmented Generation (RAG)** architecture
- Combines OpenAI's reasoning with Pinecone-powered knowledge base
- Grounded in real-world case studies from Netflix, Stripe, Slack, and Figma

### CEO Command Center
- Beautiful and intuitive UI with modern gradient design
- Real-time agent status monitoring
- Decision approval/rejection workflow
- Direct agent communication interface
- Tabbed navigation (Overview, Decisions, Messages, Agents, Vault)

### Production-Ready Infrastructure
- Full data persistence with Neon PostgreSQL
- Type-safe API with tRPC
- CORS-enabled for cross-origin requests
- Scalable architecture for future expansion

---

## 🎯 Getting Started

### Prerequisites

- Node.js 20+
- pnpm (recommended) or npm
- OpenAI API key
- Pinecone API key
- Neon PostgreSQL database

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ktpcontractings-rgb/TDAI-Internal-Management.git
   cd TDAI-Internal-Management
   ```

2. **Install dependencies:**
   ```bash
   # Install frontend dependencies
   cd frontend
   pnpm install
   
   # Install backend dependencies
   cd ../backend
   pnpm install
   ```

3. **Set up environment variables:**
   
   Create a `.env` file in the `backend` directory:
   ```env
   DATABASE_URL=your_neon_postgresql_connection_string
   OPENAI_API_KEY=your_openai_api_key
   PINECONE_API_KEY=your_pinecone_api_key
   ```

4. **Run the development servers:**
   
   **Frontend:**
   ```bash
   cd frontend
   pnpm dev
   ```
   
   **Backend:**
   ```bash
   cd backend
   pnpm dev
   ```

5. **Access the application:**
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend: [http://localhost:3000](http://localhost:3000)

---

## 📚 Documentation

- **[Quick Start Guide](../Quick_Start_Guide.md):** Get started in minutes
- **[System Documentation](../TDAI_System_Documentation.md):** Comprehensive technical documentation
- **[Technical Summary](../Technical_Summary.md):** Architecture and testing results

---

## 🧪 Testing

### Agent Initialization Test

1. Navigate to the CEO Command Center
2. Click "Initialize CTO Agent" or "Initialize PM Agent"
3. Verify the agent appears in the "Agent Status" section
4. Check for pending decisions (requires OpenAI quota)

### API Testing

The backend exposes the following tRPC endpoints:

- `agents.initialize` - Create and initialize agents
- `agents.decisions.approve` - Approve agent recommendations
- `agents.decisions.reject` - Reject agent recommendations

---

## 🗄️ Database Schema

```sql
-- Agents table
CREATE TABLE agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Agent Communications table
CREATE TABLE agentCommunications (
  id TEXT PRIMARY KEY,
  agent_id TEXT REFERENCES agents(id),
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Agent Decisions table
CREATE TABLE agentDecisions (
  id TEXT PRIMARY KEY,
  agent_id TEXT REFERENCES agents(id),
  decision TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🛣️ Roadmap

### Phase 4: Cascade Initialization
- CTO and PM agents automatically initialize CEO, CFO, and General Counsel
- Agents recommend when additional agents are needed

### Phase 5: Agent-to-Agent Communication
- Agents can send messages to each other
- Collaborative decision-making workflows
- Multi-agent strategic planning

### Phase 6: Regulatory Board
- Add 5-6 oversight agents for compliance and governance
- Automated regulatory review of decisions
- Risk assessment and mitigation

### Phase 7: Legal Specialty Agents
- Add 20+ practice area agents (Corporate, IP, Litigation, etc.)
- Use mock data until funding secured
- Each agent replaces ~10 employees

### Phase 8: Real Legal Database Integration
- Connect to LexisNexis, Westlaw, and other legal databases
- Real-time case law and statute retrieval
- Automated legal research and analysis

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is proprietary and confidential.

---

## 🙏 Acknowledgments

- **OpenAI** for GPT-4 and embeddings API
- **Pinecone** for vector database infrastructure
- **Neon** for serverless PostgreSQL
- **Vercel** for frontend hosting
- **Render** for backend hosting

---

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Built with ❤️ by Manus AI**

*Building the future of automated legal tech management, one intelligent agent at a time.* 🤖✨
