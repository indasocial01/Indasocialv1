"use client";
import React, { useState, useEffect } from 'react';
import { Plus, Briefcase, DollarSign, Clock, CheckCircle, Upload, Link as LinkIcon, X, Cpu, ShieldCheck } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

// 🚀 WEB3: LIBRERÍAS DE SOLANA Y SPL-TOKEN PARA INDATOKENS
import { Connection, PublicKey, Transaction, clusterApiUrl } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction, createAssociatedTokenAccountIdempotentInstruction } from '@solana/spl-token';

const ActiveCampaigns = ({ userType }) => {
  const supabase = createClient();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  const [showCreate, setShowCreate] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const emptyForm = { title: '', objective: '', description: '', deliverables: '', due_date: '', budget: '' };
  const [formData, setFormData] = useState(emptyForm);
  const [editingCampaignId, setEditingCampaignId] = useState(null);

  const [showDeliverable, setShowDeliverable] = useState(false);
  const [selectedProposalId, setSelectedProposalId] = useState(null);
  const [deliverableFile, setDeliverableFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  async function fetchData() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserId(user.id);

      if (userType === 'brand') {
        // En producción se conserva la relación con propuestas. En Dev todavía
        // no existe la tabla proposals: usamos una consulta sencilla como respaldo.
        let { data: campaigns, error } = await supabase
          .from('campaigns')
          .select(`
            *,
            proposals (
              id, status, deliverable_url, creator_id,
              creator:profiles!proposals_creator_id_fkey (full_name, phantom_address)
            )
          `)
          .eq('brand_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          const result = await supabase
            .from('campaigns')
            .select('*')
            .eq('brand_id', user.id)
            .order('created_at', { ascending: false });
          campaigns = result.data;
          error = result.error;
        }

        if (error) console.error('Error consultando campañas:', error);
        setData(campaigns || []);
      } else {
        // 🚀 ESPECIFICAMOS !proposals_brand_id_fkey PARA LA MARCA
        const { data: assignments, error } = await supabase
          .from('proposals')
          .select(`
            *,
            campaigns (*),
            brand:profiles!proposals_brand_id_fkey (full_name, avatar_url)
          `)
          .eq('creator_id', user.id)
          .in('status', ['pending', 'accepted', 'completed', 'paid'])
          .order('created_at', { ascending: false });

        if (error) {
          console.error("🚨 Error real de Supabase (Creador):", JSON.stringify(error, null, 2));
        }

        if (assignments) setData(assignments);
      }
    } catch (err) {
      console.error("Error crítico:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [userType]);

  const handleCreateCampaign = async (status) => {
    if (!currentUserId || isSaving) return;

    const title = formData.title.trim();
    const description = formData.description.trim();
    const objective = formData.objective.trim();
    const deliverables = formData.deliverables.trim();
    const budget = Number(formData.budget);

    if (!title) {
      alert('Escribe al menos un nombre para guardar el borrador.');
      return;
    }
    if (status === 'active' && (!description || !objective || !deliverables || !Number.isInteger(budget) || budget <= 0)) {
      alert('Para publicar agrega descripción, objetivo, entregables y un presupuesto positivo en MXN.');
      return;
    }
    if (formData.budget !== '' && (!Number.isInteger(budget) || budget < 0)) {
      alert('El presupuesto debe ser un número entero igual o mayor a cero.');
      return;
    }

    setIsSaving(true);
    try {
      const campaignFields = {
        title,
        description: description || null,
        objective: objective || null,
        deliverables: deliverables || null,
        due_date: formData.due_date || null,
        budget: formData.budget === '' ? 0 : budget,
        budget_currency: 'MXN',
        status // draft = borrador; active = publicado dentro del entorno Dev
      };
      // La moneda es fija al crear y no se modifica al editar.
      const editableFields = { ...campaignFields };
      delete editableFields.budget_currency;
      const query = editingCampaignId
        ? supabase.from('campaigns')
            .update({ ...editableFields, updated_at: new Date().toISOString() })
            .eq('id', editingCampaignId)
            .eq('brand_id', currentUserId)
            .eq('status', 'draft')
            .select('id')
        : supabase.from('campaigns')
            .insert({ brand_id: currentUserId, ...campaignFields })
            .select('id');
      const { data: saved, error } = await query;
      if (error) throw error;
      if (!saved?.length) throw new Error('La operación no guardó ninguna campaña.');
      await fetchData();
      setShowCreate(false);
      setEditingCampaignId(null);
      setFormData(emptyForm);
      alert(status === 'draft' ? 'Borrador guardado.' : 'Campaña publicada en el entorno de desarrollo.');
    } catch (error) {
      console.error('Error creando campaña:', error);
      alert('Error al guardar: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishDraft = async (campaign) => {
    if (!currentUserId || isSaving) return;
    if (!campaign.description || !campaign.objective || !campaign.deliverables || campaign.budget <= 0) {
      alert('Este borrador necesita descripción, objetivo, entregables y presupuesto antes de publicarse.');
      return;
    }
    setIsSaving(true);
    try {
      const { data: updated, error } = await supabase.from('campaigns')
        .update({ status: 'active', updated_at: new Date().toISOString() })
        .eq('id', campaign.id)
        .eq('brand_id', currentUserId)
        .eq('status', 'draft')
        .select('id');
      if (error) throw error;
      if (!updated?.length) throw new Error('No se pudo publicar el borrador.');
      await fetchData();
    } catch (error) {
      console.error('Error publicando borrador:', error);
      alert('Error: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // 1️⃣ EL CREADOR ACEPTA (Solo registra su wallet, no paga nada)
  const handleUpdateStatus = async (proposalId, newStatus) => {
    try {
      if (newStatus === 'accepted') {
        if (typeof window !== 'undefined' && window.phantom?.solana?.isPhantom) {
          const provider = window.phantom.solana;
          if (!provider.isConnected) await provider.connect();
          if (currentUserId && provider.publicKey) {
            await supabase
              .from('profiles')
              .update({ phantom_address: provider.publicKey.toString() })
              .eq('id', currentUserId);
          }
        }
      }

      const { data: updated, error } = await supabase
        .from('proposals')
        .update({ status: newStatus })
        .eq('id', proposalId)
        .select();

      if (error) throw error;
      if (!updated || updated.length === 0) {
        alert("⚠️ No se pudo actualizar la campaña. Verifica permisos de Supabase.");
        return;
      }

      await fetchData();
      if (newStatus === 'accepted') {
        alert('🎉 ¡Campaña aceptada!\nTu billetera quedó registrada para recibir los Indatokens.');
      } else {
        alert('Campaña declinada.');
      }
    } catch (error) {
      console.error("Error actualizando estatus:", error);
      alert("❌ Error al guardar en base de datos: " + error.message);
    }
  };

  // 2️⃣ EL CREADOR SUBE EL ENTREGABLE
  const handleUploadDeliverable = async (e) => {
    e.preventDefault();
    if (!deliverableFile || !selectedProposalId) return;
    setIsUploading(true);

    try {
      const safeFileName = deliverableFile.name.replace(/[^a-zA-Z0-9.-]/g, '-');
      const fileName = `deliverable-${currentUserId}-${Date.now()}-${safeFileName}`;
      
      const { error: uploadError } = await supabase.storage.from('contents').upload(fileName, deliverableFile);
      if (uploadError) throw uploadError;

      const fileUrl = supabase.storage.from('contents').getPublicUrl(fileName).data.publicUrl;
      
      const { error: proposalError } = await supabase
        .from('proposals')
        .update({ status: 'completed', deliverable_url: fileUrl })
        .eq('id', selectedProposalId);

      if (proposalError) throw proposalError;

      await fetchData();
      setShowDeliverable(false);
      setDeliverableFile(null);
      alert('🚀 ¡Entregable enviado a la Marca para su revisión!');
    } catch (error) {
      console.error("Error al subir:", error);
      alert("Error al subir entregable: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  // 3️⃣ LA MARCA APRUEBA Y PAGA CON INDATOKENS (PHANTOM)
  const handleReleasePayment = async (proposalId, creatorPhantomAddress, budgetTokens) => {
    if (typeof window === 'undefined' || !window.phantom?.solana?.isPhantom) {
      alert('❌ Error: Phantom Wallet no está instalada.'); return;
    }

    const provider = window.phantom.solana;
    try {
      let fromPublicKey = provider.publicKey;
      if (!provider.isConnected || !fromPublicKey) {
        const resp = await provider.connect();
        fromPublicKey = resp.publicKey;
      }

      const finalCreatorAddress = creatorPhantomAddress || fromPublicKey.toString();
      alert(`🦊 Se abrirá Phantom para transferir y liberar ${budgetTokens} INDT (Indatokens) al creador.`);

      const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');

      // Mint de tu token Indatoken en Devnet
      const INDATOKEN_MINT = new PublicKey("XoYYToWuANiP5i8aELDhcYuUFWDcvcZAcGAfxb7z6D4"); 
      const DESTINATION_WALLET = new PublicKey(finalCreatorAddress); 

      const senderATA = await getAssociatedTokenAddress(INDATOKEN_MINT, fromPublicKey);
      const receiverATA = await getAssociatedTokenAddress(INDATOKEN_MINT, DESTINATION_WALLET);
      const transferAmount = BigInt(budgetTokens) * BigInt(10 ** 9);

      const transaction = new Transaction({
        feePayer: fromPublicKey, blockhash, lastValidBlockHeight
      });

      // 🚀 ASEGURA QUE LA CUENTA ATA DEL CREADOR EXISTA (IDEMPOTENTE)
      transaction.add(
        createAssociatedTokenAccountIdempotentInstruction(
          fromPublicKey,      // Quien paga la creación si no existe (la marca)
          receiverATA,        // La cuenta de token del creador
          DESTINATION_WALLET, // Dueño de la cuenta
          INDATOKEN_MINT      // Mint de Indatoken
        )
      );

      // 🚀 INSTRUCCIÓN DE TRANSFERENCIA DE INDATOKENS
      transaction.add(
        createTransferInstruction(
          senderATA, 
          receiverATA, 
          fromPublicKey, 
          transferAmount
        )
      );

      const { signature } = await provider.signAndSendTransaction(transaction);

      const { error } = await supabase
        .from('proposals')
        .update({ status: 'paid' })
        .eq('id', proposalId);

      if (error) throw error;
      await fetchData();

      alert(`🎉 ¡Pago liberado con éxito!\n\nEl creador recibió sus Indatokens.\nFirma:\n${signature}`);
    } catch (error) {
      console.error("Error detallado en Web3:", error);
      alert("❌ Error en la transacción de Indatokens: " + (error.message || error));
    }
  };

  if (loading) return <div className="text-cyan-400 py-8 text-center animate-pulse">Cargando campañas...</div>;

  return (
    <div>
      {userType === 'brand' && (
        <div className="mb-6 flex justify-end">
          <button onClick={() => { setEditingCampaignId(null); setFormData(emptyForm); setShowCreate(true); }} className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold hover:from-cyan-600 flex items-center gap-2"><Plus size={20} /> Nueva campaña</button>
        </div>
      )}

      {data.length === 0 ? (
        <div className="text-center py-12 bg-gray-900 rounded-2xl border border-cyan-500/20">
          <Briefcase size={48} className="text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">{userType === 'brand' ? 'No tienes campañas registradas aún' : 'No tienes campañas asignadas'}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {data.map((item) => {
            const isBrand = userType === 'brand';
            const campaignData = isBrand ? item : item.campaigns;
            const brandInfo = isBrand ? null : item.brand;
            
            const activeProposal = isBrand && item.proposals?.length > 0 ? item.proposals[0] : (!isBrand ? item : null);
            const proposalStatus = activeProposal ? activeProposal.status : (isBrand ? campaignData.status : item.status);
            const creatorInfo = activeProposal?.creator;

            return (
              <div key={item.id} className={`bg-gray-900 border ${proposalStatus === 'paid' ? 'border-green-500/50' : 'border-cyan-500/30'} rounded-2xl p-6 relative flex flex-col h-full hover:shadow-lg transition-all`}>
                
                {campaignData.budget_currency !== 'MXN' && (
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
                      <Cpu size={10} /> INDT Escrow
                    </span>
                  </div>
                )}

                <div className={`mt-2 mb-3 inline-flex px-3 py-1 rounded-xl text-xs font-bold w-max items-center gap-1 ${
                  proposalStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                  proposalStatus === 'accepted' ? 'bg-blue-500/20 text-blue-400' :
                  proposalStatus === 'completed' ? 'bg-purple-500/20 text-purple-400' :
                  proposalStatus === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-gray-800 text-gray-400'}`}>
                  {proposalStatus === 'paid' ? <CheckCircle size={12} /> : <Clock size={12} />}
                  {proposalStatus === 'pending' ? 'Nueva Solicitud' :
                   proposalStatus === 'accepted' ? 'En Progreso' :
                   proposalStatus === 'completed' ? 'Entregado (Esperando Revisión)' :
                   proposalStatus === 'paid' ? 'Finalizada y Pagada' :
                   proposalStatus === 'draft' ? 'Borrador' :
                   proposalStatus === 'active' ? 'Publicada' : 'Sin estado'}
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{campaignData.title}</h3>
                {!isBrand && brandInfo && <div className="flex items-center gap-2 mb-3"><div className="text-xs text-gray-400">Asignada por:</div><span className="text-cyan-400 text-sm font-semibold">{brandInfo.full_name}</span></div>}
                <p className="text-gray-400 text-sm mb-4 line-clamp-3 flex-1">{campaignData.description}</p>
                <div className="flex items-center gap-4 text-sm pt-4 border-t border-gray-800 mb-4">
                  <div className="flex items-center gap-1 text-green-400 font-semibold">
                    <DollarSign size={16} />
                    {campaignData.budget_currency === 'MXN'
                      ? `${Number(campaignData.budget).toLocaleString('es-MX')} MXN`
                      : `${campaignData.budget} INDT`}
                  </div>
                </div>

                {/* VISTA DEL CREADOR */}
                {!isBrand && (
                  <div className="mt-auto">
                    {proposalStatus === 'pending' && (
                      <div className="flex gap-3">
                        <button onClick={() => handleUpdateStatus(item.id, 'accepted')} className="flex-1 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 text-sm">Aceptar Campaña</button>
                        <button onClick={() => handleUpdateStatus(item.id, 'rejected')} className="flex-1 py-2.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl font-semibold hover:bg-red-500/20 text-sm">Declinar</button>
                      </div>
                    )}
                    {proposalStatus === 'accepted' && (
                      <button onClick={() => { setSelectedProposalId(item.id); setShowDeliverable(true); }} className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold flex justify-center items-center gap-2 shadow-lg shadow-cyan-500/20"><Upload size={16} /> Subir Producto</button>
                    )}
                    {proposalStatus === 'completed' && <p className="text-yellow-400 text-sm font-semibold text-center italic p-3 bg-yellow-950/20 rounded-xl border border-yellow-500/20">⏳ Video enviado. Esperando revisión y pago en INDT de la marca...</p>}
                    {proposalStatus === 'paid' && <p className="text-green-400 text-sm font-bold text-center p-3 bg-green-950/20 rounded-xl border border-green-500/20">✅ ¡Pago de {campaignData.budget} INDT Recibido!</p>}
                  </div>
                )}

                {/* VISTA DE LA MARCA */}
                {isBrand && (
                  <div className="mt-auto space-y-3">
                    {campaignData.objective && <p className="text-sm text-gray-300"><strong>Objetivo:</strong> {campaignData.objective}</p>}
                    {campaignData.deliverables && <p className="text-sm text-gray-300 whitespace-pre-line"><strong>Entregables:</strong> {campaignData.deliverables}</p>}
                    {campaignData.due_date && <p className="text-sm text-gray-400"><strong>Fecha de entrega:</strong> {campaignData.due_date}</p>}
                    {proposalStatus === 'draft' && (
                      <>
                        <p className="text-gray-400 text-sm">Borrador privado. No se ha publicado.</p>
                        <button type="button" onClick={() => {
                          setEditingCampaignId(campaignData.id);
                          setFormData({
                            title: campaignData.title || '',
                            description: campaignData.description || '',
                            objective: campaignData.objective || '',
                            deliverables: campaignData.deliverables || '',
                            due_date: campaignData.due_date || '',
                            budget: String(campaignData.budget ?? '')
                          });
                          setShowCreate(true);
                        }} className="w-full py-2.5 border border-gray-600 rounded-xl font-semibold">Editar borrador</button>
                        <button type="button" disabled={isSaving} onClick={() => handlePublishDraft(campaignData)} className="w-full py-2.5 bg-cyan-700 rounded-xl font-semibold disabled:opacity-50">Publicar borrador</button>
                      </>
                    )}
                    {proposalStatus === 'active' && <p className="text-cyan-400 text-sm">Publicada en Dev. Aún no es visible para otros usuarios hasta configurar sus permisos.</p>}
                    {proposalStatus === 'pending' && <p className="text-yellow-500 text-sm text-center">El Creador no ha aceptado aún...</p>}
                    {proposalStatus === 'accepted' && <p className="text-blue-400 text-sm text-center p-3 bg-blue-950/20 rounded-xl border border-blue-500/20">⏳ El Creador está trabajando en tu video...</p>}
                    
                    {proposalStatus === 'completed' && activeProposal && (
                      <>
                        <a href={activeProposal.deliverable_url} target="_blank" rel="noreferrer" className="w-full py-2.5 bg-gray-800 text-cyan-400 rounded-xl font-semibold flex justify-center items-center gap-2 hover:bg-gray-700 transition-all border border-cyan-500/20"><LinkIcon size={16} /> 1. Ver Entregable del Creador</a>

                        {campaignData.budget_currency !== 'MXN' ? (
                          <button onClick={() => handleReleasePayment(activeProposal.id, creatorInfo?.phantom_address, campaignData.budget)} className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-bold hover:scale-[1.02] flex justify-center items-center gap-2 shadow-lg shadow-green-500/20 transition-all">
                            <ShieldCheck size={18} /> 2. Aprobar y Pagar ({campaignData.budget} INDT)
                          </button>
                        ) : (
                          <p className="text-gray-400 text-sm">Pago en MXN pendiente de integración. No se realizará ninguna transferencia.</p>
                        )}
                      </>
                    )}

                    {proposalStatus === 'paid' && <p className="text-green-400 text-sm font-bold text-center p-3 bg-green-950/20 rounded-xl border border-green-500/20">✅ Campaña Pagada y Finalizada</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 border border-cyan-500/30 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2"><Briefcase size={24} /> {editingCampaignId ? 'Editar borrador' : 'Nueva campaña'}</h2>
              <button type="button" onClick={() => setShowCreate(false)} aria-label="Cerrar formulario" className="text-white hover:bg-white/20 rounded-lg p-2"><X size={20}/></button>
            </div>
            <form onSubmit={e => { e.preventDefault(); handleCreateCampaign('active'); }} className="p-6 space-y-4">
              <div>
                <label htmlFor="campaign-title" className="block text-sm text-gray-400 mb-1">Nombre de campaña *</label>
                <input id="campaign-title" required type="text" maxLength={150} value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white" />
              </div>
              <div>
                <label htmlFor="campaign-objective" className="block text-sm text-gray-400 mb-1">Objetivo</label>
                <textarea id="campaign-objective" rows={2} value={formData.objective} onChange={e => setFormData({ ...formData, objective: e.target.value })} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white resize-y" placeholder="Ej. dar a conocer nuestra aplicación" />
              </div>
              <div>
                <label htmlFor="campaign-description" className="block text-sm text-gray-400 mb-1">Descripción / brief</label>
                <textarea id="campaign-description" rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white resize-y" />
              </div>
              <div>
                <label htmlFor="campaign-deliverables" className="block text-sm text-gray-400 mb-1">Entregables solicitados</label>
                <textarea id="campaign-deliverables" rows={2} value={formData.deliverables} onChange={e => setFormData({ ...formData, deliverables: e.target.value })} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white resize-y" placeholder="Ej. un reel y dos historias" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="campaign-budget" className="block text-sm text-gray-400 mb-1">Presupuesto (MXN)</label>
                  <input id="campaign-budget" type="number" min="0" step="1" value={formData.budget} onChange={e => setFormData({ ...formData, budget: e.target.value })} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white" />
                </div>
                <div>
                  <label htmlFor="campaign-date" className="block text-sm text-gray-400 mb-1">Fecha de entrega</label>
                  <input id="campaign-date" type="date" value={formData.due_date} onChange={e => setFormData({ ...formData, due_date: e.target.value })} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white" />
                </div>
              </div>
              <p className="text-xs text-gray-400">El borrador solo exige nombre. Para publicar se requieren objetivo, descripción, entregables y presupuesto positivo. No se procesan pagos aquí.</p>
              <div className="grid sm:grid-cols-2 gap-3 pt-2">
                <button type="button" disabled={isSaving} onClick={() => handleCreateCampaign('draft')} className="py-3 border border-gray-600 rounded-xl font-semibold text-white disabled:opacity-50">Guardar borrador</button>
                <button type="submit" disabled={isSaving} className="py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl disabled:opacity-50">{isSaving ? 'Guardando...' : 'Publicar en Dev'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeliverable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-gray-900 border border-cyan-500/30 rounded-2xl max-w-md w-full shadow-2xl">
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2"><Upload size={24} /> Subir Producto</h2>
              <button onClick={() => { setShowDeliverable(false); setDeliverableFile(null); }} className="text-white hover:bg-white/20 rounded-lg p-2"><X size={20}/></button>
            </div>
            <form onSubmit={handleUploadDeliverable} className="p-6 space-y-4">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer bg-gray-800 border-gray-700 hover:border-cyan-500">
                <Upload className={`w-8 h-8 mb-2 ${deliverableFile ? 'text-green-400' : 'text-gray-400'}`} />
                {deliverableFile ? <span className="text-green-400 text-sm">{deliverableFile.name}</span> : <span className="text-cyan-400 text-sm">Seleccionar archivo</span>}
                <input required type="file" className="hidden" onChange={e => setDeliverableFile(e.target.files[0])} />
              </label>
              <button type="submit" disabled={isUploading || !deliverableFile} className="w-full mt-4 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl">{isUploading ? 'Subiendo...' : 'Enviar a la Marca'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default ActiveCampaigns;