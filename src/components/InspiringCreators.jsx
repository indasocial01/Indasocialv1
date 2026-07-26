import React from 'react';

const InspiringCreators = () => {
  const categories = [
    { id: 'sostenibilidad', name: 'Sostenibilidad', icon: '🌱', color: 'from-green-500 to-emerald-600' },
    { id: 'inclusion', name: 'Inclusión', icon: '🤝', color: 'from-orange-500 to-amber-600' },
    { id: 'moda', name: 'Moda', icon: '👗', color: 'from-pink-500 to-rose-600' },
    { id: 'innovacion', name: 'Innovación', icon: '💡', color: 'from-purple-500 to-indigo-600' }
  ];

  const inspiringCreators = [
    {
      id: 6,
      name: 'LATINO GASTRONOMIC',
      role: 'Reuniendo tradición y vanguardia en el corazón de Puebla.',
      category: 'Sostenibilidad',
      description: 'Un encuentro donde tradición y vanguardia se dieron la mano para mostrar que la cocina mexicana e iberoamericana no solo alimenta, sino que inspira y conecta culturas.',
      image: 'https://indasocial.com/INDA/wp-content/uploads/2025/10/Captura-de-pantalla-2025-09-08-a-las-4.18.57%E2%80%AFp.m.png',
      gradient: 'from-purple-600 to-blue-700'
    },
    {
      id: 7,
      name: 'AWS COMMUNITY DAY',
      role: 'Inteligencia Artificial, Inclusión y Comunidad.',
      category: 'Inclusión',
      description: 'AWS Community Day México 2025. Es un evento que conecta la comunidad con la innovación a nivel global.',
      image: 'https://indasocial.com/INDA/wp-content/uploads/2025/07/9.png',
      gradient: 'from-teal-600 to-cyan-700'
    },
    {
      id: 8,
      name: 'FORCES OF FASHION',
      role: 'Diálogos sobre la autenticidad y el valor propio, en Soho House México.',
      category: 'Moda',
      description: 'Más que una simple revisión de tendencias, la jornada se transformó en un foro esencial para el diálogo.',
      image: 'https://indasocial.com/INDA/wp-content/uploads/2025/10/05.png',
      gradient: 'from-rose-600 to-pink-700'
    }
  ];

  return (
    <div className="py-20 px-6 bg-black/30">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-5xl font-bold text-center mb-4 text-white">
          CREADORES & MARCAS<br />QUE INSPIRAN
        </h2>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`px-6 py-2 rounded-full font-semibold bg-gradient-to-r ${cat.color} text-white hover:shadow-lg transition-all`}
            >
              <span className="mr-2">{cat.icon}</span>
              {cat.name.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {inspiringCreators.map((creator) => (
            <div key={creator.id} className="group cursor-pointer">
              <div className={`relative rounded-2xl overflow-hidden h-96 bg-gradient-to-br ${creator.gradient} p-1`}>
                <div className="relative h-full rounded-xl overflow-hidden">
                  <img
                    src={creator.image}
                    alt={creator.name}
                    className="w-full h-2/3 object-cover"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="font-bold text-xl mb-1">{creator.name}</h3>
                    <p className="text-sm text-white mb-3">{creator.role}</p>
                    <p className="text-sm mb-4 line-clamp-2">{creator.description}</p>
                    
                    <button className="px-6 py-2 border-2 border-white rounded-full text-sm font-semibold hover:bg-white hover:text-black transition-all">
                      VER PERFIL
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InspiringCreators;
