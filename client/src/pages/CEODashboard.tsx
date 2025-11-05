import React, { useState } from 'react';
import { trpc } from '../lib/trpc';
import { toast } from 'sonner';

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
    const [message, setMessage] = useState('');
    const [selectedAgentId, setSelectedAgentId] = useState('cto_agent_001');
    const [expandedRecommendation, setExpandedRecommendation] = useState<string | null>(null);

    const { data: agents = [], isLoading: isLoadingAgents } = trpc.agents.list.useQuery();
    const { data: pendingDecisions = [], isLoading: isLoadingDecisions } = trpc.agents.decisions.list.useQuery({ agentId: selectedAgentId }, { enabled: !!selectedAgentId });
    const { data: messages = [], isLoading: isLoadingMessages } = trpc.agents.communications.list.useQuery({ agentId: selectedAgentId }, { enabled: !!selectedAgentId });

    const trpcUtils = trpc.useUtils();

    const initializeAgentMutation = trpc.agents.initialize.useMutation({
        onSuccess: (data) => {
            toast.success(`${data.agent.name} initialized successfully!`);
            if (data.recommendation) {
                toast.info(`Recommendation: ${data.recommendation.title}`);
            }
            trpcUtils.agents.list.invalidate();
        },
        onError: (error) => {
            toast.error(`Failed to initialize agent: ${error.message}`);
        },
    });

    const approveDecisionMutation = trpc.agents.decisions.approve.useMutation({
        onSuccess: () => {
            toast.success("Decision approved successfully!");
            trpcUtils.agents.decisions.list.invalidate({ agentId: selectedAgentId });
        },
        onError: (error) => {
            toast.error(`Failed to approve decision: ${error.message}`);
        },
    });

    const rejectDecisionMutation = trpc.agents.decisions.reject.useMutation({
        onSuccess: () => {
            toast.success("Decision rejected successfully!");
            trpcUtils.agents.decisions.list.invalidate({ agentId: selectedAgentId });
        },
        onError: (error) => {
            toast.error(`Failed to reject decision: ${error.message}`);
        },
    });

    const sendMessageMutation = trpc.agents.communications.send.useMutation({
        onSuccess: () => {
            toast.success("Message sent successfully!");
            setMessage('');
            trpcUtils.agents.communications.list.invalidate({ agentId: selectedAgentId });
        },
        onError: (error) => {
            toast.error(`Failed to send message: ${error.message}`);
        },
    });

    const speakMutation = trpc.agents.speak.useMutation({
        onSuccess: (data) => {
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
            <div style={{ maxWidth: '1400px', margin: '0 auto', background: 'rgba(255,255,255,0.95)', borderRadius: '12px', padding: '30px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
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
                        <Button
                            onClick={() => initializeAgentMutation.mutate({ role: 'CEO' })}
                            disabled={initializeAgentMutation.isPending}
                        >
                            {initializeAgentMutation.isPending ? "Initializing CEO..." : "Initialize CEO Agent"}
                        </Button>
                        <hr />
                        <h4>Agent Status & Recommendations</h4>
                        {isLoadingAgents ? (
                            <div>Loading agents...</div>
                        ) : agents.length === 0 ? (
                            <div>No agents initialized yet. Click a button above to start!</div>
                        ) : (
                            <div>
                                {agents.map(agent => (
                                    <div key={agent.id} style={{ 
                                        border: '1px solid #ddd', 
                                        padding: '12px', 
                                        marginBottom: '12px', 
                                        borderRadius: '8px',
                                        background: agent.id === selectedAgentId ? '#f0f0ff' : '#fff'
                                    }}>
                                        <div 
                                            onClick={() => setSelectedAgentId(agent.id)} 
                                            style={{ cursor: 'pointer', fontWeight: agent.id === selectedAgentId ? 'bold' : 'normal' }}
                                        >
                                            <div style={{ fontSize: '16px', marginBottom: '4px' }}>
                                                {agent.name} - {agent.status}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#666' }}>
                                                Created: {new Date(agent.createdAt).toLocaleString()}
                                            </div>
                                        </div>
                                        
                                        {/* Display Recommendation */}
                                        {agent.recommendation && (
                                            <div style={{ marginTop: '12px', padding: '12px', background: '#f9f9f9', borderRadius: '6px', border: '1px solid #e0e0e0' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <strong style={{ color: '#667eea' }}>💡 Recommendation</strong>
                                                    <Button onClick={() => setExpandedRecommendation(expandedRecommendation === agent.id ? null : agent.id)}>
                                                        {expandedRecommendation === agent.id ? 'Hide' : 'Show'}
                                                    </Button>
                                                </div>
                                                
                                                {expandedRecommendation === agent.id && typeof agent.recommendation === 'object' && (
                                                    <div style={{ marginTop: '12px' }}>
                                                        <h4 style={{ margin: '8px 0', color: '#333' }}>{agent.recommendation.title}</h4>
                                                        <p style={{ margin: '8px 0', fontSize: '14px' }}><strong>Summary:</strong> {agent.recommendation.summary}</p>
                                                        <p style={{ margin: '8px 0', fontSize: '14px' }}><strong>Reasoning:</strong> {agent.recommendation.reasoning}</p>
                                                        
                                                        {agent.recommendation.actionItems && agent.recommendation.actionItems.length > 0 && (
                                                            <div style={{ margin: '8px 0' }}>
                                                                <strong style={{ fontSize: '14px' }}>Action Items:</strong>
                                                                <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                                                                    {agent.recommendation.actionItems.map((item: string, idx: number) => (
                                                                        <li key={idx} style={{ fontSize: '13px', margin: '4px 0' }}>{item}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                        
                                                        {agent.recommendation.references && agent.recommendation.references.length > 0 && (
                                                            <div style={{ margin: '8px 0' }}>
                                                                <strong style={{ fontSize: '14px' }}>References:</strong>
                                                                <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                                                                    {agent.recommendation.references.map((ref: string, idx: number) => (
                                                                        <li key={idx} style={{ fontSize: '13px', margin: '4px 0' }}>{ref}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                        
                                                        <Button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const text = `${agent.recommendation.title}. ${agent.recommendation.summary}`;
                                                                speakMutation.mutate({ agentId: agent.id, text });
                                                            }}
                                                            disabled={speakMutation.isPending}
                                                        >
                                                            {speakMutation.isPending ? "🎤 Speaking..." : "🔊 Speak"}
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
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
