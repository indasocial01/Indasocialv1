import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-black/50 border-t border-white/10 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">I</span>
              </div>
              <span className="text-white font-bold text-xl">IndaSocial</span>
            </div>
            <p className="text-gray-400 text-sm">
              Conectando Creadores y Marcas.<br />
              Construyendo el futuro creativo.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>Para Creadores</li>
              <li>Para Marcas</li>
              {/*<li><a href="#" className="hover:text-white transition-colors">Cómo funciona</a></li>
              dejar link en el youtube o del devnet del demo day para no hacer unp nuevo*/}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Recursos</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="https://indasocial.com/" className="hover:text-white transition-colors">Blog INDA</a></li>
              <li>Comunidad</li>
              <li>Soporte 1 221 236 7049</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="https://mileoon.notion.site/INDASOCIAL-WHITEPAPER-1a9855c74f39802aa398d9b1b8f0668e" className="hover:text-white transition-colors">Whitepaper</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Términos</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Cookies</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            Copyrigth © 2024 IndaSocial. Hecho en México 🇲🇽
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Twitter Indasocial_mx</a>
            <a href="https://www.instagram.com/indasocial_mx?igsh=NXl1a3J4OWgwYTBx" className="text-gray-400 hover:text-white transition-colors">Instagram Indasocial_mx</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">LinkedIn Indasocial_mx</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;