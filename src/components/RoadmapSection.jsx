import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle, TrendingUp, Circle } from 'lucide-react';

const RoadmapSection = () => {
  const [visibleItems, setVisibleItems] = useState({});
  const itemRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.dataset.index);
            setVisibleItems((prev) => ({ ...prev, [idx]: true }));
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
    );

    itemRefs.current.forEach((el) => el && observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const roadmapItems = [
    {
      year: '2025',
      title: 'Foundation & Launch',
      items: [
        'Connecting communities on Web3',
        'Events and partnerships',
        'More sponsorships',
        '#1 place Solana protocol via METAPOOL',
        'Smart contract launch on Solana',
      ],
      status: 'completed',
      color: 'green'
    },
    {
      year: '2026',
      title: 'Growth & Expansion',
      items: [
        'Launching MVP',
        'Adoption expansion',
        'Staking system',
        'Holder growth',
        'Test Market launch'
      ],
      status: 'in-progress',
      color: 'cyan'
    },
    {
      year: '2027',
      title: 'Global Scale',
      items: [
        'Full platform deployment',
        'International expansion',
        'Advanced features',
        'Ecosystem partnerships'
      ],
      status: 'upcoming',
      color: 'purple'
    }
  ];

  return (
    <div id="roadmap" className="py-20 px-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
      
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-white">Project </span>
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Roadmap
            </span>
          </h2>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto">
            Building the future of Web3 social networking, one milestone at a time
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-500 via-cyan-500 to-purple-500 opacity-50"></div>

          {/* Roadmap Items */}
          <div className="space-y-0">
            {roadmapItems.map((item, index) => (
              <div key={item.year} className="relative">
                {/* Circle on Timeline */}
                <div className="absolute left-1/2 transform -translate-x-1/2 z-10" style={{ top: '120px' }}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 ${
                    item.status === 'completed' ? 'bg-green-500 border-slate-900' :
                    item.status === 'in-progress' ? 'bg-cyan-500 border-slate-900' :
                    'bg-purple-500 border-slate-900'
                  }`}>
                    {item.status === 'completed' ? (
                      <CheckCircle size={24} className="text-white" />
                    ) : item.status === 'in-progress' ? (
                      <TrendingUp size={24} className="text-white" />
                    ) : (
                      <Circle size={24} className="text-white" />
                    )}
                  </div>
                </div>

                {/* Content Card */}
                <div className={`flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'} mb-8`}>
                  <div className={`w-full md:w-5/12 ${index % 2 === 0 ? 'md:pr-20' : 'md:pl-20'}`}>
                    <div
                      ref={(el) => (itemRefs.current[index] = el)}
                      data-index={index}
                      className={`bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border-2 ${
                      item.status === 'completed' ? 'border-green-500/30' :
                      item.status === 'in-progress' ? 'border-cyan-500/30' :
                      'border-purple-500/30'
                    } hover:scale-105 transition-all duration-700 ease-out ${
                      visibleItems[index] ? 'opacity-100 translate-y-0 animate-card-loop' : 'opacity-0 translate-y-10'
                    }`}>
                      {/* Year Badge */}
                      <div className={`inline-block px-4 py-1 rounded-full mb-4 font-bold text-white ${
                        item.status === 'completed' ? 'bg-green-500' :
                        item.status === 'in-progress' ? 'bg-cyan-500' :
                        'bg-purple-500'
                      }`}>
                        {item.year}
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-white mb-4">{item.title}</h3>

                      {/* Items List */}
                      <div className="space-y-2">
                        {item.items.map((milestone, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <span className={`text-sm mt-0.5 ${
                              item.status === 'completed' ? 'text-green-400' :
                              item.status === 'in-progress' ? 'text-cyan-400' :
                              'text-purple-400'
                            }`}>
                              {item.status === 'completed' ? '✓' : '•'}
                            </span>
                            <span className="text-gray-300 text-sm">{milestone}</span>
                          </div>
                        ))}
                      </div>

                      {/* Status Badge */}
                      {item.status === 'in-progress' && (
                        <div className="mt-4 pt-4 border-t border-slate-700">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                            <span className="text-cyan-400 text-sm font-semibold">Currently in progress</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapSection;