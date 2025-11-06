import { useState } from 'react';
import { trpc } from '../lib/trpc';

export function TrainerDashboard() {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
  const [isCreatingAgent, setIsCreatingAgent] = useState(false);

  // Fetch trainer status
  const { data: trainerStatus, isLoading: loadingTrainer, refetch: refetchTrainer } = trpc.trainer.getStatus.useQuery();

  // Fetch all special agents
  const { data: specialAgents, isLoading: loadingAgents, refetch: refetchAgents } = trpc.trainer.specialAgents.list.useQuery();

  // Create special agent mutation
  const createAgent = trpc.trainer.specialAgents.create.useMutation({
    onSuccess: () => {
      refetchAgents();
      setIsCreatingAgent(false);
      setSelectedSpecialty('');
    },
  });

  // Initialize trainer mutation
  const initializeTrainer = trpc.trainer.initialize.useMutation({
    onSuccess: () => {
      // Refetch trainer status instead of reloading the page
      refetchTrainer();
    },
  });

  const handleCreateAgent = async (specialty: string) => {
    setIsCreatingAgent(true);
    try {
      await createAgent.mutateAsync({ specialty });
    } catch (error) {
      console.error('Failed to create agent:', error);
      setIsCreatingAgent(false);
    }
  };

  const specialties = [
    { id: 'bankruptcy', name: 'Bankruptcy Law', agent: 'Baron von Bankruptcy', color: 'bg-purple-500' },
    { id: 'family_law', name: 'Family Law', agent: 'Mary Matrimonial', color: 'bg-pink-500' },
    { id: 'criminal', name: 'Criminal Defense', agent: 'Legal Evil Esquire', color: 'bg-red-500' },
    { id: 'immigration', name: 'Immigration Law', agent: 'Coming Soon', color: 'bg-blue-500', disabled: true },
    { id: 'real_estate', name: 'Real Estate Law', agent: 'Coming Soon', color: 'bg-green-500', disabled: true },
    { id: 'ip', name: 'Intellectual Property', agent: 'Coming Soon', color: 'bg-indigo-500', disabled: true },
  ];

  // Show loading state
  if (loadingTrainer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-2xl mb-4">Loading Trainer...</div>
          <div className="animate-pulse text-gray-400">Connecting to database...</div>
        </div>
      </div>
    );
  }

  // If trainer not initialized, show initialization screen
  if (!trainerStatus || trainerStatus === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-8">
        <div className="max-w-2xl bg-white/10 backdrop-blur-md rounded-2xl p-12 text-center">
          <h1 className="text-5xl font-bold text-white mb-6">🎓 The Trainer</h1>
          <p className="text-xl text-gray-300 mb-8">
            Initialize Professor Atlas Sterling to begin training your Special Agents
          </p>
          <button
            onClick={() => initializeTrainer.mutate()}
            disabled={initializeTrainer.isPending}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xl font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg disabled:opacity-50"
          >
            {initializeTrainer.isPending ? 'Initializing...' : 'Initialize The Trainer'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">🎓 The Trainer Dashboard</h1>
              <p className="text-xl text-gray-300">Professor Atlas Sterling - Chief Training Officer</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white">{trainerStatus.totalAgentsTrained}</div>
              <div className="text-gray-300">Agents Trained</div>
            </div>
          </div>
        </div>
      </div>

      {/* Special Agents Grid */}
      <div className="max-w-7xl mx-auto mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Special Agents Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {specialties.map((specialty) => {
            const existingAgent = specialAgents?.find(a => a.specialty === specialty.id);
            
            return (
              <div
                key={specialty.id}
                className={`bg-white/10 backdrop-blur-md rounded-xl p-6 ${
                  specialty.disabled ? 'opacity-50' : ''
                }`}
              >
                <div className={`w-16 h-16 ${specialty.color} rounded-full flex items-center justify-center text-3xl mb-4`}>
                  ⚖️
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{specialty.name}</h3>
                <p className="text-gray-300 mb-4">{specialty.agent}</p>
                
                {existingAgent ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Status:</span>
                      <span className={`px-2 py-1 rounded ${
                        existingAgent.status === 'active' ? 'bg-green-500/20 text-green-300' :
                        existingAgent.status === 'training' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-gray-500/20 text-gray-300'
                      }`}>
                        {existingAgent.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Performance:</span>
                      <span className="text-white font-semibold">
                        {existingAgent.performanceScore ? `${parseFloat(existingAgent.performanceScore).toFixed(1)}%` : 'N/A'}
                      </span>
                    </div>
                    <button
                      className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      onClick={() => window.location.href = `/chat/${existingAgent.id}`}
                    >
                      Chat with Agent
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => !specialty.disabled && handleCreateAgent(specialty.id)}
                    disabled={specialty.disabled || isCreatingAgent}
                    className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {specialty.disabled ? 'Coming Soon' : isCreatingAgent ? 'Creating...' : 'Create Agent'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Agents List */}
      {specialAgents && specialAgents.length > 0 && (
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-4">Active Agents</h2>
          <div className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Agent</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Specialty</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Performance</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Last Trained</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {specialAgents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-white font-semibold">{agent.name}</div>
                      <div className="text-gray-400 text-sm">{agent.title}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-300 capitalize">
                      {agent.specialty.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-sm ${
                        agent.status === 'active' ? 'bg-green-500/20 text-green-300' :
                        agent.status === 'training' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-gray-500/20 text-gray-300'
                      }`}>
                        {agent.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white font-semibold">
                      {agent.performanceScore?.toFixed(1) || 'N/A'}%
                    </td>
                    <td className="px-6 py-4 text-gray-300 text-sm">
                      {agent.lastTrainedAt ? new Date(agent.lastTrainedAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                        onClick={() => window.location.href = `/chat/${agent.id}`}
                      >
                        Chat
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
