import React, { useState } from 'react';
import { X, DollarSign, FileText, Calendar, AlertCircle, CheckCircle, Shield } from 'lucide-react';

const ProposalModal = ({ isOpen, onClose, match, userType, onAccept, onReject }) => {
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [accepting, setAccepting] = useState(false);

  if (!isOpen || !match) return null;

  // Sample proposal data
  const proposal = {
    projectName: 'Sustainable Fashion Campaign Q1 2026',
    budget: 5000,
    deliverables: [
      '3 Instagram Posts (1080x1080)',
      '2 Instagram Stories (1080x1920)',
      '1 Reel (60 seconds)',
      'Full usage rights for 6 months'
    ],
    timeline: '2 weeks from acceptance',
    deadline: 'April 17, 2026',
    requirements: [
      'High-quality photos and videos',
      'Brand hashtags and mentions',
      'Prior approval of content before posting',
      '48-hour response time for revisions'
    ],
    commission: 750, // 15% of 5000
    creatorPayout: 4250
  };

  const handleAccept = () => {
    setAccepting(true);
    setTimeout(() => {
      onAccept(proposal);
      setAccepting(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 border border-cyan-500/30 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-cyan-500 to-blue-500 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <FileText className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Campaign Proposal</h2>
              <p className="text-cyan-100 text-sm">from {match.profile.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* IndaSocial Commission Disclaimer */}
        {showDisclaimer && (
          <div className="m-6 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border-2 border-yellow-500/50 rounded-xl p-6 relative">
            <button
              onClick={() => setShowDisclaimer(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={16} />
            </button>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertCircle className="text-yellow-400" size={24} />
              </div>
              <div>
                <h3 className="text-yellow-400 font-bold text-lg mb-2">
                  📋 Important: Platform Fee
                </h3>
                <p className="text-gray-300 text-sm mb-3">
                  IndaSocial charges a <strong className="text-white">15% platform fee</strong> on all completed campaigns to maintain our secure payment system, fraud protection, and dispute resolution services.
                </p>
                <div className="bg-black/30 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Campaign Budget:</span>
                    <span className="text-white font-bold">${proposal.budget.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Platform Fee (15%):</span>
                    <span className="text-yellow-400 font-bold">-${proposal.commission.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-gray-700 pt-2 flex items-center justify-between">
                    <span className="text-gray-300 font-semibold">You Receive:</span>
                    <span className="text-green-400 font-bold text-lg">${proposal.creatorPayout.toLocaleString()}</span>
                  </div>
                </div>
                <p className="text-gray-400 text-xs mt-3">
                  ✓ Protected payments · ✓ Fraud prevention · ✓ 24/7 support · ✓ Dispute resolution
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Project Name */}
          <div>
            <h3 className="text-white font-bold text-xl mb-2">{proposal.projectName}</h3>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <span>{proposal.timeline}</span>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign size={14} />
                <span>${proposal.budget.toLocaleString()} budget</span>
              </div>
            </div>
          </div>

          {/* Budget Breakdown */}
          <div className="bg-gray-800 rounded-xl p-4">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <DollarSign size={18} className="text-green-400" />
              Payment Breakdown
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Total Budget</span>
                <span className="text-white font-bold">${proposal.budget.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">IndaSocial Fee (15%)</span>
                <span className="text-yellow-400">-${proposal.commission.toLocaleString()}</span>
              </div>
              <div className="border-t border-gray-700 pt-2 flex items-center justify-between">
                <span className="text-white font-semibold">Your Payout</span>
                <span className="text-green-400 font-bold text-xl">${proposal.creatorPayout.toLocaleString()}</span>
              </div>
            </div>
            <div className="mt-3 p-3 bg-cyan-900/20 border border-cyan-500/30 rounded-lg">
              <p className="text-cyan-300 text-xs">
                💰 Payment will be held in escrow until project completion and approval
              </p>
            </div>
          </div>

          {/* Deliverables */}
          <div className="bg-gray-800 rounded-xl p-4">
            <h4 className="text-white font-semibold mb-3">📦 Deliverables</h4>
            <ul className="space-y-2">
              {proposal.deliverables.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-300 text-sm">
                  <CheckCircle size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Requirements */}
          <div className="bg-gray-800 rounded-xl p-4">
            <h4 className="text-white font-semibold mb-3">📋 Requirements</h4>
            <ul className="space-y-2">
              {proposal.requirements.map((req, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-300 text-sm">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Timeline */}
          <div className="bg-gray-800 rounded-xl p-4">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Calendar size={18} className="text-cyan-400" />
              Timeline
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Duration</span>
                <span className="text-white">{proposal.timeline}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Deadline</span>
                <span className="text-white font-semibold">{proposal.deadline}</span>
              </div>
            </div>
          </div>

          {/* Protection Notice */}
          <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Shield className="text-green-400 flex-shrink-0" size={20} />
              <div>
                <h4 className="text-green-400 font-semibold mb-1">Protected by IndaSocial</h4>
                <p className="text-gray-300 text-sm">
                  This campaign is protected by our escrow system. Payment is guaranteed upon successful completion and approval. If there are any issues, our dispute resolution team will step in.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-gray-900 border-t border-gray-800 p-6 flex gap-4">
          <button
            onClick={onReject}
            className="flex-1 py-3 border-2 border-red-500 text-red-400 rounded-xl font-semibold hover:bg-red-500/10 transition-all"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            disabled={accepting}
            className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {accepting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Accepting...
              </>
            ) : (
              <>
                <CheckCircle size={20} />
                Accept Proposal
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProposalModal;
