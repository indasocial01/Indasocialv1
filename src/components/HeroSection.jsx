import React from 'react';
import { ChevronRight, ArrowDown } from 'lucide-react';

const HeroSection = ({ onGetStarted }) => {
  return (
    <div className="pt-32 pb-24 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-purple-900/20 to-transparent"></div>
      
      <div className="max-w-5xl mx-auto text-center relative z-10">
        <div className="inline-block mb-6 px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-full">
          <span className="text-blue-300 text-sm font-semibold uppercase tracking-wide">
            Built on Internet Computer Protocol
          </span>
        </div>
        
        <h1 className="text-6xl md:text-7xl font-bold mb-6">
          <span className="text-white">The Web3 </span>
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Social Network
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
          Experience true ownership of your social identity and content.
          Connect with others in a decentralized environment powered by the Internet Computer.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-16">
          <button 
            onClick={onGetStarted}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-lg transition-all shadow-lg shadow-blue-600/50 flex items-center gap-2"
          >
            Join The Platform
            <ChevronRight size={20} />
          </button>
          <a 
            href="https://mileoon.notion.site/INDASOCIAL-WHITEPAPER-1a9855c74f39802aa398d9b1b8f0668e"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-semibold text-lg transition-all inline-block"
          >
            About INDA Token
          </a>
        </div>

        <div className="flex flex-col items-center gap-3">
          <span className="text-gray-400 text-sm">Scroll to explore</span>
          <div className="animate-bounce-slow">
            <ArrowDown className="text-gray-400" size={24} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
