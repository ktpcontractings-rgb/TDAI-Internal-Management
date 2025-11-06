import { useState } from 'react';
import { trpc } from '../lib/trpc';

export function TrainerDashboard() {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');

  // Fetch trainer status
  const { data: trainerStatus, isLoading: loadingTrainer } = trpc.trainer.getStatus.useQuery();

  // Fetch all special agents
  const { data: specialAgents } = trpc.trainer.specialAgents.list.useQuery();

  // Initialize trainer mutation
  const initializeTrainer = trpc.trainer.initialize.useMutation();

  // Create special agent mutation
  const createAgent = trpc.trainer.specialAgents.create.useMutation();

  const handleInitialize = async () => {
    try {
      await initializeTrainer.mutateAsync();
      window.location.reload();
    } catch (error) {
      console.error('Failed to initialize trainer:', error);
    }
  };

  const handleCreateAgent = async (specialty: string) => {
    try {
      await createAgent.mutateAsync({ specialty });
      window.location.reload();
    } catch (error) {
      console.error('Failed to create agent:', error);
    }
  };

  // Loading state
  if (loadingTrainer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  // Not initialized
  if (!trainerStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-8">
        <div className="max-w-2xl bg-white/10 backdrop-blur-md rounded-2xl p-12 text-center">
          <h1 className="text-5xl font-bold text-white mb-6">🎓 The Trainer</h1>
          <p className="text-xl text-gray-300 mb-8">
            Initialize Professor Atlas Sterling to begin training your Special Agents
          </p>
          <button
            onClick={handleInitialize}
            disabled={initializeTrainer.isLoading}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xl font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50"
          >
            {initializeTrainer.isLoading ? 'Initializing...' : 'Initialize The Trainer'}
          </button>
        </div>
      </div>
    );
  }

  // Main dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8">
          <h1 className="text-4xl font-bold text-white mb-2">🎓 The Trainer Dashboard</h1>
          <p className="text-xl text-gray-300">Professor Atlas Sterling - Chief Training Officer</p>
          <div className="mt-4 text-white">
            <div className="text-3xl font-bold">{trainerStatus.totalAgentsTrained || 0}</div>
            <div className="text-gray-300">Agents Trained</div>
          </div>
        </div>
      </div>

      {/* Specialties */}
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-4">Create Special Agents</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bankruptcy */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Bankruptcy Law</h3>
            <button
              onClick={() => handleCreateAgent('bankruptcy')}
              disabled={createAgent.isLoading}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {createAgent.isLoading ? 'Creating...' : 'Create Agent'}
            </button>
          </div>

          {/* Family Law */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Family Law</h3>
            <button
              onClick={() => handleCreateAgent('family_law')}
              disabled={createAgent.isLoading}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {createAgent.isLoading ? 'Creating...' : 'Create Agent'}
            </button>
          </div>

          {/* Criminal Defense */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Criminal Defense</h3>
            <button
              onClick={() => handleCreateAgent('criminal')}
              disabled={createAgent.isLoading}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {createAgent.isLoading ? 'Creating...' : 'Create Agent'}
            </button>
          </div>
        </div>
      </div>

      {/* Existing Agents */}
      {specialAgents && specialAgents.length > 0 && (
        <div className="max-w-7xl mx-auto mt-8">
          <h2 className="text-2xl font-bold text-white mb-4">Your Special Agents</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {specialAgents.map((agent: any) => (
              <div key={agent.id} className="bg-white/10 backdrop-blur-md rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-2">{agent.name}</h3>
                <p className="text-gray-300 mb-4">{agent.specialty}</p>
                <div className="text-sm text-gray-400">Status: {agent.status}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
