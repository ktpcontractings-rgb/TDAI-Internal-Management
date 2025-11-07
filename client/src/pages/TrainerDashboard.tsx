import { useState } from 'react';
import { trpc } from '../lib/trpc';

export function TrainerDashboard() {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Fetch trainer status
  const { data: trainerStatus, isLoading: loadingTrainer } = trpc.trainer.getStatus.useQuery();

  // Fetch all special agents
  const { data: specialAgents } = trpc.trainer.specialAgents.list.useQuery();

  // Initialize trainer mutation
  const initializeTrainer = trpc.trainer.initialize.useMutation();

  // Create special agent mutation
  const createAgent = trpc.trainer.specialAgents.create.useMutation();

  // Delete agent mutation
  const deleteAgent = trpc.trainer.specialAgents.delete.useMutation();

  // Cleanup mutation
  const cleanupAgents = trpc.trainer.specialAgents.cleanup.useMutation();

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

  const handleDeleteAgent = async (agentId: string) => {
    try {
      await deleteAgent.mutateAsync({ agentId });
      setDeleteConfirmId(null);
      window.location.reload();
    } catch (error) {
      console.error('Failed to delete agent:', error);
    }
  };

  const handleCleanup = async () => {
    if (!confirm('This will remove duplicate agents and rename them to professional names. Continue?')) {
      return;
    }
    try {
      const result = await cleanupAgents.mutateAsync();
      alert(`Cleanup complete! Deleted ${result.deletedCount} duplicates, renamed ${result.renamedCount} agents. ${result.remainingAgents} agents remaining.`);
      window.location.reload();
    } catch (error) {
      console.error('Failed to cleanup agents:', error);
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
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">🎓 The Trainer Dashboard</h1>
              <p className="text-xl text-gray-300">Professor Atlas Sterling - Chief Training Officer</p>
              <div className="mt-4 text-white">
                <div className="text-3xl font-bold">{trainerStatus.totalAgentsTrained || 0}</div>
                <div className="text-gray-300">Agents Trained</div>
              </div>
            </div>
            <button
              onClick={handleCleanup}
              disabled={cleanupAgents.isLoading}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50"
            >
              {cleanupAgents.isLoading ? 'Cleaning...' : '🧹 Cleanup & Rename'}
            </button>
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
              <div 
                key={agent.id} 
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 relative"
              >
                <h3 className="text-xl font-bold text-white mb-2">{agent.name}</h3>
                <p className="text-gray-300 mb-4">{agent.specialty}</p>
                <div className="text-sm text-gray-400 mb-4">Status: {agent.status}</div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => window.location.href = `/chat/${agent.id}`}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Chat with {agent.name.split(' ')[0]}
                  </button>
                  
                  {deleteConfirmId === agent.id ? (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleDeleteAgent(agent.id)}
                        disabled={deleteAgent.isLoading}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        ✓ Confirm
                      </button>
                      <button 
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        ✗ Cancel
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setDeleteConfirmId(agent.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      title="Delete agent"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
