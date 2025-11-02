import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

/**
 * SIGMA Command Center
 * Strategic Intelligence & Management Automation
 * Manage your AI leadership team and approve strategic decisions
 */
export default function CEODashboard() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  // Fetch all agents
  const { data: agents = [], isLoading: agentsLoading } = trpc.agents.list.useQuery();

  // Fetch communications for selected agent
  const { data: communications = [] } = trpc.agents.communications.list.useQuery(
    { agentId: selectedAgent || "" },
    { enabled: !!selectedAgent }
  );

  // Fetch decisions for selected agent
  const { data: decisions = [] } = trpc.agents.decisions.list.useQuery(
    { agentId: selectedAgent || "" },
    { enabled: !!selectedAgent }
  );

  // Get tRPC utils for cache invalidation
  const trpcUtils = trpc.useUtils();

  // Initialize agent mutation
  const initializeAgentMutation = trpc.agents.initialize.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.agent.name} initialized successfully!`);
      trpcUtils.agents.list.invalidate();
      setSelectedAgent(data.agent.id);
    },
    onError: (error) => {
      toast.error(`Failed to initialize agent: ${error.message}`);
    },
  });

  // Approve decision mutation
  const approveDecisionMutation = trpc.agents.decisions.approve.useMutation({
    onSuccess: () => {
      toast.success("Decision approved successfully!");
      trpcUtils.agents.decisions.list.invalidate({ agentId: selectedAgent || "" });
    },
    onError: (error) => {
      toast.error(`Failed to approve decision: ${error.message}`);
    },
  });

  // Reject decision mutation
  const rejectDecisionMutation = trpc.agents.decisions.reject.useMutation({
    onSuccess: () => {
      toast.success("Decision rejected successfully!");
      trpcUtils.agents.decisions.list.invalidate({ agentId: selectedAgent || "" });
    },
    onError: (error) => {
      toast.error(`Failed to reject decision: ${error.message}`);
    },
  });

  // Calculate stats
  const activeAgents = agents.filter(a => a.status === 'operational').length;
  const pendingApprovals = decisions.filter(d => d.status === 'pending').length;
  const unreadMessages = communications.filter(c => !c.read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">SIGMA Command Center</h1>
          <p className="text-lg text-slate-600">Strategic Intelligence & Management Automation</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="overview">📊 Overview</TabsTrigger>
            <TabsTrigger value="decisions">✓ Decisions</TabsTrigger>
            <TabsTrigger value="messages">💬 Messages</TabsTrigger>
            <TabsTrigger value="agents">👥 Agents</TabsTrigger>
            <TabsTrigger value="vault">🔒 Vault</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-slate-600">Active Agents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900">{activeAgents}</div>
                  <p className="text-xs text-slate-500 mt-1">CTO Agent operational</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-slate-600">Pending Approvals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">{pendingApprovals}</div>
                  <p className="text-xs text-slate-500 mt-1">Awaiting your decision</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-slate-600">Unread Messages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{unreadMessages}</div>
                  <p className="text-xs text-slate-500 mt-1">From CTO Agent</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and operations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const firstPending = decisions.find(d => d.status === 'pending');
                      if (firstPending) {
                        // Scroll to decisions tab
                        document.querySelector('[value="decisions"]')?.dispatchEvent(new Event('click', { bubbles: true }));
                      } else {
                        toast.info("No pending decisions");
                      }
                    }}
                  >
                    View All Decisions
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => initializeAgentMutation.mutate({ role: 'PM' })}
                    disabled={initializeAgentMutation.isPending}
                  >
                    {initializeAgentMutation.isPending ? "Initializing..." : "Initialize PM Agent"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const ctoAgent = agents.find(a => a.role === 'CTO');
                      if (ctoAgent) {
                        setSelectedAgent(ctoAgent.id);
                        document.querySelector('[value="messages"]')?.dispatchEvent(new Event('click', { bubbles: true }));
                      } else {
                        toast.info("CTO Agent not initialized yet");
                      }
                    }}
                  >
                    Send Message to CTO
                  </Button>
                  <Button variant="outline" disabled>
                    Access Genesis Codex
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates from your AI team</CardDescription>
              </CardHeader>
              <CardContent>
                {communications.length > 0 ? (
                  <div className="space-y-4">
                    {communications.slice(0, 3).map((msg) => (
                      <div
                        key={msg.id}
                        className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-slate-900">
                            {agents.find(a => a.id === msg.fromAgentId)?.name || "Unknown Agent"}
                          </h4>
                          <Badge variant="default">New</Badge>
                        </div>
                        <p className="text-sm text-slate-700 mb-2">{msg.message}</p>
                        <span className="text-xs text-slate-500">
                          {new Date(msg.timestamp).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-500 mb-4">No recent activity. Initialize an agent to begin.</p>
                    <Button
                      onClick={() => initializeAgentMutation.mutate({ role: 'CTO' })}
                      disabled={initializeAgentMutation.isPending}
                    >
                      {initializeAgentMutation.isPending ? "Initializing..." : "Initialize CTO Agent"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Decisions Tab */}
          <TabsContent value="decisions">
            <Card>
              <CardHeader>
                <CardTitle>Pending Decisions</CardTitle>
                <CardDescription>Strategic decisions awaiting your approval</CardDescription>
              </CardHeader>
              <CardContent>
                {decisions.length > 0 ? (
                  <div className="space-y-4">
                    {decisions
                      .filter((d) => d.status === "pending")
                      .map((decision) => (
                        <div key={decision.id} className="border rounded-lg p-4 bg-yellow-50">
                          <h5 className="font-semibold text-slate-900 mb-2">{decision.decision}</h5>
                          <p className="text-sm text-slate-600 mb-4">Status: {decision.status}</p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => approveDecisionMutation.mutate({ decisionId: decision.id })}
                              disabled={approveDecisionMutation.isPending}
                            >
                              {approveDecisionMutation.isPending ? "Approving..." : "✓ Approve"}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => rejectDecisionMutation.mutate({ decisionId: decision.id })}
                              disabled={rejectDecisionMutation.isPending}
                            >
                              {rejectDecisionMutation.isPending ? "Rejecting..." : "✗ Reject"}
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 text-center py-8">
                    No pending decisions. All systems nominal.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle>Communications</CardTitle>
                <CardDescription>Messages from your AI leadership team</CardDescription>
              </CardHeader>
              <CardContent>
                {communications.length > 0 ? (
                  <div className="space-y-4">
                    {communications.map((msg) => (
                      <div
                        key={msg.id}
                        className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-slate-900">
                            {agents.find(a => a.id === msg.fromAgentId)?.name || "Unknown Agent"}
                          </h4>
                          <span className="text-xs text-slate-500">
                            {new Date(msg.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700">{msg.message}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 text-center py-8">
                    No messages yet. Initialize an agent to start receiving updates.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Agents Tab */}
          <TabsContent value="agents">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* CTO Agent Card */}
              <Card className="border-2 border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-blue-900">CTO Agent</CardTitle>
                  <CardDescription>Dr. Zade Sterling</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge className={agents.find(a => a.role === 'CTO') ? "bg-green-500 text-white mb-4" : "bg-yellow-500 text-white mb-4"}>
                    {agents.find(a => a.role === 'CTO') ? "Active" : "Not Initialized"}
                  </Badge>
                  <p className="text-sm text-slate-700 mb-4">
                    Chief Technology Officer - Hyperscale system architect and infrastructure leader
                  </p>
                  {!agents.find(a => a.role === 'CTO') ? (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => initializeAgentMutation.mutate({ role: 'CTO' })}
                      disabled={initializeAgentMutation.isPending}
                      className="w-full"
                    >
                      {initializeAgentMutation.isPending ? "Initializing..." : "Initialize CTO"}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => {
                        const ctoAgent = agents.find(a => a.role === 'CTO');
                        if (ctoAgent) setSelectedAgent(ctoAgent.id);
                      }}
                      className="w-full"
                    >
                      View Details
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* PM Agent Card */}
              <Card className="border-2 border-purple-200 bg-purple-50">
                <CardHeader>
                  <CardTitle className="text-purple-900">PM Agent</CardTitle>
                  <CardDescription>Maya Singh</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge className={agents.find(a => a.role === 'PM') ? "bg-green-500 text-white mb-4" : "bg-yellow-500 text-white mb-4"}>
                    {agents.find(a => a.role === 'PM') ? "Active" : "Not Initialized"}
                  </Badge>
                  <p className="text-sm text-slate-700 mb-4">
                    Product Manager - Customer voice and roadmap strategist
                  </p>
                  {!agents.find(a => a.role === 'PM') ? (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => initializeAgentMutation.mutate({ role: 'PM' })}
                      disabled={initializeAgentMutation.isPending}
                      className="w-full"
                    >
                      {initializeAgentMutation.isPending ? "Initializing..." : "Initialize PM"}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => {
                        const pmAgent = agents.find(a => a.role === 'PM');
                        if (pmAgent) setSelectedAgent(pmAgent.id);
                      }}
                      className="w-full"
                    >
                      View Details
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* CEO Agent Card */}
              <Card className="border-2 border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-green-900">CEO Agent</CardTitle>
                  <CardDescription>Dr. Evelyn Reed</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge className="bg-gray-500 text-white mb-4">Coming Soon</Badge>
                  <p className="text-sm text-slate-700 mb-4">
                    Chief Executive Officer - Strategic vision and investor relations
                  </p>
                  <Button size="sm" variant="outline" className="w-full" disabled>
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Vault Tab */}
          <TabsContent value="vault">
            <Card>
              <CardHeader>
                <CardTitle>Secure Vault</CardTitle>
                <CardDescription>Encrypted storage for sensitive information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔒</div>
                  <p className="text-slate-500 mb-4">Vault feature coming soon</p>
                  <p className="text-sm text-slate-400">
                    Securely store API keys, credentials, and sensitive documents
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
