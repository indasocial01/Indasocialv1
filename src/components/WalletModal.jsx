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

        </div>

        <p className="text-center text-gray-400 text-sm mt-6">
          Al conectarte, aceptas nuestros términos de servicio
        </p>
      </div>
    </div>
  );
};

export default WalletModal;
