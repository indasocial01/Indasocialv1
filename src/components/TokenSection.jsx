import React from 'react';
import { ChevronRight } from 'lucide-react';

const TokenSection = () => {
  const tokenFeatures = [
    {
      title: 'Decentralized Identity',
      description: 'Create your Web3 ID and truly own your social data'
    },
    {
      title: 'Value Capture',
      description: 'Value is distributed back to users who create and engage with content'
    },
    {
      title: 'Governance Rights',
      description: 'Token holders determine the future development of the platform'
    }
  ];

  return (
    <div id="token" className="py-20 px-6 bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block mb-6 px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-full">
              <span className="text-blue-300 text-sm font-semibold">INDA Token</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Powering the{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Web3 Social Platform
              </span>
            </h2>

            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
              INDA token is the native currency of the Indasocial platform, enabling new
              forms of monetization and ownership for creators, while providing a new
              decentralized social experience to users.
            </p>

            <div className="space-y-4 mb-8">
              {tokenFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="flex gap-4 items-start p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all"
                >
                  <div className="text-blue-400 text-xl mt-1">
                    <ChevronRight size={20} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
                    <p className="text-gray-400 text-sm">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <a 
              href="https://mileoon.notion.site/INDASOCIAL-WHITEPAPER-1a9855c74f39802aa398d9b1b8f0668e"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-lg flex items-center gap-2 inline-flex"
            >
              Explore Tokenomics
              <ChevronRight size={20} />
            </a>
          </div>

          <div className="flex justify-center items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-3xl opacity-30 animate-pulse"></div>
              <div className="relative w-80 h-80 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full border-4 border-blue-500/50 flex items-center justify-center">
                <span className="text-7xl font-bold text-white">INDA</span>
              </div>
              <div className="absolute top-0 right-0 px-4 py-2 bg-slate-800 border border-blue-500/50 rounded-full">
                <span className="text-blue-400 text-sm font-semibold flex items-center gap-2">
                  ⚡ Fast & Scalable
                </span>
              </div>
              <div className="absolute bottom-0 left-0 px-4 py-2 bg-slate-800 border border-blue-500/50 rounded-full">
                <span className="text-blue-400 text-sm font-semibold flex items-center gap-2">
                  🔐 Built on ICP
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenSection;
