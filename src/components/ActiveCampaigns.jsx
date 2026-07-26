import React, { useState, useEffect } from 'react';
import { 
  DollarSign, Clock, CheckCircle, AlertTriangle, Shield, 
  FileText, MessageCircle, Flag, TrendingUp, Calendar 
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

const ActiveCampaigns = ({ userType }) => {
  const supabase = createClient();
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');

  useEffect(() => {
    const fetchCampaigns = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const query = userType === 'creator'
        ? supabase.from('proposals').select('*').eq('creator_id', user.id).eq('status', 'accepted')
        : supabase.from('campaigns').select('*').eq('brand_id', user.id).eq('status', 'active');

      const { data, error } = await query;
      if (!error && data) {
        const enhancedCampaigns = data.map((item) => ({
          ...item,
          proposal: item.proposal || {
            projectName: item.title || 'Campaign',
            creatorPayout: item.budget || 0,
            budget: item.budget || 0,
          },
          milestones: item.milestones || [
            {
              id: 1,
              name: 'Content Creation',
              description: 'Deliverables for the campaign',
              percentage: 60,
              amount: (item.budget || 0) * 0.6,
              status: 'in_progress',
              dueDate: 'Pending'
            },
            {
              id: 2,
              name: 'Final Approval',
              description: 'Review and final approval',
              percentage: 40,
              amount: (item.budget || 0) * 0.4,
              status: 'pending',
              dueDate: 'Pending'
            }
          ],
          escrow: {
            totalAmount: item.budget || 0,
            held: item.budget || 0,
            released: 0,
            status: 'active'
          }
        }));
        setCampaigns(enhancedCampaigns);
      }
    };

    fetchCampaigns();
  }, [supabase, userType]);

  const handleCompleteMilestone = async (campaignIndex, milestoneId) => {
    const updatedCampaigns = [...campaigns];
    const campaign = updatedCampaigns[campaignIndex];
    const milestone = campaign.milestones.find((m) => m.id === milestoneId);

    if (milestone) {
      milestone.status = 'completed';
      setCampaigns(updatedCampaigns);

      if (campaign.id) {
        await supabase.from('proposals').update({ status: 'completed' }).eq('id', campaign.id);
      }

      alert(`✅ Milestone "${milestone.name}" marked as completed! Waiting for client approval.`);
    }
  };

  const handleApproveMilestone = async (campaignIndex, milestoneId) => {
    const updatedCampaigns = [...campaigns];
    const campaign = updatedCampaigns[campaignIndex];
    const milestone = campaign.milestones.find((m) => m.id === milestoneId);

    if (milestone) {
      milestone.status = 'approved';
      campaign.escrow.released += milestone.amount;
      campaign.escrow.held -= milestone.amount;
      setCampaigns(updatedCampaigns);

      if (campaign.id) {
        await supabase.from('proposals').update({ status: 'approved' }).eq('id', campaign.id);
      }

      alert(`💰 Payment released! $${milestone.amount.toLocaleString()} transferred to creator.`);
    }
  };

  const handleOpenDispute = (campaign) => {
    setSelectedCampaign(campaign);
    setShowDisputeModal(true);
  };

  const handleSubmitDispute = async () => {
    if (!disputeReason.trim()) {
      alert('Please provide a reason for the dispute');
      return;
    }

    const { error } = await supabase.from('disputes').insert({
      campaign_id: selectedCampaign?.id || null,
      reason: disputeReason,
      submitted_by: userType,
      status: 'pending',
    });

    setShowDisputeModal(false);
    setDisputeReason('');
    alert(error ? 'No se pudo registrar la disputa.' : '🚨 Dispute submitted. Our team will review within 24-48 hours.');
  };

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-900 rounded-2xl border border-cyan-500/20">
        <FileText size={48} className="text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400 text-lg">No active campaigns</p>
        <p className="text-gray-500 text-sm mt-2">Accept a proposal to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {campaigns.map((campaign, campaignIndex) => (
        <div key={campaignIndex} className="bg-gray-900 border border-cyan-500/30 rounded-2xl overflow-hidden">
          {/* Campaign Header */}
          <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border-b border-cyan-500/30 p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {campaign.proposal.projectName}
                </h3>
                <p className="text-cyan-400">
                  {userType === 'creator' ? `With ${campaign.match.profile.name}` : `With Creator`}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-400">
                  ${campaign.proposal.creatorPayout.toLocaleString()}
                </div>
                <div className="text-gray-400 text-sm">Total Payout</div>
              </div>
            </div>
          </div>

          {/* Escrow Status */}
          <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-b border-green-500/30 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="text-green-400" size={24} />
              <h4 className="text-white font-bold text-lg">Escrow Protection</h4>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-black/30 rounded-xl p-4 text-center">
                <div className="text-gray-400 text-xs mb-1">Total Budget</div>
                <div className="text-white font-bold text-lg">
                  ${campaign.escrow.totalAmount.toLocaleString()}
                </div>
              </div>
              <div className="bg-black/30 rounded-xl p-4 text-center">
                <div className="text-gray-400 text-xs mb-1">Held in Escrow</div>
                <div className="text-yellow-400 font-bold text-lg">
                  ${campaign.escrow.held.toLocaleString()}
                </div>
              </div>
              <div className="bg-black/30 rounded-xl p-4 text-center">
                <div className="text-gray-400 text-xs mb-1">Released</div>
                <div className="text-green-400 font-bold text-lg">
                  ${campaign.escrow.released.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="bg-black/30 rounded-lg p-3">
              <p className="text-gray-300 text-sm">
                💰 Funds are held securely until milestone completion. {userType === 'brand' ? 'Release payment after approving work.' : 'Complete milestones to receive payment.'}
              </p>
            </div>
          </div>

          {/* Milestones */}
          <div className="p-6">
            <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-cyan-400" />
              Milestones
            </h4>
            
            <div className="space-y-4">
              {campaign.milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className={`bg-gray-800 rounded-xl p-4 border-2 ${
                    milestone.status === 'approved' ? 'border-green-500/50' :
                    milestone.status === 'completed' ? 'border-yellow-500/50' :
                    milestone.status === 'in_progress' ? 'border-cyan-500/50' :
                    'border-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h5 className="text-white font-bold">{milestone.name}</h5>
                        {milestone.status === 'approved' && (
                          <span className="px-2 py-1 bg-green-500/20 border border-green-500/50 rounded-full text-green-400 text-xs font-semibold">
                            ✓ Approved & Paid
                          </span>
                        )}
                        {milestone.status === 'completed' && (
                          <span className="px-2 py-1 bg-yellow-500/20 border border-yellow-500/50 rounded-full text-yellow-400 text-xs font-semibold">
                            ⏳ Awaiting Approval
                          </span>
                        )}
                        {milestone.status === 'in_progress' && (
                          <span className="px-2 py-1 bg-cyan-500/20 border border-cyan-500/50 rounded-full text-cyan-400 text-xs font-semibold">
                            🔨 In Progress
                          </span>
                        )}
                        {milestone.status === 'pending' && (
                          <span className="px-2 py-1 bg-gray-700 border border-gray-600 rounded-full text-gray-400 text-xs font-semibold">
                            ⚪ Pending
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm mb-2">{milestone.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          Due: {milestone.dueDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign size={12} />
                          ${milestone.amount.toLocaleString()} ({milestone.percentage}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-3">
                    {userType === 'creator' && milestone.status === 'in_progress' && (
                      <button
                        onClick={() => handleCompleteMilestone(campaignIndex, milestone.id)}
                        className="px-4 py-2 bg-cyan-500 text-white rounded-lg font-semibold hover:bg-cyan-600 text-sm flex items-center gap-2"
                      >
                        <CheckCircle size={16} />
                        Mark Complete
                      </button>
                    )}
                    
                    {userType === 'brand' && milestone.status === 'completed' && (
                      <button
                        onClick={() => handleApproveMilestone(campaignIndex, milestone.id)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 text-sm flex items-center gap-2"
                      >
                        <CheckCircle size={16} />
                        Approve & Release Payment
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dispute Button */}
          <div className="border-t border-gray-800 p-6">
            <button
              onClick={() => handleOpenDispute(campaign)}
              className="w-full py-3 border-2 border-red-500 text-red-400 rounded-xl font-semibold hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"
            >
              <Flag size={18} />
              Report an Issue / Open Dispute
            </button>
          </div>
        </div>
      ))}

      {/* Dispute Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 border border-red-500/30 rounded-2xl max-w-2xl w-full">
            <div className="bg-gradient-to-r from-red-500 to-orange-600 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Flag className="text-white" size={24} />
                <h2 className="text-2xl font-bold text-white">Open Dispute</h2>
              </div>
              <button
                onClick={() => setShowDisputeModal(false)}
                className="text-white hover:bg-white/20 rounded-lg p-2"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-xl p-4 mb-6">
                <p className="text-yellow-300 text-sm">
                  ⚠️ Disputes should only be opened for serious issues like non-payment, non-delivery, or major contract violations. Our team will review and mediate within 24-48 hours.
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-white font-semibold mb-2">
                  What's the issue?
                </label>
                <textarea
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="Please describe the issue in detail. Include dates, deliverables, and any relevant information..."
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 resize-none"
                  rows={6}
                />
              </div>

              <div className="bg-gray-800 rounded-xl p-4 mb-6">
                <h4 className="text-white font-semibold mb-2">What happens next?</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• Our dispute resolution team will be notified immediately</li>
                  <li>• Both parties will be contacted within 24 hours</li>
                  <li>• Escrow funds will be frozen until resolution</li>
                  <li>• Team will review evidence and mediate a fair solution</li>
                </ul>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowDisputeModal(false)}
                  className="flex-1 py-3 border-2 border-gray-600 text-gray-400 rounded-xl font-semibold hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitDispute}
                  className="flex-1 py-3 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-orange-700"
                >
                  Submit Dispute
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveCampaigns;
