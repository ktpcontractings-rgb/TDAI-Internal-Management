import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Mock agent data for instant demo
const DEMO_AGENTS = [
  {
    id: 'demo_criminal',
    name: 'Marcus Steel',
    title: 'Criminal Defense Specialist',
    specialty: 'criminal',
    description: 'Expert in criminal defense with 15+ years of experience',
    status: 'active',
    keyAreas: ['DUI Defense', 'Drug Crimes', 'Assault Cases', 'White Collar Crime']
  },
  {
    id: 'demo_bankruptcy',
    name: 'Sarah Chen',
    title: 'Bankruptcy Law Expert',
    specialty: 'bankruptcy',
    description: 'Specialized in Chapter 7 and Chapter 13 bankruptcy cases',
    status: 'active',
    keyAreas: ['Chapter 7 Bankruptcy', 'Chapter 13 Bankruptcy', 'Debt Relief', 'Foreclosure Defense']
  },
  {
    id: 'demo_family',
    name: 'Jennifer Martinez',
    title: 'Family Law Advocate',
    specialty: 'family_law',
    description: 'Compassionate family law attorney focused on client wellbeing',
    status: 'active',
    keyAreas: ['Divorce', 'Child Custody', 'Adoption', 'Domestic Violence']
  },
  {
    id: 'demo_immigration',
    name: 'David Rodriguez',
    title: 'Immigration Law Specialist',
    specialty: 'immigration',
    description: 'Dedicated to helping families navigate immigration law',
    status: 'active',
    keyAreas: ['Green Cards', 'Citizenship', 'Visa Applications', 'Deportation Defense']
  },
  {
    id: 'demo_injury',
    name: 'Michael Thompson',
    title: 'Personal Injury Attorney',
    specialty: 'personal_injury',
    description: 'Fighting for injury victims to get the compensation they deserve',
    status: 'active',
    keyAreas: ['Car Accidents', 'Medical Malpractice', 'Slip and Fall', 'Wrongful Death']
  },
  {
    id: 'demo_employment',
    name: 'Lisa Anderson',
    title: 'Employment Law Expert',
    specialty: 'employment',
    description: 'Protecting employee rights in the workplace',
    status: 'active',
    keyAreas: ['Wrongful Termination', 'Discrimination', 'Harassment', 'Wage Disputes']
  },
  {
    id: 'demo_realestate',
    name: 'Robert Kim',
    title: 'Real Estate Attorney',
    specialty: 'real_estate',
    description: 'Ensuring smooth real estate transactions and resolving disputes',
    status: 'active',
    keyAreas: ['Property Transactions', 'Landlord-Tenant', 'Zoning Issues', 'Title Disputes']
  },
  {
    id: 'demo_estate',
    name: 'Patricia Williams',
    title: 'Estate Planning Counselor',
    specialty: 'estate_planning',
    description: 'Helping families plan for the future and protect their legacy',
    status: 'active',
    keyAreas: ['Wills', 'Trusts', 'Probate', 'Power of Attorney']
  }
];

const specialtyColors: Record<string, string> = {
  criminal: 'from-red-600 to-orange-600',
  bankruptcy: 'from-purple-600 to-pink-600',
  family_law: 'from-pink-600 to-rose-600',
  immigration: 'from-blue-600 to-cyan-600',
  personal_injury: 'from-green-600 to-emerald-600',
  employment: 'from-yellow-600 to-orange-600',
  real_estate: 'from-indigo-600 to-purple-600',
  estate_planning: 'from-teal-600 to-green-600',
};

export function InvestorDemo() {
  const navigate = useNavigate();

  const handleChatClick = (agentId: string) => {
    navigate(`/chat/${agentId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            ⚖️ Michigan AI Legal Team
          </h1>
          <p className="text-lg md:text-2xl text-gray-300 mb-2">
            AI-Powered Legal Assistance with Voice Chat
          </p>
          <p className="text-sm md:text-base text-gray-400">
            Click any agent to start a conversation • 🎤 Voice chat enabled
          </p>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {DEMO_AGENTS.map((agent) => {
            const colorClass = specialtyColors[agent.specialty] || 'from-blue-600 to-indigo-600';
            
            return (
              <div
                key={agent.id}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 hover:bg-white/20 transition-all cursor-pointer group"
                onClick={() => handleChatClick(agent.id)}
              >
                {/* Agent Avatar */}
                <div className={`w-20 h-20 mx-auto mb-4 bg-gradient-to-br ${colorClass} rounded-full flex items-center justify-center text-4xl group-hover:scale-110 transition-transform`}>
                  ⚖️
                </div>

                {/* Agent Info */}
                <h3 className="text-xl font-bold text-white text-center mb-2">
                  {agent.name}
                </h3>
                <p className="text-sm text-gray-300 text-center mb-4">
                  {agent.title}
                </p>

                {/* Key Areas */}
                <div className="space-y-1 mb-4">
                  {agent.keyAreas.slice(0, 3).map((area, index) => (
                    <div key={index} className="text-xs text-gray-400 text-center">
                      • {area}
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <button
                  className={`w-full px-4 py-3 bg-gradient-to-r ${colorClass} text-white font-semibold rounded-lg hover:shadow-lg transition-all group-hover:scale-105`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleChatClick(agent.id);
                  }}
                >
                  🎤 Consult Now
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto mt-12">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-6">
            Why Choose AI Legal Assistance?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">🎤</div>
              <h3 className="text-xl font-bold text-white mb-2">Voice Enabled</h3>
              <p className="text-gray-300 text-sm">
                Speak naturally with our AI agents using advanced voice recognition
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="text-xl font-bold text-white mb-2">Instant Answers</h3>
              <p className="text-gray-300 text-sm">
                Get immediate legal guidance 24/7 without waiting for appointments
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">💰</div>
              <h3 className="text-xl font-bold text-white mb-2">Affordable</h3>
              <p className="text-gray-300 text-sm">
                Access expert legal knowledge at a fraction of traditional attorney costs
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="max-w-7xl mx-auto mt-8">
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
          <p className="text-yellow-300 text-sm text-center">
            <strong>Disclaimer:</strong> This AI provides general legal information, not legal advice.
            For specific legal matters, please consult a licensed attorney.
          </p>
        </div>
      </div>
    </div>
  );
}
