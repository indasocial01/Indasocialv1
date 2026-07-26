import React from 'react';
import { X } from 'lucide-react';

const WalletModal = ({ isOpen, onClose, onSelect }) => {
  if (!isOpen) return null;

  const handleSelect = (provider) => {
    if (onSelect) {
      onSelect(provider);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 max-w-md w-full mx-4 border border-white/10 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-white">Elige un Proveedor de Identidad</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="space-y-3">
          <button 
            onClick={() => handleSelect('internet-identity')}
            className="w-full p-4 bg-white hover:bg-gray-100 rounded-xl flex items-center gap-4 transition-all group"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🔐</span>
            </div>
            <div className="text-left">
              <div className="font-semibold text-gray-900">Internet Identity</div>
              <div className="text-sm text-gray-600">Autenticación descentralizada</div>
            </div>
          </button>

          <button 
            onClick={() => handleSelect('google')}
            className="w-full p-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl flex items-center gap-4 transition-all text-white"
          >
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl font-bold">G</span>
            </div>
            <div className="text-left">
              <div className="font-semibold">Google</div>
              <div className="text-sm text-white/80">Conectar con Google</div>
            </div>
          </button>

          <button 
            onClick={() => handleSelect('plug')}
            className="w-full p-4 bg-slate-700 hover:bg-slate-600 rounded-xl flex items-center gap-4 transition-all text-white"
          >
            <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🔌</span>
            </div>
            <div className="text-left">
              <div className="font-semibold">Plug Wallet</div>
              <div className="text-sm text-white/80">Wallet de Internet Computer</div>
            </div>
          </button>

          {/* Demo Login Option */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-800 text-gray-400">O prueba la demo</span>
            </div>
          </div>

          <button 
            onClick={() => handleSelect('demo')}
            className="w-full p-4 bg-cyan-600 hover:bg-cyan-700 rounded-xl flex items-center gap-4 transition-all text-white"
          >
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🎭</span>
            </div>
            <div className="text-left">
              <div className="font-semibold">Demo Login</div>
              <div className="text-sm text-white/80">Acceso rápido con usuarios de prueba</div>
            </div>
          </button>
        </div>

        <p className="text-center text-gray-400 text-sm mt-6">
          Al conectarte, aceptas nuestros términos de servicio
        </p>
      </div>
    </div>
  );
};

export default WalletModal;
