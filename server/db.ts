// Mock in-memory database for development
// In production, the real database connection is in db-production.ts

export interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'inactive';
  createdAt: Date;
}

export interface AgentCommunication {
  id: string;
  fromAgentId: string;
  toAgentId: string;
  message: string;
  timestamp: Date;
}

export interface AgentDecision {
  id: string;
  agentId: string;
  decision: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: Date;
}

// Mock data storage
const agents: Agent[] = [];
const agentCommunications: AgentCommunication[] = [];
const agentDecisions: AgentDecision[] = [];
const users: User[] = [];

export const db = {
  agents: {
    findMany: async () => agents,
    create: async (agent: Omit<Agent, 'id' | 'createdAt'>) => {
      const newAgent: Agent = {
        ...agent,
        id: `agent_${Date.now()}`,
        createdAt: new Date(),
      };
      agents.push(newAgent);
      return newAgent;
    },
    findById: async (id: string) => agents.find(a => a.id === id),
    update: async (id: string, data: Partial<Agent>) => {
      const index = agents.findIndex(a => a.id === id);
      if (index === -1) return null;
      agents[index] = { ...agents[index], ...data };
      return agents[index];
    },
    delete: async (id: string) => {
      const index = agents.findIndex(a => a.id === id);
      if (index === -1) return false;
      agents.splice(index, 1);
      return true;
    },
  },
  agentCommunications: {
    findMany: async () => agentCommunications,
    create: async (comm: Omit<AgentCommunication, 'id' | 'timestamp'>) => {
      const newComm: AgentCommunication = {
        ...comm,
        id: `comm_${Date.now()}`,
        timestamp: new Date(),
      };
      agentCommunications.push(newComm);
      return newComm;
    },
    findByAgentId: async (agentId: string) => 
      agentCommunications.filter(c => c.fromAgentId === agentId || c.toAgentId === agentId),
  },
  agentDecisions: {
    findMany: async () => agentDecisions,
    create: async (decision: Omit<AgentDecision, 'id' | 'timestamp'>) => {
      const newDecision: AgentDecision = {
        ...decision,
        id: `decision_${Date.now()}`,
        timestamp: new Date(),
      };
      agentDecisions.push(newDecision);
      return newDecision;
    },
    findByAgentId: async (agentId: string) => 
      agentDecisions.filter(d => d.agentId === agentId),
    update: async (id: string, data: Partial<AgentDecision>) => {
      const index = agentDecisions.findIndex(d => d.id === id);
      if (index === -1) return null;
      agentDecisions[index] = { ...agentDecisions[index], ...data };
      return agentDecisions[index];
    },
  },
  users: {
    findMany: async () => users,
    create: async (user: Omit<User, 'id' | 'createdAt'>) => {
      const newUser: User = {
        ...user,
        id: `user_${Date.now()}`,
        createdAt: new Date(),
      };
      users.push(newUser);
      return newUser;
    },
  },
};
