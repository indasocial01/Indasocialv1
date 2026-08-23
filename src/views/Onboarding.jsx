"use client";
import React, { useState } from 'react';
import { User, Briefcase, MessageCircle, Calendar, TrendingUp, ChevronRight, CheckCircle, X, FileText } from 'lucide-react';

const Onboarding = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Paso 1: El usuario selecciona su rol
  const handleSelect = (type) => {
    setUserType(type);
    setStep(2);
  };

  // Paso 3: Finalizar y guardar en Supabase
  const handleFinish = async () => {
    if (!acceptedTerms) {
      alert("Debes aceptar los Términos y Condiciones y el Aviso de Privacidad para continuar.");
      return;
    }
    setIsSaving(true);
    await onComplete(userType);
  };

  // Step 1: Choose user type
  if (step === 1) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-12">
            <div className="inline-block mb-6 px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 rounded-full">
              <span className="text-cyan-300 text-sm font-semibold">Paso 1 de 3</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Welcome to IndaSocial!</h1>
            <p className="text-gray-400 text-lg">Choose how you want to use the platform</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Creator Option */}
            <button
              onClick={() => handleSelect('creator')}
              className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-2 border-purple-500/30 rounded-3xl p-8 hover:border-purple-500 hover:scale-105 transition-all group text-left"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <User size={40} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4 text-center">I'm a Creator</h2>
              <p className="text-gray-400 mb-6 text-center">
                Connect with brands, showcase your work, and monetize your influence
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-purple-400">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-sm">Find brand collaborations</span>
                </div>
                <div className="flex items-center gap-2 text-purple-400">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-sm">Track your earnings</span>
                </div>
                <div className="flex items-center gap-2 text-purple-400">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-sm">Grow your reach</span>
                </div>
              </div>
            </button>

            {/* Brand Option */}
            <button
              onClick={() => handleSelect('brand')}
              className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border-2 border-cyan-500/30 rounded-3xl p-8 hover:border-cyan-500 hover:scale-105 transition-all group text-left"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Briefcase size={40} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4 text-center">I'm a Brand</h2>
              <p className="text-gray-400 mb-6 text-center">
                Discover creators, launch campaigns, and measure your ROI
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-cyan-400">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span className="text-sm">Find perfect creators</span>
                </div>
                <div className="flex items-center gap-2 text-cyan-400">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span className="text-sm">Manage campaigns</span>
                </div>
                <div className="flex items-center gap-2 text-cyan-400">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span className="text-sm">Track performance</span>
                </div>
              </div>
            </button>
          </div>

          <p className="text-center text-gray-500 text-sm mt-8">
            You can change this later in settings
          </p>
        </div>
      </div>
    );
  }

  // Step 2: Feature highlights
  if (step === 2) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-3xl">
          <div className="text-center mb-12">
            <div className="inline-block mb-6 px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 rounded-full">
              <span className="text-cyan-300 text-sm font-semibold">Paso 2 de 3</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Key Features</h1>
            <p className="text-gray-400 text-lg">Everything you need in one platform</p>
          </div>

          <div className="grid gap-4 mb-8">
            <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg mb-1">Match & Chat</h3>
                  <p className="text-gray-400 text-sm">Connect directly with {userType === 'creator' ? 'brands' : 'creators'} and negotiate deals safely</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border border-cyan-500/30 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Calendar className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg mb-1">Events</h3>
                  <p className="text-gray-400 text-sm">Discover and register for industry events and networking opportunities</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg mb-1">Analytics</h3>
                  <p className="text-gray-400 text-sm">Track your {userType === 'creator' ? 'earnings and reach' : 'campaign performance'} with detailed insights</p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setStep(3)}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl hover:from-cyan-600 hover:to-blue-600 flex items-center justify-center gap-2"
          >
            Continue
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  // Step 3: Final tips & Terms acceptance
  if (step === 3) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-12">
            <div className="inline-block mb-6 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full">
              <span className="text-green-300 text-sm font-semibold">Paso 3 de 3</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">You're All Set!</h1>
            <p className="text-gray-400 text-lg">Quick tips to get started</p>
          </div>

          <div className="bg-gray-900 border border-cyan-500/20 rounded-2xl p-8 mb-6">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <CheckCircle className="text-green-400 flex-shrink-0 mt-1" size={20} />
                <div>
                  <h3 className="text-white font-semibold mb-1">Complete your profile</h3>
                  <p className="text-gray-400 text-sm">Add a photo and bio in Settings to make a great first impression</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <CheckCircle className="text-green-400 flex-shrink-0 mt-1" size={20} />
                <div>
                  <h3 className="text-white font-semibold mb-1">Explore the community</h3>
                  <p className="text-gray-400 text-sm">Join discussions and connect with other members in the Community tab</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <CheckCircle className="text-green-400 flex-shrink-0 mt-1" size={20} />
                <div>
                  <h3 className="text-white font-semibold mb-1">Give us feedback</h3>
                  <p className="text-gray-400 text-sm">Help us improve by sharing your experience using the feedback button</p>
                </div>
              </div>
            </div>
          </div>

          {/* 🚀 Checkbox y Botón para abrir el Modal de Términos */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <input 
              type="checkbox" 
              id="terms"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="w-5 h-5 rounded accent-cyan-500 cursor-pointer"
            />
            <label htmlFor="terms" className="text-sm text-gray-300 select-none">
              He leído y acepto los{' '}
              <button 
                type="button" 
                onClick={() => setShowTermsModal(true)} 
                className="text-cyan-400 underline hover:text-cyan-300 font-medium focus:outline-none"
              >
                Términos y Condiciones y el Aviso de Privacidad
              </button>
             .
            </label>
          </div>

          <button
            onClick={handleFinish}
            disabled={isSaving || !acceptedTerms}
            className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
          >
            {isSaving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving Setup...
              </>
            ) : (
              <>
                Get Started
                <ChevronRight size={20} />
              </>
            )}
          </button>
        </div>

        {/* 🚀 MODAL DE TÉRMINOS Y CONDICIONES */}
        {showTermsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-gray-900 border border-cyan-500/30 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
              
              {/* Header del Modal */}
              <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-6 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileText size={22} /> Aviso de Privacidad y Términos
                </h3>
                <button 
                  onClick={() => setShowTermsModal(false)} 
                  className="text-white hover:bg-white/20 rounded-xl p-2 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Contenido del Aviso */}
              <div className="p-6 space-y-4 overflow-y-auto text-gray-300 text-sm leading-relaxed">
                <p>
                  Al continuar, aceptas que tus datos serán utilizados para fines de matchmaking entre creadores y marcas dentro de la plataforma. Cualquier intento de contacto, negociación o transacción fuera de Indasocial para evadir este proceso será sancionado conforme a nuestros Términos y Condiciones. Las campañas efectuadas a través de la plataforma están sujetas a una comisión del 20%.
                </p>
                <p>
                  Debes ser mayor de 18 años para crear una cuenta en Indasocial. Puedes solicitar la baja de tu cuenta y la eliminación de tus datos en cualquier momento desde tu perfil o escribiéndonos directamente. Tus datos son tratados conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares.
                </p>
              </div>

              {/* Footer del Modal */}
              <div className="p-4 border-t border-gray-800 bg-gray-950 flex justify-end">
                <button 
                  onClick={() => {
                    setAcceptedTerms(true);
                    setShowTermsModal(false);
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:from-cyan-600 transition-all text-sm"
                >
                  Aceptar y Cerrar
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    );
  }
};

export default Onboarding;