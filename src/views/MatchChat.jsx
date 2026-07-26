import React, { useState, useEffect } from 'react';
import {
  X, Send, Lock, AlertCircle, DollarSign, CheckCircle, 
  User, MessageCircle, FileText, Clock, Shield
} from 'lucide-react';

const MatchChatDashboard = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [projectStatus, setProjectStatus] = useState('negotiating');
  const [showProposal, setShowProposal] = useState(false);
  const [showBlockedInfo, setShowBlockedInfo] = useState(false);

  // Load messages from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      // Initial messages
      const initialMessages = [
        {
          id: 1,
          sender: 'brand',
          text: 'Hi Sarah! We love your content style and would like to collaborate on our upcoming sustainable fashion campaign.',
          time: '10:30 AM',
          read: true
        },
        {
          id: 2,
          sender: 'creator',
          text: 'Thank you! I\'d love to hear more about the project. What are you looking for?',
          time: '10:35 AM',
          read: true
        },
        {
          id: 3,
          sender: 'brand',
          text: 'We need 3 Instagram posts and 2 Stories showcasing our new eco-friendly collection. Budget is flexible.',
          time: '10:40 AM',
          read: true
        }
      ];
      setMessages(initialMessages);
      localStorage.setItem('chatMessages', JSON.stringify(initialMessages));
    }
  }, []);

  const brand = {
    name: 'Weecoin',
    description: 'A decentralized finance platform focused on dApp.',
    industry: 'Technology',
    verified: true,
    logo: 'W',
    color: 'from-pink-500 to-purple-600'
  };

  const creator = {
    name: 'Sarah',
    reach: '120k',
    followers: 'followers',
    contentStyle: 'Lifestyle & Tutorials',
    verified: true,
    avatar: '👩‍🦰'
  };

  const proposal = {
    projectName: 'Sustainable Fashion Campaign Q1 2026',
    budget: 5000,
    deliverables: [
      '3 Instagram Posts',
      '2 Instagram Stories',
      '1 Reel (60s)',
      'Full usage rights for 6 months'
    ],
    timeline: '2 weeks',
    commission: 750, // 15% IndaSocial commission
    creatorPayout: 4250
  };

  // Filter messages to block contact info
  const filterMessage = (text) => {
    // Block emails
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    text = text.replace(emailRegex, '🔒 [Contact info blocked]');
    
    // Block phone numbers
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    text = text.replace(phoneRegex, '🔒 [Phone blocked]');
    
    // Block social handles
    const socialRegex = /@[\w]+/g;
    text = text.replace(socialRegex, '🔒 [Social handle blocked]');
    
    return text;
  };

  const detectBlockedContent = (text) => {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    const socialRegex = /@[\w]+/g;
    
    return emailRegex.test(text) || phoneRegex.test(text) || socialRegex.test(text);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    if (detectBlockedContent(newMessage)) {
      setShowBlockedInfo(true);
      setTimeout(() => setShowBlockedInfo(false), 3000);
      return;
    }

    const newMsg = {
      id: Date.now(),
      sender: 'creator',
      text: newMessage,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      read: false
    };

    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
    setNewMessage('');
  };

  const handleAcceptProposal = () => {
    setProjectStatus('accepted');
    const acceptMsg = {
      id: messages.length + 1,
      sender: 'system',
      text: '✅ Project proposal accepted! IndaSocial will now coordinate the collaboration. Contact information unlocked.',
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      read: false
    };
    setMessages([...messages, acceptMsg]);
    setShowProposal(false);
  };

  return (
    <div className="min-h-screen bg-dark flex">
      {/* Blocked Info Warning */}
      {showBlockedInfo && (
        <div className="fixed top-4 right-4 z-50 bg-red-500/20 border-2 border-red-500 rounded-xl p-4 max-w-md animate-slideUp">
          <div className="flex items-start gap-3">
            <AlertCircle size={24} className="text-red-400 flex-shrink-0" />
            <div>
              <h3 className="text-red-400 font-bold mb-1">Contact Info Blocked</h3>
              <p className="text-gray-300 text-sm">
                To protect both parties, contact information can only be shared after accepting a project proposal.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Proposal Modal */}
      {showProposal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-dark-light border-2 border-cyan-500 rounded-2xl p-8 max-w-2xl w-full animate-fadeIn glow-cyan">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Project Proposal</h2>
              <button onClick={() => setShowProposal(false)} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                <X size={24} className="text-gray-400" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-cyan-400 font-bold mb-2">{proposal.projectName}</h3>
                <p className="text-gray-400 text-sm">From: {brand.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-dark border border-cyan-500/20 rounded-xl p-4">
                  <div className="text-gray-400 text-sm mb-1">Total Budget</div>
                  <div className="text-2xl font-bold text-white">${proposal.budget.toLocaleString()}</div>
                </div>
                <div className="bg-dark border border-cyan-500/20 rounded-xl p-4">
                  <div className="text-gray-400 text-sm mb-1">Timeline</div>
                  <div className="text-2xl font-bold text-white">{proposal.timeline}</div>
                </div>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-3">Deliverables:</h4>
                <ul className="space-y-2">
                  {proposal.deliverables.map((item, index) => (
                    <li key={index} className="flex items-center gap-2 text-gray-300">
                      <CheckCircle size={16} className="text-cyan-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
                <h4 className="text-cyan-400 font-semibold mb-3">Payment Breakdown:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-300">
                    <span>Project Budget:</span>
                    <span>${proposal.budget.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-orange-400">
                    <span>IndaSocial Commission (15%):</span>
                    <span>-${proposal.commission.toLocaleString()}</span>
                  </div>
                  <div className="h-px bg-cyan-500/30 my-2"></div>
                  <div className="flex justify-between text-white font-bold text-lg">
                    <span>Your Payout:</span>
                    <span>${proposal.creatorPayout.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleAcceptProposal}
                  className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all"
                >
                  Accept Proposal
                </button>
                <button
                  onClick={() => setShowProposal(false)}
                  className="flex-1 py-3 bg-gray-800 text-gray-300 font-bold rounded-xl hover:bg-gray-700 transition-all"
                >
                  Negotiate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-dark-light border-b border-cyan-500/20 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${brand.color} rounded-full flex items-center justify-center`}>
                <span className="text-white font-bold text-xl">{brand.logo}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-white font-bold text-lg">{brand.name}</h2>
                  {brand.verified && <CheckCircle size={16} className="text-cyan-400" />}
                </div>
                <p className="text-gray-400 text-sm">{brand.industry}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {projectStatus === 'accepted' ? (
                <div className="px-4 py-2 bg-green-500/20 border border-green-500 rounded-lg">
                  <span className="text-green-400 font-semibold text-sm">✓ Project Active</span>
                </div>
              ) : (
                <div className="px-4 py-2 bg-orange-500/20 border border-orange-500 rounded-lg">
                  <span className="text-orange-400 font-semibold text-sm">⏳ Negotiating</span>
                </div>
              )}
              
              <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                <FileText size={20} className="text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Match Info Banner */}
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-2xl p-6 text-center glow-purple">
            <h3 className="text-2xl font-bold text-white mb-2">It's a Match!</h3>
            <p className="text-cyan-400 font-semibold mb-4">
              Connect with {brand.name} on upcoming projects
            </p>
            <p className="text-gray-400 text-sm">
              Encuentra la colaboración perfecta. It's Match!
            </p>
          </div>

          {/* Info Protection Notice */}
          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Shield size={20} className="text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-cyan-400 font-semibold mb-1">Protected Communication</h4>
                <p className="text-gray-400 text-sm">
                  Contact information is protected until a project proposal is accepted. 
                  This ensures both parties are committed and IndaSocial can facilitate the collaboration.
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'creator' ? 'justify-end' : 'justify-start'} ${
                message.sender === 'system' ? 'justify-center' : ''
              }`}
            >
              {message.sender === 'system' ? (
                <div className="bg-green-500/20 border border-green-500/30 rounded-xl px-4 py-2 max-w-md">
                  <p className="text-green-400 text-sm text-center">{message.text}</p>
                </div>
              ) : (
                <div className={`flex items-end gap-2 max-w-md ${message.sender === 'creator' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.sender === 'brand' 
                      ? `bg-gradient-to-br ${brand.color}` 
                      : 'bg-gradient-to-br from-orange-500 to-pink-500'
                  }`}>
                    {message.sender === 'brand' ? (
                      <span className="text-white font-bold text-sm">{brand.logo}</span>
                    ) : (
                      <span className="text-lg">{creator.avatar}</span>
                    )}
                  </div>
                  
                  <div>
                    <div className={`rounded-2xl px-4 py-3 ${
                      message.sender === 'creator'
                        ? 'bg-cyan-500 text-white'
                        : 'bg-dark-light border border-gray-700 text-gray-300'
                    }`}>
                      <p className="text-sm">{filterMessage(message.text)}</p>
                    </div>
                    <span className="text-xs text-gray-500 mt-1 block">{message.time}</span>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Contact Info Locked Message */}
          {projectStatus !== 'accepted' && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Lock size={20} className="text-orange-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-orange-400 font-semibold mb-1">Contact Info Locked</h4>
                  <p className="text-gray-400 text-sm mb-2">
                    Email, phone, and social media handles are protected until a project proposal is accepted.
                  </p>
                  <button
                    onClick={() => setShowProposal(true)}
                    className="text-cyan-400 text-sm font-semibold hover:text-cyan-300 transition-colors"
                  >
                    View Current Proposal →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="border-t border-cyan-500/20 p-4 bg-dark-light">
          <div className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={projectStatus === 'accepted' ? 'Type a message...' : 'Messages are filtered for contact info...'}
              className="flex-1 px-4 py-3 bg-dark border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 transition-colors"
            />
            <button
              onClick={handleSendMessage}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all"
            >
              <Send size={20} />
            </button>
          </div>
          
          {projectStatus !== 'accepted' && (
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
              <AlertCircle size={14} />
              <span>Contact info (emails, phones, @handles) will be automatically blocked until project acceptance</span>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Creator Profile */}
      <div className="w-80 bg-dark-light border-l border-cyan-500/20 p-6">
        <div className="text-center mb-6">
          <div className="inline-block mb-3 px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-full">
            <span className="text-cyan-400 text-sm font-semibold">Creator</span>
          </div>
          
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-5xl">
              {creator.avatar}
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-4">{creator.name}</h2>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <div className="text-cyan-400 font-bold text-sm mb-1">Reach</div>
              <div className="text-white font-bold text-2xl">{creator.reach}</div>
              <div className="text-gray-400 text-xs">{creator.followers}</div>
            </div>
            <div>
              <div className="text-cyan-400 font-bold text-sm mb-1">Reach</div>
              <div className="text-white font-bold text-2xl">{creator.reach}</div>
              <div className="text-gray-400 text-xs">{creator.followers}</div>
            </div>
          </div>

          <div className="bg-dark border border-cyan-500/20 rounded-xl p-3 mb-4">
            <div className="text-gray-400 text-xs mb-1">Content style</div>
            <div className="text-white font-semibold text-sm">{creator.contentStyle}</div>
          </div>

          <button
            onClick={() => setShowProposal(true)}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all mb-3"
          >
            View Proposal
          </button>

          {projectStatus === 'accepted' && (
            <div className="bg-green-500/20 border border-green-500 rounded-xl p-3">
              <div className="flex items-center gap-2 text-green-400 text-sm font-semibold">
                <CheckCircle size={16} />
                Contact Info Unlocked
              </div>
            </div>
          )}
        </div>

        {/* Project Stats */}
        <div className="space-y-3">
          <h3 className="text-white font-bold text-sm mb-3">Project Details</h3>
          
          <div className="bg-dark border border-cyan-500/20 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={16} className="text-cyan-400" />
              <span className="text-gray-400 text-xs">Total Budget</span>
            </div>
            <div className="text-white font-bold text-xl">${proposal.budget.toLocaleString()}</div>
          </div>

          <div className="bg-dark border border-cyan-500/20 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-cyan-400" />
              <span className="text-gray-400 text-xs">Timeline</span>
            </div>
            <div className="text-white font-bold">{proposal.timeline}</div>
          </div>

          <div className="bg-dark border border-cyan-500/20 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle size={16} className="text-cyan-400" />
              <span className="text-gray-400 text-xs">Status</span>
            </div>
            <div className={`font-bold ${projectStatus === 'accepted' ? 'text-green-400' : 'text-orange-400'}`}>
              {projectStatus === 'accepted' ? 'Active' : 'Negotiating'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchChatDashboard;
