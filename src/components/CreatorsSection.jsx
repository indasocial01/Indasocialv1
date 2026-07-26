import React, { useState } from 'react';

const CreatorsSection = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'Todos', icon: '🌟' },
    { id: 'sostenibilidad', name: 'Sostenibilidad', icon: '🌱', color: 'from-green-500 to-emerald-600' },
    { id: 'inclusion', name: 'Inclusión', icon: '🤝', color: 'from-orange-500 to-amber-600' },
    { id: 'moda', name: 'Moda', icon: '👗', color: 'from-pink-500 to-rose-600' },
    { id: 'innovacion', name: 'Innovación', icon: '💡', color: 'from-purple-500 to-indigo-600' }
  ];

  const featuredCreators = [
    {
      id: 1,
      name: 'FORUM GLI LATAM',
      category: 'Sostenibilidad',
      image: 'https://indasocial.com/INDA/wp-content/uploads/2025/06/04-2.png',
      gradient: 'from-teal-500 to-emerald-600'
    },
    {
      id: 2,
      name: 'DECIDIDAS',
      category: 'Inclusión',
      image: 'https://indasocial.com/INDA/wp-content/uploads/2026/03/88A1179.jpg',
      gradient: 'from-purple-500 to-pink-600'
    },
    {
      id: 3,
      name: 'VOGUE LEADERS',
      category: 'Moda',
      image: 'https://indasocial.com/INDA/wp-content/uploads/2025/09/31.png',
      gradient: 'from-pink-500 to-rose-600',
      featured: true
    },
    {
      id: 4,
      name: 'ETHEREUM MÉXICO',
      category: 'Innovación',
      image: 'https://indasocial.com/INDA/wp-content/uploads/2025/11/07.png',
      gradient: 'from-cyan-500 to-blue-600'
    },
    {
      id: 5,
      name: 'MOLA REGIONAL',
      category: 'Sostenibilidad',
      image: 'https://indasocial.com/INDA/wp-content/uploads/2019/09/69282101_974335122910260_1121046284560498688_o.jpg',
      gradient: 'from-emerald-500 to-teal-600'
    }
  ];

  return (
    <div id="features" className="py-20 px-6 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto text-center">
        <div className="inline-block mb-6 px-4 py-2 bg-purple-600/20 border border-purple-500/30 rounded-full">
          <span className="text-purple-300 text-sm font-semibold">✨ Bienvenido a IndaSocial</span>
        </div>
        
        <h2 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
          Conecta
        </h2>
        
        <p className="text-2xl text-gray-300 mb-12 max-w-2xl mx-auto">
          Donde creadores y marcas se encuentran
        </p>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-6 py-3 rounded-full font-semibold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50'
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
              }`}
            >
              <span className="mr-2">{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>

        {/* Featured Creators */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {featuredCreators.map((creator) => (
            <div
              key={creator.id}
              className={`relative group cursor-pointer ${
                creator.featured ? 'md:col-span-1 transform md:-translate-y-4' : ''
              }`}
            >
              <div
                className={`relative rounded-2xl overflow-hidden ${
                  creator.featured ? 'h-80' : 'h-64'
                } transition-transform group-hover:scale-105`}
              >
                <img
                  src={creator.image}
                  alt={creator.name}
                  className="w-full h-full object-cover"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${creator.gradient} opacity-60`}></div>
                
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h3 className="font-bold text-lg mb-1">{creator.name}</h3>
                  <p className="text-sm opacity-90">{creator.category}</p>
                </div>

                {creator.featured && (
                  <div className="absolute top-4 right-4 bg-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    DESTACADO
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CreatorsSection;
