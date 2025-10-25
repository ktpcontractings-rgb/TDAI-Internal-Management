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

// --- Mock Data from Handoff Document ---
// --- Data Loading (tRPC Queries) ---


const CEODashboard: React.FC = () => {
    // State for inputs and selected agent
    const [message, setMessage] = useState('');
    const [selectedAgentId, setSelectedAgentId] = useState('cto_agent_001'); // Start with a default agent ID
    const [codexPassword, setCodexPassword] = useState('');
    const [decryptedCodex, setDecryptedCodex] = useState('');

    // --- Data Loading (tRPC Queries) ---
    const { data: agents = [], isLoading: isLoadingAgents } = trpc.agents.list.useQuery();
    const { data: pendingDecisions = [], isLoading: isLoadingDecisions } = trpc.agents.decisions.list.useQuery();
    const { data: messages = [], isLoading: isLoadingMessages } = trpc.agents.communications.list.useQuery({ agentId: selectedAgentId }, { enabled: !!selectedAgentId });

    // Helper to get the tRPC context for invalidation
    const trpcUtils = trpc.useUtils();

    // --- Mutations (tRPC) ---

    // 1. Initialize Agent Mutation
    const initializeAgentMutation = trpc.agentReasoning.initializeAgent.useMutation({
        onSuccess: (data) => {
            toast.success(`${data.name} initialized successfully!`);
            trpcUtils.agents.list.invalidate(); // Refresh agent list
        },
        onError: (error) => {
            toast.error(`Failed to initialize agent: ${error.message}`);
        },
    });

    // 2. Update Decision Mutation (Approve/Reject)
    const updateDecisionMutation = trpc.agents.decisions.update.useMutation({
        onSuccess: () => {
            toast.success("Decision updated successfully!");
            trpcUtils.agents.decisions.list.invalidate(); // Refresh decisions list
        },
        onError: (error) => {
            toast.error(`Failed to update decision: ${error.message}`);
        },
    });

    // 3. Send Message Mutation
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

    // 4. Access Genesis Codex Mutation
    const accessCodexMutation = trpc.documents.retrieve.useMutation({
        onSuccess: (data) => {
            toast.success("Genesis Codex decrypted successfully!");
            setDecryptedCodex(data.content);
        },
        onError: (error) => {
            toast.error(`Failed to access Codex: ${error.message}`);
            setDecryptedCodex('');
        },
    });

    return (
        <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
            <h1>TDAI CEO Command Center</h1>
            <p>Status: UI is complete, but buttons don't work yet (using mock data)</p>

            <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
                {/* Agent Management Card */}
                <Card title="Agent Management">
                    <h4>Initialize Agents</h4>
                    <Button
                        onClick={() => initializeAgentMutation.mutate({ agent: 'pm' })}
                        disabled={initializeAgentMutation.isPending}
                    >
                        {initializeAgentMutation.isPending ? "Initializing PM..." : "Initialize PM Agent"}
                    </Button>
                    <Button
                        onClick={() => initializeAgentMutation.mutate({ agent: 'cto' })}
                        disabled={initializeAgentMutation.isPending}
                    >
                        {initializeAgentMutation.isPending ? "Initializing CTO..." : "Initialize CTO Agent"}
                    </Button>
                    <hr />
                    <h4>Agent Status (Mock Data)</h4>
                    {isLoadingAgents ? (
                        <div>Loading agents...</div>
                    ) : (
                        <ul>
                            {agents.map(agent => (
                                <li key={agent.id} onClick={() => setSelectedAgentId(agent.id)} style={{ cursor: 'pointer', fontWeight: agent.id === selectedAgentId ? 'bold' : 'normal' }}>
                                    {agent.name} - Status: {agent.status} (Last Seen: {new Date(agent.lastSeen).toLocaleTimeString()})
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>

                {/* Decisions Card */}
                <Card title="Pending Decisions">
                    {isLoadingDecisions ? (
                        <div>Loading decisions...</div>
                    ) : (
                        <ul>
                            {pendingDecisions.map(decision => (
                                <li key={decision.id} style={{ marginBottom: '10px' }}>
                                    <p><strong>{decision.description}</strong></p>
                                    <Button
                                        onClick={() => updateDecisionMutation.mutate({ decisionId: decision.id, status: 'approved' })}
                                        disabled={updateDecisionMutation.isPending}
                                    >
                                        {updateDecisionMutation.isPending ? "Approving..." : "Approve"}
                                    </Button>
                                    <Button
                                        onClick={() => updateDecisionMutation.mutate({ decisionId: decision.id, status: 'rejected' })}
                                        disabled={updateDecisionMutation.isPending}
                                    >
                                        {updateDecisionMutation.isPending ? "Rejecting..." : "Reject"}
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
                    <h4>Message History (Mock Data)</h4>
                    {isLoadingMessages ? (
                        <div>Loading messages...</div>
                    ) : (
                        <div style={{ height: '200px', overflowY: 'scroll', border: '1px solid #eee', padding: '8px' }}>
                            {messages.map((msg, index) => (
                                <div key={index} style={{ textAlign: msg.direction === 'ceo_to_agent' ? 'right' : 'left', margin: '4px 0' }}>
                                    <span style={{ background: msg.direction === 'ceo_to_agent' ? '#e6f7ff' : '#f0f0f0', padding: '4px 8px', borderRadius: '4px', display: 'inline-block' }}>
                                        {msg.message} ({new Date(msg.timestamp).toLocaleTimeString()})
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Documents Card */}
                <Card title="TDAI Genesis Codex">
                    <p>Enter password to access the encrypted documentation.</p>
                    <Input value={codexPassword} onChange={(e) => setCodexPassword(e.target.value)} />
                    <Button
                        onClick={() => accessCodexMutation.mutate({ documentId: 'TDAI_GENESIS_CODEX', password: codexPassword })}
                        disabled={accessCodexMutation.isPending || !codexPassword}
                    >
                        {accessCodexMutation.isPending ? "Accessing..." : "Access Genesis Codex"}
                    </Button>
                    {decryptedCodex && (
                        <div style={{ marginTop: '10px', border: '1px solid green', padding: '8px', background: '#e6ffe6' }}>
                            <strong>Decrypted Content:</strong>
                            <pre>{decryptedCodex}</pre>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default CEODashboard;
