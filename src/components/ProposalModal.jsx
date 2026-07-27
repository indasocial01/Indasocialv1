"use client";
import React, { useState, useEffect } from 'react';
import { Briefcase, Send, X, CheckCircle } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

const ProposalModal = ({ isOpen, onClose, match, userType }) => {
  const supabase = createClient();
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Cargar las campañas de la marca cuando se abre el modal
  useEffect(() => {
    const fetchBrandCampaigns = async () => {
      if (isOpen && userType === 'brand') {
        setFetching(true);
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            console.log("[Modal] Buscando campañas para el brand_id:", user.id);
            
            // Quitamos el filtro estricto de 'status' para asegurarnos de que traiga TODO
            const { data, error } = await supabase
              .from('campaigns')
              .select('*')
              .eq('brand_id', user.id);
            
            if (error) {
              console.error("[Modal] Error de Supabase:", error);
            } else if (data) {
              console.log("[Modal] Campañas encontradas:", data);
              setCampaigns(data);
            }
          }
        } catch (err) {
          console.error("[Modal] Error general:", err);
        } finally {
          setFetching(false);
        }
      }
    };
    fetchBrandCampaigns();
  }, [isOpen, userType, supabase]);

  const handleAssignCampaign = async (e) => {
    e.preventDefault();
    if (!selectedCampaignId) return;
    
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Asignar directamente (crear un registro en proposals)
      const { error } = await supabase.from('proposals').insert({
        campaign_id: selectedCampaignId,
        brand_id: user.id,
        creator_id: match.profile.id,
        status: 'pending' // ✅ AHORA NACE COMO PENDIENTE
      });

      if (error) throw error;

      alert('✅ ¡Campaña asignada exitosamente al Creador!');
      onClose();
    } catch (error) {
      console.error("Error al asignar campaña:", error);
      alert('Hubo un problema al asignar la campaña.');
    } finally {
      setLoading(false);
      setSelectedCampaignId('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-gray-900 border border-cyan-500/30 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl shadow-cyan-500/20">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Briefcase size={24} /> Asignar Campaña
          </h2>
          <button onClick={onClose} className="text-white hover:bg-white/20 rounded-lg p-2 transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-300 mb-6">
            Selecciona una de tus campañas activas para asignársela directamente a <span className="font-bold text-cyan-400">{match?.profile?.name}</span>.
          </p>

          {fetching ? (
            <div className="text-center py-6 text-cyan-400 animate-pulse">Buscando tus campañas...</div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-6 bg-gray-800 rounded-xl border border-gray-700">
              <p className="text-gray-400 mb-2">No tienes campañas creadas.</p>
              <p className="text-xs text-gray-500">Ve a la pestaña "Campañas Activas" para crear una primero.</p>
            </div>
          ) : (
            <form onSubmit={handleAssignCampaign} className="space-y-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2 font-semibold">Elige una campaña</label>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {campaigns.map(camp => (
                    <label 
                      key={camp.id} 
                      className={`flex flex-col p-4 rounded-xl cursor-pointer border-2 transition-all ${selectedCampaignId === camp.id ? 'bg-cyan-500/10 border-cyan-500' : 'bg-gray-800 border-gray-700 hover:border-gray-500'}`}
                    >
                      <div className="flex items-center gap-3">
                        <input 
                          type="radio" 
                          name="campaignSelection" 
                          value={camp.id}
                          checked={selectedCampaignId === camp.id}
                          onChange={() => setSelectedCampaignId(camp.id)}
                          className="w-4 h-4 text-cyan-500 bg-gray-900 border-gray-700"
                        />
                        <span className="text-white font-bold">{camp.title}</span>
                      </div>
                      <div className="ml-7 mt-1 text-xs text-gray-400 line-clamp-1">{camp.description}</div>
                      <div className="ml-7 mt-1 text-xs font-semibold text-green-400">Presupuesto: ${camp.budget}</div>
                    </label>
                  ))}
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading || !selectedCampaignId}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-xl hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 transition-all flex justify-center items-center gap-2 shadow-lg shadow-purple-500/20"
              >
                {loading ? 'Asignando...' : (
                  <><Send size={18} /> Asignar Campaña</>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProposalModal;