import { useState } from 'react';
import { trpc } from '../lib/trpc';

export function TrainerDashboard() {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showCleanupConfirm, setShowCleanupConfirm] = useState(false);

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
    try {
      const result = await cleanupAgents.mutateAsync();
      alert(`Cleanup complete! Deleted ${result.deletedCount} duplicates, renamed ${result.renamedCount} agents. ${result.remainingAgents} agents remaining.`);
      window.location.reload();
    } catch (error) {
      console.error('Failed to cleanup agents:', error);
      alert('Failed to cleanup agents. Please try again.');
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
              onClick={() => setShowCleanupConfirm(true)}
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

          {/* Immigration Law */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Immigration Law</h3>
            <button
              onClick={() => handleCreateAgent('immigration')}
              disabled={createAgent.isLoading}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {createAgent.isLoading ? 'Creating...' : 'Create Agent'}
            </button>
          </div>

          {/* Personal Injury */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Personal Injury</h3>
            <button
              onClick={() => handleCreateAgent('personal_injury')}
              disabled={createAgent.isLoading}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {createAgent.isLoading ? 'Creating...' : 'Create Agent'}
            </button>
          </div>

          {/* Employment Law */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Employment Law</h3>
            <button
              onClick={() => handleCreateAgent('employment')}
              disabled={createAgent.isLoading}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {createAgent.isLoading ? 'Creating...' : 'Create Agent'}
            </button>
          </div>

          {/* Real Estate Law */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Real Estate Law</h3>
            <button
              onClick={() => handleCreateAgent('real_estate')}
              disabled={createAgent.isLoading}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {createAgent.isLoading ? 'Creating...' : 'Create Agent'}
            </button>
          </div>

          {/* Estate Planning */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Estate Planning</h3>
            <button
              onClick={() => handleCreateAgent('estate_planning')}
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

      {/* Cleanup Confirmation Modal */}
      {showCleanupConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-white mb-4">🧹 Cleanup & Rename Agents</h3>
            <p className="text-gray-300 mb-6">
              This will:
              <br />• Remove all duplicate agents
              <br />• Rename agents to professional names
              <br />• Keep only one agent per specialty
              <br /><br />
              This action cannot be undone. Continue?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowCleanupConfirm(false);
                  handleCleanup();
                }}
                disabled={cleanupAgents.isLoading}
                className="flex-1 px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all disabled:opacity-50"
              >
                ✓ Confirm
              </button>
              <button
                onClick={() => setShowCleanupConfirm(false)}
                disabled={cleanupAgents.isLoading}
                className="flex-1 px-6 py-3 bg-gray-600 text-white font-bold rounded-xl hover:bg-gray-700 transition-all disabled:opacity-50"
              >
                ✗ Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
