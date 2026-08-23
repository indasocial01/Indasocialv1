import React, { useEffect, useState } from 'react';
import HeroSection from '../components/HeroSection';
import TokenSection from '../components/TokenSection';
import CreatorsSection from '../components/CreatorsSection';
import InspiringCreators from '../components/InspiringCreators';
import VideoSection from '../components/VideoSection';
import RoadmapSection from '../components/RoadmapSection';
import CommunitySection from '../components/CommunitySection';
import UsSection from '../components/UsSection';
import Footer from '../components/Footer';
import WalletModal from '../components/WalletModal';

const NAV_BORDER_COLORS = {
  hero: 'border-blue-400/70',
  token: 'border-purple-400/70',
  features: 'border-pink-400/70',
  creators: 'border-blue-400/70',
  roadmap: 'border-purple-400/70',
  community: 'border-pink-400/70',
  nosotros: 'border-blue-400/70',
};

const LandingPage = ({ onConnect, onBlogClick }) => {
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const sectionIds = Object.keys(NAV_BORDER_COLORS);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-96px 0px -70% 0px', threshold: 0 }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

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
      <nav className={`fixed top-0 w-full z-40 bg-slate-900/80 backdrop-blur-md border-b-4 transition-colors duration-700 ${NAV_BORDER_COLORS[activeSection] || 'border-white/10'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center overflow-hidden">
                <img src="/images/logoS.png" alt="Indasocial" className="w-11 h-11 object-contain" />
              </div>
              <span className="text-white font-bold text-xl">Indasocial</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#" className="text-gray-300 hover:text-white transition-colors cursor-pointer">Home</a>
              <a href="#token" className="text-gray-300 hover:text-white transition-colors cursor-pointer">Token</a>
              <a href="#roadmap" className="text-gray-300 hover:text-white transition-colors cursor-pointer">Roadmap</a>
              <a href="#community" className="text-gray-300 hover:text-white transition-colors cursor-pointer">Community</a>
              <button onClick={onBlogClick} className="text-gray-300 hover:text-white transition-colors">Blog</button>
              <a href="#nosotros" className="text-gray-300 hover:text-white transition-colors cursor-pointer">Nosotros</a>
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
      
      <div id="hero">
        <HeroSection onGetStarted={handleWalletClick} />
      </div>
      <TokenSection />
      <CreatorsSection />
      <div id="creators">
        <InspiringCreators />
      </div>
      <VideoSection />
      <RoadmapSection />
      <CommunitySection onJoinClick={handleWalletClick} />
      <UsSection />
      <Footer />
    </div>
  );
};

export default LandingPage;