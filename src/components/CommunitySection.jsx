import React from 'react';
import { Users, Award, TrendingUp, Globe, ChevronRight } from 'lucide-react';

const CommunitySection = ({ onJoinClick }) => {
  const communityStats = [
    { icon: <Users size={32} />, value: '300+', label: 'Community Members' },
    { icon: <Award size={32} />, value: '15+', label: 'Partners' },
    { icon: <TrendingUp size={32} />, value: '$25K+', label: 'Developing Funding' },
    { icon: <Globe size={32} />, value: '4+', label: 'Countries Represented' }
  ];

  return (
    <div id="community" className="py-24 px-6 bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="max-w-6xl mx-auto text-center">
        <div className="inline-block mb-6 px-4 py-2 bg-blue-600/10 border border-blue-500/20 rounded-full">
          <span className="text-blue-600 text-sm font-semibold">Join Our Community</span>
        </div>

        <h2 className="text-5xl md:text-6xl font-bold mb-6">
          Be Part of the{' '}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Revolution
          </span>
        </h2>

        <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
          Join thousands of creators, brands, developers, and internet enthusiasts 
          building the future of decentralized media on Blockchain.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-16">
          <button 
            onClick={onJoinClick}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-lg transition-all shadow-lg flex items-center gap-2"
          >
            Join The Platform
            <ChevronRight size={20} />
          </button>
          <a
            href="https://x.com/indasocial_mx"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 bg-white hover:bg-gray-50 border-2 border-gray-300 text-gray-900 rounded-xl font-semibold text-lg transition-all inline-block"
          >
            Follow us on X
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {communityStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4 text-blue-600">
                {stat.icon}
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommunitySection;
