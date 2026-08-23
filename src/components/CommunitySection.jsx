import React from 'react';
import { Anton } from 'next/font/google';
import { Users, Award, TrendingUp, Globe, ChevronRight } from 'lucide-react';

const anton = Anton({ subsets: ['latin'], weight: '400' });

const CommunitySection = ({ onJoinClick }) => {
  const communityStats = [
    { icon: <Users size={32} />, value: '300+', label: 'Community Members' },
    { icon: <Award size={32} />, value: '15+', label: 'Partners' },
    { icon: <TrendingUp size={32} />, value: '$25K+', label: 'Developing Funding' },
    { icon: <Globe size={32} />, value: '4+', label: 'Countries Represented' }
  ];

  return (
    <div id="community" className="py-24 px-6 bg-gradient-to-br from-[#221a52] via-[#432c82] to-[#6a4a95]">
      <div className="max-w-6xl mx-auto text-center">
        <div className="inline-block mb-6 px-4 py-2 bg-white/10 border border-white/25 rounded-full backdrop-blur-sm">
          <span className="text-white text-sm font-semibold">Explora el marketplace</span>
        </div>

        <h2 className={`${anton.className} text-5xl md:text-6xl mb-6 text-white underline decoration-white decoration-4 underline-offset-8`}>
          Forma parte de la{' '}
          <span className="bg-gradient-to-r from-blue-200 to-pink-200 bg-clip-text text-transparent decoration-blue-200">
            Revolución
          </span>
        </h2>

        <p className="text-xl text-white/80 mb-10 max-w-3xl mx-auto">
          IndaToken es la capa de incentivos de Indasocial: recompensa la colaboración entre creadores y marcas dentro del marketplace.
          No es la plataforma — es el impulso extra para quienes ya están creando juntos.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-16">
          <button
            onClick={onJoinClick}
            className="px-8 py-4 bg-white hover:bg-gray-100 text-[#4a3c9a] rounded-xl font-semibold text-lg transition-all shadow-lg flex items-center gap-2"
          >
            Join The Platform
            <ChevronRight size={20} />
          </button>
          <a
            href="https://x.com/indasocial_mx"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 bg-white/10 hover:bg-white/20 border-2 border-white/30 text-white rounded-xl font-semibold text-lg transition-all inline-block backdrop-blur-sm"
          >
            Follow us on X
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {communityStats.map((stat, index) => (
            <div key={index} className="bg-white/10 border border-white/15 rounded-2xl p-8 shadow-lg backdrop-blur-sm hover:bg-white/15 transition-all">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/15 rounded-full mb-4 text-white">
                {stat.icon}
              </div>
              <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-white/70 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommunitySection;
