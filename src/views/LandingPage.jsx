import React, { useState } from 'react';
import HeroSection from '../components/HeroSection';
import TokenSection from '../components/TokenSection';
import CreatorsSection from '../components/CreatorsSection';
import InspiringCreators from '../components/InspiringCreators';
import RoadmapSection from '../components/RoadmapSection';
import CommunitySection from '../components/CommunitySection';
import Footer from '../components/Footer';
import WalletModal from '../components/WalletModal';

const LandingPage = ({ onConnect, onBlogClick }) => {
  const [showWalletModal, setShowWalletModal] = useState(false);

  const handleWalletClick = () => {
    setShowWalletModal(true);
  };

  const handleWalletClose = () => {
    setShowWalletModal(false);
  };

  const handleWalletSelect = (provider) => {
    setShowWalletModal(false);
    onConnect(); // Go to login page
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <nav className="fixed top-0 w-full z-40 bg-slate-900/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                </svg>
              </div>
              <span className="text-white font-bold text-xl">Indasocial</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors cursor-pointer">Features</a>
              <a href="#token" className="text-gray-300 hover:text-white transition-colors cursor-pointer">Token</a>
              <a href="#roadmap" className="text-gray-300 hover:text-white transition-colors cursor-pointer">Roadmap</a>
              <a href="#community" className="text-gray-300 hover:text-white transition-colors cursor-pointer">Community</a>
              <button onClick={onBlogClick} className="text-gray-300 hover:text-white transition-colors">Blog</button>
            </div>

            <button
              onClick={handleWalletClick}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              Connect
            </button>
          </div>
        </div>
      </nav>

      <WalletModal 
        isOpen={showWalletModal} 
        onClose={handleWalletClose}
        onSelect={handleWalletSelect}
      />
      
      <HeroSection onGetStarted={handleWalletClick} />
      <TokenSection />
      <CreatorsSection />
      <InspiringCreators />
      <RoadmapSection />
      <CommunitySection onJoinClick={handleWalletClick} />
      <Footer />
    </div>
  );
};

export default LandingPage;
