"use client";
import React, { useState } from 'react';
import { Globe, ArrowRight, UserPlus, LogIn } from 'lucide-react';

const Login = ({ onGoogleLogin, isGoogleLoading = false, googleError = '' }) => {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'

  const handleGoogleClick = () => {
    // Le pasamos la intención (login o register)
    onGoogleLogin(activeTab);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/20">
            <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">IndaSocial</h1>
          <p className="text-gray-400">Connect Creators & Brands</p>
        </div>

        {/* Tarjeta Principal */}
        <div className="bg-dark-light border border-cyan-500/20 rounded-3xl p-8 space-y-6">
          
          {/* Tabs Selector: Iniciar Sesión vs Registrarse */}
          <div className="flex bg-gray-900/80 p-1 rounded-xl border border-gray-800">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'login'
                  ? 'bg-cyan-500 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <LogIn size={16} />
              Iniciar Sesión
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'register'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <UserPlus size={16} />
              Registrarse
            </button>
          </div>

          {/* Encabezado según la pestaña activa */}
          <div className="text-center pt-2">
            <h2 className="text-white text-xl font-bold mb-1">
              {activeTab === 'login' ? '¡Hola de nuevo!' : 'Crea tu cuenta'}
            </h2>
            <p className="text-gray-400 text-xs">
              {activeTab === 'login'
                ? 'Ingresa con tu cuenta de Google para ir a tu Dashboard'
                : 'Usa tu cuenta de Google para comenzar la configuración'}
            </p>
          </div>

          {/* Botón de Google Adaptado */}
          <button
            onClick={handleGoogleClick}
            disabled={isGoogleLoading}
            className={`w-full py-4 text-black rounded-xl font-bold flex items-center justify-center gap-3 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg ${
              activeTab === 'login'
                ? 'bg-white hover:bg-gray-100 shadow-cyan-500/10'
                : 'bg-white hover:bg-gray-100 shadow-purple-500/10'
            }`}
          >
            {isGoogleLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                Conectando...
              </>
            ) : (
              <>
                <Globe size={20} className={activeTab === 'login' ? 'text-blue-600' : 'text-purple-600'} />
                {activeTab === 'login' ? 'Iniciar Sesión con Google' : 'Registrarse con Google'}
                <ArrowRight size={18} className="text-gray-500 ml-auto" />
              </>
            )}
          </button>

          {/* Mensaje de Error si aplica */}
          {googleError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-xs text-red-400 text-center font-medium">{googleError}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-xs mt-6">
          Al continuar, aceptas nuestros Términos y Política de Privacidad
        </p>
      </div>
    </div>
  );
};

export default Login;