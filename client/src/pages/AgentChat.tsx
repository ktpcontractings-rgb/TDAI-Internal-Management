import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { trpc } from '../lib/trpc';
import { VoiceChat } from '../components/VoiceChat';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function AgentChat() {
  const { agentId } = useParams<{ agentId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showVoiceChat, setShowVoiceChat] = useState(false);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [lastAgentMessage, setLastAgentMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch agent details
  const { data: agent, isLoading } = trpc.trainer.specialAgents.get.useQuery(
    { agentId: agentId! },
    { enabled: !!agentId }
  );

  // Chat mutation
  const chatMutation = trpc.trainer.specialAgents.chat.useMutation({
    onSuccess: (data) => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      }]);
      setLastAgentMessage(data.response);
      setIsAgentSpeaking(true);
      setIsSending(false);
      // Reset speaking state after a delay
      setTimeout(() => setIsAgentSpeaking(false), 1000);
    },
    onError: (error) => {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date(),
      }]);
      setIsSending(false);
    },
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || !agentId || isSending) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsSending(true);

    // Add user message to chat
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    }]);

    // Send to agent
    chatMutation.mutate({
      agentId,
      message: userMessage,
      conversationHistory: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
    });
  };

  const handleVoiceInput = (text: string) => {
    if (!agentId || isSending) return;

    setIsSending(true);

    // Add user message to chat
    setMessages(prev => [...prev, {
      role: 'user',
      content: text,
      timestamp: new Date(),
    }]);

    // Send to agent
    chatMutation.mutate({
      agentId,
      message: text,
      conversationHistory: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading agent...</div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl">Agent not found</div>
      </div>
    );
  }

  const specialtyColors: Record<string, string> = {
    bankruptcy: 'from-purple-600 to-pink-600',
    family_law: 'from-pink-600 to-rose-600',
    criminal: 'from-red-600 to-orange-600',
  };

  const specialtyColor = specialtyColors[agent.specialty] || 'from-blue-600 to-indigo-600';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/10 p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-16 h-16 bg-gradient-to-br ${specialtyColor} rounded-full flex items-center justify-center text-3xl`}>
              ⚖️
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{agent.name}</h1>
              <p className="text-gray-300">{agent.title}</p>
              <p className="text-gray-400 text-sm capitalize">{agent.specialty.replace('_', ' ')}</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`px-3 py-1 rounded ${
              agent.status === 'active' ? 'bg-green-500/20 text-green-300' :
              agent.status === 'training' ? 'bg-yellow-500/20 text-yellow-300' :
              'bg-gray-500/20 text-gray-300'
            }`}>
              {agent.status}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Welcome Message */}
          {messages.length === 0 && (
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-4">
                Welcome! I'm {agent.name}
              </h2>
              <p className="text-gray-300 mb-6">{agent.description}</p>
              <div className="text-left space-y-2">
                <p className="text-white font-semibold">I can help you with:</p>
                <ul className="text-gray-300 space-y-1">
                  {agent.keyAreas?.map((area: string, index: number) => (
                    <li key={index}>• {area}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-300 text-sm">
                  <strong>Disclaimer:</strong> I provide general legal information, not legal advice. 
                  For specific legal matters, please consult a licensed attorney.
                </p>
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-xl p-4 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                    : 'bg-white/10 backdrop-blur-md text-gray-100'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                <div className={`text-xs mt-2 ${
                  message.role === 'user' ? 'text-blue-200' : 'text-gray-400'
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isSending && (
            <div className="flex justify-start">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-white/10 backdrop-blur-md border-t border-white/10 p-6">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setShowVoiceChat(true)}
              className="px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all text-2xl"
              title="Start voice chat"
            >
              🎤
            </button>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me a legal question..."
              disabled={isSending}
              className="flex-1 px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isSending}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </div>

      {/* Voice Chat Modal */}
      {showVoiceChat && agent && (
        <VoiceChat
          agentName={agent.name}
          onVoiceInput={handleVoiceInput}
          onClose={() => setShowVoiceChat(false)}
          isAgentSpeaking={isAgentSpeaking}
          lastAgentMessage={lastAgentMessage}
        />
      )}
    </div>
  );
}
