import React, { useState } from 'react';
import { trpc } from '../lib/trpc';
import { toast } from 'sonner';

// --- Mock Components (Simplified) ---
const Button = ({ children, onClick, disabled = false }: { children: React.ReactNode, onClick: () => void, disabled?: boolean }) => (
    <button onClick={onClick} disabled={disabled} style={{ padding: '8px', margin: '4px', border: '1px solid gray', cursor: disabled ? 'not-allowed' : 'pointer' }}>
        {children}
    </button>
);

const Input = ({ value, onChange }: { value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
    <input type="text" value={value} onChange={onChange} style={{ padding: '8px', margin: '4px', border: '1px solid black' }} />
);

const Card = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div style={{ border: '1px solid #ccc', padding: '16px', margin: '16px', borderRadius: '8px', width: '45%' }}>
        <h3>{title}</h3>
        {children}
    </div>
);

const CEODashboard: React.FC = () => {
    // State for inputs and selected agent
    const [message, setMessage] = useState('');
    const [selectedAgentId, setSelectedAgentId] = useState('cto_agent_001'); // Start with a default agent ID

    // --- Data Loading (tRPC Queries) ---
    const { data: agents = [], isLoading: isLoadingAgents } = trpc.agents.list.useQuery();
    const { data: pendingDecisions = [], isLoading: isLoadingDecisions } = trpc.agents.decisions.list.useQuery({ agentId: selectedAgentId }, { enabled: !!selectedAgentId });
    const { data: messages = [], isLoading: isLoadingMessages } = trpc.agents.communications.list.useQuery({ agentId: selectedAgentId }, { enabled: !!selectedAgentId });

    // Helper to get the tRPC context for invalidation
    const trpcUtils = trpc.useUtils();

    // --- Mutations (tRPC) ---

    // 1. Initialize Agent Mutation
    const initializeAgentMutation = trpc.agents.initialize.useMutation({
        onSuccess: (data) => {
            toast.success(`${data.agent.name} initialized successfully!`);
            trpcUtils.agents.list.invalidate(); // Refresh agent list
        },
        onError: (error) => {
            toast.error(`Failed to initialize agent: ${error.message}`);
        },
    });

    // 2. Approve Decision Mutation
    const approveDecisionMutation = trpc.agents.decisions.approve.useMutation({
        onSuccess: () => {
            toast.success("Decision approved successfully!");
            trpcUtils.agents.decisions.list.invalidate({ agentId: selectedAgentId }); // Refresh decisions list
        },
        onError: (error) => {
            toast.error(`Failed to approve decision: ${error.message}`);
        },
    });

    // 3. Reject Decision Mutation
    const rejectDecisionMutation = trpc.agents.decisions.reject.useMutation({
        onSuccess: () => {
            toast.success("Decision rejected successfully!");
            trpcUtils.agents.decisions.list.invalidate({ agentId: selectedAgentId }); // Refresh decisions list
        },
        onError: (error) => {
            toast.error(`Failed to reject decision: ${error.message}`);
        },
    });

    // 4. Send Message Mutation
    const sendMessageMutation = trpc.agents.communications.send.useMutation({
        onSuccess: () => {
            toast.success("Message sent successfully!");
            setMessage(''); // Clear message input
            trpcUtils.agents.communications.list.invalidate({ agentId: selectedAgentId }); // Refresh messages
        },
        onError: (error) => {
            toast.error(`Failed to send message: ${error.message}`);
        },
    });

    // 5. Speak Agent Recommendation Mutation
    const speakMutation = trpc.agents.speak.useMutation({
        onSuccess: (data) => {
            // Convert base64 to audio and play
            const audioBlob = new Blob(
                [Uint8Array.from(atob(data.audio), c => c.charCodeAt(0))],
                { type: 'audio/mpeg' }
            );
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            audio.play();
            toast.success("Playing agent voice!");
        },
        onError: (error) => {
            toast.error(`Failed to generate speech: ${error.message}`);
        },
    });

    return (
        <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', background: 'rgba(255,255,255,0.95)', borderRadius: '12px', padding: '30px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
                <h1 style={{ fontSize: '48px', fontWeight: 'bold', color: '#333', marginBottom: '10px', textAlign: 'center' }}>
                    SIGMA Command Center
                </h1>
                <p style={{ fontSize: '20px', color: '#666', textAlign: 'center', marginBottom: '30px' }}>
                    Strategic Intelligence & Management Automation
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
                    {/* Agent Management Card */}
                    <Card title="Agent Management">
                        <h4>Initialize Agents</h4>
                        <Button
                            onClick={() => initializeAgentMutation.mutate({ role: 'PM' })}
                            disabled={initializeAgentMutation.isPending}
                        >
                            {initializeAgentMutation.isPending ? "Initializing PM..." : "Initialize PM Agent"}
                        </Button>
                        <Button
                            onClick={() => initializeAgentMutation.mutate({ role: 'CTO' })}
                            disabled={initializeAgentMutation.isPending}
                        >
                            {initializeAgentMutation.isPending ? "Initializing CTO..." : "Initialize CTO Agent"}
                        </Button>
                        <hr />
                        <h4>Agent Status</h4>
                        {isLoadingAgents ? (
                            <div>Loading agents...</div>
                        ) : agents.length === 0 ? (
                            <div>No agents initialized yet. Click a button above to start!</div>
                        ) : (
                            <ul>
                                {agents.map(agent => (
                                    <li key={agent.id} onClick={() => setSelectedAgentId(agent.id)} style={{ cursor: 'pointer', fontWeight: agent.id === selectedAgentId ? 'bold' : 'normal', marginBottom: '10px' }}>
                                        <div>{agent.name} - Status: {agent.status} (Created: {new Date(agent.createdAt).toLocaleString()})</div>
                                        {agent.recommendation && (
                                            <Button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    speakMutation.mutate({ agentId: agent.id, text: agent.recommendation });
                                                }}
                                                disabled={speakMutation.isPending}
                                            >
                                                {speakMutation.isPending ? "🎤 Speaking..." : "🔊 Speak Recommendation"}
                                            </Button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Card>

                    {/* Decisions Card */}
                    <Card title="Pending Decisions">
                        {isLoadingDecisions ? (
                            <div>Loading decisions...</div>
                        ) : pendingDecisions.length === 0 ? (
                            <div>No pending decisions</div>
                        ) : (
                            <ul>
                                {pendingDecisions.map(decision => (
                                    <li key={decision.id} style={{ marginBottom: '10px' }}>
                                        <p><strong>{decision.decision}</strong></p>
                                        <p>Status: {decision.status}</p>
                                        <Button
                                            onClick={() => approveDecisionMutation.mutate({ decisionId: decision.id })}
                                            disabled={approveDecisionMutation.isPending || decision.status !== 'pending'}
                                        >
                                            {approveDecisionMutation.isPending ? "Approving..." : "Approve Decision"}
                                        </Button>
                                        <Button
                                            onClick={() => rejectDecisionMutation.mutate({ decisionId: decision.id })}
                                            disabled={rejectDecisionMutation.isPending || decision.status !== 'pending'}
                                        >
                                            {rejectDecisionMutation.isPending ? "Rejecting..." : "Reject Decision"}
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Card>

                    {/* Communications Card */}
                    <Card title={`Communications with ${selectedAgentId}`}>
                        <h4>Send Message</h4>
                        <Input value={message} onChange={(e) => setMessage(e.target.value)} />
                        <Button
                            onClick={() => sendMessageMutation.mutate({ agentId: selectedAgentId, message, direction: 'ceo_to_agent' })}
                            disabled={sendMessageMutation.isPending || !message.trim() || !selectedAgentId}
                        >
                            {sendMessageMutation.isPending ? "Sending..." : "Send Message"}
                        </Button>
                        <hr />
                        <h4>Message History</h4>
                        {isLoadingMessages ? (
                            <div>Loading messages...</div>
                        ) : messages.length === 0 ? (
                            <div>No messages yet. Send a message to start!</div>
                        ) : (
                            <div style={{ height: '200px', overflowY: 'scroll', border: '1px solid #eee', padding: '8px' }}>
                                {messages.map((msg) => (
                                    <div key={msg.id} style={{ textAlign: msg.fromAgentId === 'ceo' ? 'right' : 'left', margin: '4px 0' }}>
                                        <span style={{ background: msg.fromAgentId === 'ceo' ? '#e6f7ff' : '#f0f0f0', padding: '4px 8px', borderRadius: '4px', display: 'inline-block' }}>
                                            {msg.message} ({new Date(msg.timestamp).toLocaleTimeString()})
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CEODashboard;
