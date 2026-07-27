"use client";
import React, { useState, useEffect } from 'react';
import { Plus, Briefcase, DollarSign, Clock, CheckCircle, XCircle, Upload, Link as LinkIcon, X } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

const ActiveCampaigns = ({ userType }) => {
  const supabase = createClient();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Modal Crear Campaña (Marca)
  const [showCreate, setShowCreate] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', budget: '' });

  // Modal Subir Producto (Creador)
  const [showDeliverable, setShowDeliverable] = useState(false);
  const [selectedProposalId, setSelectedProposalId] = useState(null);
  const [deliverableFile, setDeliverableFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [userType]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserId(user.id);

      if (userType === 'brand') {
        const { data: campaigns } = await supabase
          .from('campaigns')
          .select('*')
          .eq('brand_id', user.id)
          .order('created_at', { ascending: false });
        if (campaigns) setData(campaigns);
      } else {
        // El Creador ve propuestas Pendientes, Aceptadas o Completadas (No rechazadas)
        const { data: assignments } = await supabase
          .from('proposals')
          .select(`
            *,
            campaigns (*),
            brand:brand_id (full_name, avatar_url)
          `)
          .eq('creator_id', user.id)
          .in('status', ['pending', 'accepted', 'completed'])
          .order('created_at', { ascending: false });
        if (assignments) setData(assignments);
      }
    } catch (error) {
      console.error("Error cargando campañas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    if (!currentUserId) return;
    setIsSaving(true);

    try {
      const { data: newCampaign, error } = await supabase
        .from('campaigns')
        .insert({
          brand_id: currentUserId,
          title: formData.title,
          description: formData.description,
          budget: Number(formData.budget) || 0
        })
        .select()
        .single();

      if (error) throw error;

      setData(prev => [newCampaign, ...prev]);
      setShowCreate(false);
      setFormData({ title: '', description: '', budget: '' });
      alert('¡Campaña creada exitosamente!');
    } catch (error) {
      console.error("Error creando campaña:", error);
      alert('Hubo un error al crear la campaña.');
    } finally {
      setIsSaving(false);
    }
  };

  // 🚀 NUEVO: Función para que el Creador Acepte o Rechace la campaña
  const handleUpdateStatus = async (proposalId, newStatus) => {
    try {
      const { error } = await supabase
        .from('proposals')
        .update({ status: newStatus })
        .eq('id', proposalId);
        
      if (error) throw error;

      // Si la rechaza, la quitamos de su vista. Si la acepta, actualizamos el estado.
      if (newStatus === 'rejected') {
        setData(prev => prev.filter(p => p.id !== proposalId));
        alert('Campaña declinada. Se ha notificado a la marca.');
      } else {
        setData(prev => prev.map(p => p.id === proposalId ? { ...p, status: newStatus } : p));
        alert('🎉 ¡Campaña Aceptada! Ya puedes comenzar a trabajar y subir tu producto.');
      }
    } catch (error) {
      console.error("Error actualizando estado:", error);
      alert("Hubo un error de conexión.");
    }
  };

  // 🚀 NUEVO: Función para Subir el Producto (Entregable)
  const handleUploadDeliverable = async (e) => {
    e.preventDefault();
    if (!deliverableFile || !selectedProposalId) return;
    setIsUploading(true);

    try {
      // Subimos el archivo usando el bucket 'contents' que ya tenías
      const fileExt = deliverableFile.name.split('.').pop();
      const fileName = `deliverable-${currentUserId}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('contents')
        .upload(fileName, deliverableFile);
        
      if (uploadError) throw uploadError;

      const fileUrl = supabase.storage.from('contents').getPublicUrl(fileName).data.publicUrl;

      // Actualizamos la propuesta a "Completada" y guardamos el link del producto
      const { error: dbError } = await supabase
        .from('proposals')
        .update({ 
          status: 'completed', 
          deliverable_url: fileUrl 
        })
        .eq('id', selectedProposalId);

      if (dbError) throw dbError;

      // Actualizamos la UI
      setData(prev => prev.map(p => p.id === selectedProposalId ? { ...p, status: 'completed', deliverable_url: fileUrl } : p));
      setShowDeliverable(false);
      setDeliverableFile(null);
      alert('🚀 ¡Producto enviado exitosamente a la Marca!');

    } catch (error) {
      console.error("Error al subir entregable:", error);
      alert("Hubo un error subiendo tu archivo.");
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return <div className="text-cyan-400 py-8 text-center animate-pulse">Cargando campañas...</div>;
  }

  return (
    <div>
      {/* Botón para crear (Solo visible para Marcas) */}
      {userType === 'brand' && (
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => setShowCreate(true)}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-600 flex items-center gap-2"
          >
            <Plus size={20} /> Crear Nueva Campaña
          </button>
        </div>
      )}

      {/* Lista vacía */}
      {data.length === 0 ? (
        <div className="text-center py-12 bg-gray-900 rounded-2xl border border-cyan-500/20">
          <Briefcase size={48} className="text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">
            {userType === 'brand' ? 'No has creado ninguna campaña aún' : 'No tienes campañas activas asignadas'}
          </p>
        </div>
      ) : (
        /* Lista de Campañas */
        <div className="grid md:grid-cols-2 gap-6">
          {data.map((item) => {
            const isBrand = userType === 'brand';
            const campaignData = isBrand ? item : item.campaigns;
            const brandInfo = isBrand ? null : item.brand;
            const proposalStatus = isBrand ? item.status : item.status; // pending, accepted, completed

            return (
              <div key={item.id} className={`bg-gray-900 border ${proposalStatus === 'completed' ? 'border-green-500/50' : 'border-cyan-500/30'} rounded-2xl p-6 hover:border-cyan-500/50 transition-all relative overflow-hidden flex flex-col h-full`}>
                
                {/* Etiqueta Visual del Estado */}
                <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-xs font-bold flex items-center gap-1
                  ${proposalStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 
                    proposalStatus === 'accepted' ? 'bg-blue-500/20 text-blue-400' : 
                    'bg-green-500/20 text-green-400'}`}>
                  {proposalStatus === 'pending' ? <Clock size={12} /> : <CheckCircle size={12} />} 
                  {proposalStatus === 'pending' ? 'Nueva Solicitud' : 
                   proposalStatus === 'accepted' ? 'En Progreso' : 'Completada'}
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2 pr-28">{campaignData.title}</h3>
                
                {!isBrand && brandInfo && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="text-xs text-gray-400">Asignada por:</div>
                    <span className="text-cyan-400 text-sm font-semibold">{brandInfo.full_name}</span>
                  </div>
                )}

                <p className="text-gray-400 text-sm mb-4 line-clamp-3 flex-1">{campaignData.description}</p>
                
                <div className="flex items-center gap-4 text-sm pt-4 border-t border-gray-800 mb-4">
                  <div className="flex items-center gap-1 text-green-400 font-semibold">
                    <DollarSign size={16} /> {campaignData.budget} USD
                  </div>
                </div>

                {/* 🚀 LÓGICA DE BOTONES PARA EL CREADOR */}
                {!isBrand && (
                  <div className="mt-auto">
                    {proposalStatus === 'pending' && (
                      <div className="flex gap-3">
                        <button 
                          onClick={() => handleUpdateStatus(item.id, 'accepted')}
                          className="flex-1 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 text-sm transition-all"
                        >
                          Aceptar Campaña
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(item.id, 'rejected')}
                          className="flex-1 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg font-semibold hover:bg-red-500/20 text-sm transition-all"
                        >
                          Declinar
                        </button>
                      </div>
                    )}

                    {proposalStatus === 'accepted' && (
                      <button 
                        onClick={() => { setSelectedProposalId(item.id); setShowDeliverable(true); }}
                        className="w-full py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:from-cyan-600 flex justify-center items-center gap-2 text-sm transition-all shadow-lg shadow-cyan-500/20"
                      >
                        <Upload size={16} /> Subir Producto
                      </button>
                    )}

                    {proposalStatus === 'completed' && (
                      <a 
                        href={item.deliverable_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="w-full py-2 bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg font-semibold hover:bg-green-500/20 flex justify-center items-center gap-2 text-sm transition-all"
                      >
                        <LinkIcon size={16} /> Ver Producto Entregado
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Crear Campaña (Marca) */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-gray-900 border border-cyan-500/30 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl shadow-cyan-500/20">
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Briefcase size={24} /> Crear Campaña
              </h2>
              <button onClick={() => setShowCreate(false)} className="text-white hover:bg-white/20 rounded-lg p-2"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleCreateCampaign} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nombre de la Campaña</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-cyan-500" placeholder="Ej. Promoción de Verano 2026" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Descripción y Entregables</label>
                <textarea required rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-cyan-500 resize-none" placeholder="Necesitamos 1 Reel y 2 Historias..." />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Presupuesto ($USD)</label>
                <input required type="number" value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-cyan-500" placeholder="Ej. 500" />
              </div>
              
              <button type="submit" disabled={isSaving} className="w-full mt-4 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:from-cyan-600 disabled:opacity-50 flex justify-center transition-all">
                {isSaving ? 'Guardando...' : 'Guardar Campaña'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 🚀 NUEVO: Modal Subir Producto (Creador) */}
      {showDeliverable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-gray-900 border border-cyan-500/30 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl shadow-cyan-500/20">
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Upload size={24} /> Subir Producto
              </h2>
              <button onClick={() => { setShowDeliverable(false); setDeliverableFile(null); }} className="text-white hover:bg-white/20 rounded-lg p-2 transition-all">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUploadDeliverable} className="p-6 space-y-4">
              <p className="text-gray-300 text-sm mb-4">Adjunta el archivo o reporte final para la marca. Esto marcará la campaña como completada.</p>
              
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer bg-gray-800 border-gray-700 hover:border-cyan-500 transition-all">
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                  <Upload className={`w-8 h-8 mb-2 ${deliverableFile ? 'text-green-400' : 'text-gray-400'}`} />
                  {deliverableFile ? (
                    <span className="text-green-400 font-semibold text-sm line-clamp-1">{deliverableFile.name}</span>
                  ) : (
                    <span className="text-cyan-400 font-semibold text-sm">Click para seleccionar archivo</span>
                  )}
                </div>
                <input required type="file" className="hidden" onChange={e => setDeliverableFile(e.target.files[0])} />
              </label>

              <button 
                type="submit" 
                disabled={isUploading || !deliverableFile}
                className="w-full mt-4 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:from-cyan-600 disabled:opacity-50 flex justify-center items-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
              >
                {isUploading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>Enviar a la Marca</>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveCampaigns;