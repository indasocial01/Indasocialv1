import React from 'react';
import { Playfair_Display, Poppins } from 'next/font/google';
import { User, ArrowRight } from 'lucide-react';

const playfair = Playfair_Display({ subsets: ['latin'], weight: ['600', '700'] });
const poppins = Poppins({ subsets: ['latin'], weight: ['700', '800'] });

const teamAvatars = [
  { id: 1, image: '/images/alan.jpeg', name: 'Alan Perez', social: '@alanperez_2', border: 'border-blue-500/70' },
  { id: 2, image: '/images/mir.jpg', name: 'Miriam', social: '@mileoon', border: 'border-purple-500/70' },
  { id: 3, image: '/images/bee.jpeg', name: 'CowBee', social: '@leen_bee19', border: 'border-pink-500/70' },
  { id: 4, image: '/images/elvia.jpeg', name: 'Elvia', social: '@elvia_gomez', border: 'border-pink-500/70' },

];

const UsSection = () => {
  return (
    <div id="nosotros" className="relative overflow-hidden py-24 px-6 mx-4 md:mx-10 my-10 rounded-3xl border-2 border-[#2c1e5c]/15 bg-gradient-to-br from-[#D9D9D9] to-[#E59EDD]">
      <span className="pointer-events-none select-none absolute -top-16 left-2 md:left-10 text-[220px] md:text-[320px] leading-none font-serif text-[#2c1e5c]/10">
        &ldquo;
      </span>

      <div className="relative z-10 max-w-6xl mx-auto grid md:grid-cols-[auto_1fr] gap-12 items-start">
        {/* Team avatars, stacked one above the other */}
        <div className="flex md:flex-col items-center gap-8 mx-auto md:mx-0">
          {teamAvatars.map((person) => (
            <div key={person.id} className="flex flex-col items-center">
              <div
                className={`w-36 h-36 md:w-44 md:h-44 rounded-full overflow-hidden border-4 ${person.border} shadow-lg shadow-black/10 bg-white/70 flex items-center justify-center shrink-0`}
              >
                {person.image ? (
                  <img src={person.image} alt={person.name} className="w-full h-full object-cover" />
                ) : (
                  <User size={52} className="text-[#2c1e5c]/30" />
                )}
              </div>
              <p className={`${poppins.className} text-[#241a52] text-lg mt-3 text-center`}>{person.name}</p>
              <p className={`${poppins.className} text-blue-700 text-sm text-center`}>{person.social}</p>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="text-left">
          <div className="inline-block mb-4 px-4 py-2 bg-blue-600/10 border border-blue-500/25 rounded-full">
            <span className="text-blue-700 text-sm font-semibold">Indasocial</span>
          </div>

          <h2 className={`${playfair.className} text-5xl md:text-6xl mb-8 leading-tight bg-gradient-to-r from-[#241a52] via-[#4a2f8a] to-[#7c3f8f] bg-clip-text text-transparent`}>
            Quiénes somos
          </h2>

          <p className="text-gray-700 text-lg leading-relaxed mb-10">
            Indasocial nació en 2010 en México conectando creadores y marcas emergentes en moda,
            sostenibilidad, inclusión e innovación. En 2019 nos establecimos como plataforma de
            medios de comunicación y prensa. Hoy en 2026 somos un marketplace descentralizado que
            lleva esta experiencia, aprendizaje y misión al siguiente nivel.
          </p>

          <div className="space-y-6 mb-10">
            <div>
              <h3 className="text-blue-700 font-bold uppercase tracking-wide text-2xl mb-2">Misión</h3>
              <div className="bg-white/60 backdrop-blur-sm border border-blue-400/30 rounded-xl p-4">
                <p className="text-gray-700 leading-relaxed">
                  Conectar con creadores y marcas de Latinoamérica en un espacio confiable, directo y
                  sin fricciones, para que las colaboraciones con propósito sucedan más rápido.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-purple-700 font-bold uppercase tracking-wide text-2xl mb-2">Visión</h3>
              <div className="bg-white/60 backdrop-blur-sm border border-purple-400/30 rounded-xl p-4">
                <p className="text-gray-700 leading-relaxed">
                  Ser el marketplace de referencia en LATAM para colaboraciones entre creadores y
                  marcas, impulsando una economía creativa más justa, transparente y descentralizada.
                  Somos una plataforma local con visión global (de México a LATAM).
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-pink-700 font-bold uppercase tracking-wide text-2xl mb-2">Objetivo de INDAToken</h3>
              <div className="bg-white/60 backdrop-blur-sm border border-pink-400/30 rounded-xl p-4">
                <p className="text-gray-700 leading-relaxed mb-3">
                  Que cada colaboración exitosa en la plataforma genere valor real para quienes la
                  hacen posible — creadores y marcas — a través de un sistema de recompensas
                  transparente en Solana.
                </p>
                <a
                  href="https://mileoon.notion.site/INDASOCIAL-WHITEPAPER-1a9855c74f39802aa398d9b1b8f0668e"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-700 font-semibold hover:text-blue-900 transition-colors"
                >
                  Conoce el whitepaper
                  <ArrowRight size={16} />
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-[#241a52] font-bold uppercase tracking-wide text-2xl mb-2">Equipo</h3>
              <p className="text-gray-700 leading-relaxed">
                Un equipo mexicano trabajando con pasión para construir el marketplace que la
                economía creativa de LatAm necesita.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <span className="px-4 py-2 rounded-full border border-blue-400/30 bg-white/60 text-[#241a52] text-sm font-medium">
              🇲🇽 Hecho en México, pensado para LATAM
            </span>
            <span className="px-4 py-2 rounded-full border border-purple-400/30 bg-white/60 text-[#241a52] text-sm font-medium">
              ✨ Talento local con ambición global ✨
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsSection;