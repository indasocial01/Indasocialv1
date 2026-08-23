import React, { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';

const makeBubble = (id) => ({
  id,
  left: Math.random() * 100,
  size: 8 + Math.random() * 20,
  duration: 6 + Math.random() * 5,
  delay: Math.random() * -10,
  drift: `${Math.random() * 40 - 20}px`,
  opacity: 0.25 + Math.random() * 0.3,
});

const TokenSection = () => {
  const [burstBubbles, setBurstBubbles] = useState([]);
  const [driftBubbles, setDriftBubbles] = useState([]);

  useEffect(() => {
    const spawnBurst = () => {
      setBurstBubbles(
        Array.from({ length: 55 }, (_, i) => ({
          id: `burst-${Date.now()}-${i}`,
          left: Math.random() * 100,
          size: 8 + Math.random() * 20,
          delay: Math.random() * 0.6,
          drift: `${Math.random() * 40 - 20}px`,
          opacity: 0.25 + Math.random() * 0.3,
        }))
      );
    };

    spawnBurst();
    const burstInterval = setInterval(spawnBurst, 7000);

    const driftTimer = setTimeout(() => {
      setDriftBubbles(Array.from({ length: 10 }, (_, i) => makeBubble(`drift-${i}`)));
    }, 3000);

    return () => {
      clearInterval(burstInterval);
      clearTimeout(driftTimer);
    };
  }, []);

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
    <div id="token" className="relative overflow-hidden py-20 px-6 bg-gradient-to-br from-[#140f2e] via-[#1e1440] to-[#2a123f]">
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
        {burstBubbles.map((b) => (
          <span
            key={b.id}
            className="animate-bubble-rise absolute bottom-0 rounded-full border border-blue-300/30 bg-blue-400/20"
            style={{
              left: `${b.left}%`,
              width: b.size,
              height: b.size,
              animationDuration: '3s',
              animationDelay: `${b.delay}s`,
              '--drift': b.drift,
              '--bubble-opacity': b.opacity,
            }}
          />
        ))}
        {driftBubbles.map((b) => (
          <span
            key={b.id}
            className="animate-bubble-loop absolute bottom-0 rounded-full border border-blue-300/30 bg-blue-400/20"
            style={{
              left: `${b.left}%`,
              width: b.size,
              height: b.size,
              animationDuration: `${b.duration}s`,
              animationDelay: `${b.delay}s`,
              '--drift': b.drift,
              '--bubble-opacity': b.opacity,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            

            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Powering the{' '}
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                NEW INDASOCIAL WEB3
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
                  className="flex gap-4 items-start p-4 bg-purple-500/10 rounded-xl border border-purple-400/20 hover:bg-purple-500/15 hover:border-blue-400/30 transition-all"
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
              <div className="relative w-80 h-80 bg-gradient-to-br from-[#2a1f55] to-[#150c30] rounded-full border-4 border-blue-400/60 flex items-center justify-center">
                <span className="text-7xl font-bold text-white">INDA</span>
              </div>
              <div className="absolute top-0 right-0 px-4 py-2 bg-[#241a4d] border border-blue-400/50 rounded-full shadow-lg shadow-purple-900/30">
                <span className="text-blue-300 text-sm font-semibold flex items-center gap-2">
                  ⚡ Fast & Scalable
                </span>
              </div>
              <div className="absolute bottom-0 left-0 px-4 py-2 bg-[#241a4d] border border-purple-400/50 rounded-full shadow-lg shadow-purple-900/30">
                <span className="text-purple-300 text-sm font-semibold flex items-center gap-2">
                  🔐 Built on Solana
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