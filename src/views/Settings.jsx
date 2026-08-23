"use client";
import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, MapPin, Calendar, TrendingUp, Award, Camera, 
  DollarSign, CreditCard, Eye, EyeOff, Save, Check, Wallet, 
  RefreshCw, CheckCircle, ExternalLink, Coins
} from 'lucide-react';
import Header from '../components/Header';
import { createClient } from '@/utils/supabase/client'; 

const Settings = ({ userType }) => {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Estados para contraseñas
  const [newPassword, setNewPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // 👻 ESTADOS DE PHANTOM (Solana)
  const [phantomAddress, setPhantomAddress] = useState('');
  const [phantomBalance, setPhantomBalance] = useState(null); // Saldo en SOL
  const [indatokenBalance, setIndatokenBalance] = useState(null); // Saldo en INDT
  const [isConnectingPhantom, setIsConnectingPhantom] = useState(false);
  const [isRefreshingPhantomBalance, setIsRefreshingPhantomBalance] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    avatar_url: ''
  });

  const [userStats, setUserStats] = useState({
    reach: 0,
    token_balance: 0,
    joinDate: ''
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setCurrentUserId(user.id);
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          setFormData({
            full_name: profile.full_name || '',
            username: profile.username || '',
            email: profile.email || user.email || '',
            phone: '', 
            location: profile.location || '',
            bio: profile.bio || '',
            avatar_url: profile.avatar_url || ''
          });
          setAvatarPreview(profile.avatar_url);
          
          const joinDate = new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
          
          setUserStats({
            reach: profile.reach || 0,
            token_balance: profile.token_balance || 0,
            joinDate: joinDate
          });

          // Cargar wallet de Solana guardada
          if (profile.phantom_address) setPhantomAddress(profile.phantom_address);
        }
      }
    };

    fetchUserProfile();
  }, [supabase]);

  // ==========================================
  // 👻 LOGICA PARA PHANTOM (Solana)
  // ==========================================
  useEffect(() => {
    if (typeof window !== 'undefined' && window.phantom?.solana?.isPhantom) {
      const provider = window.phantom.solana;

      provider.on('connect', (publicKey) => {
        const addr = publicKey.toString();
        setPhantomAddress(addr);
        fetchPhantomBalances(addr);
      });

      provider.on('disconnect', () => {
        setPhantomAddress('');
        setPhantomBalance(null);
        setIndatokenBalance(null);
      });

      provider.on('accountChanged', (publicKey) => {
        if (publicKey) {
          const addr = publicKey.toString();
          setPhantomAddress(addr);
          fetchPhantomBalances(addr);
        } else {
          setPhantomAddress('');
          setPhantomBalance(null);
          setIndatokenBalance(null);
        }
      });
      
      provider.connect({ onlyIfTrusted: true }).catch(() => {});
    }
  }, []);

  const handleConnectPhantom = async () => {
    if (typeof window === 'undefined' || !window.phantom?.solana?.isPhantom) {
      alert('Phantom Wallet no está instalada. Por favor instala la extensión.');
      return;
    }
    setIsConnectingPhantom(true);
    try {
      const resp = await window.phantom.solana.connect();
      const addr = resp.publicKey.toString();
      setPhantomAddress(addr);
      await fetchPhantomBalances(addr);
      
      if (currentUserId) {
        await supabase.from('profiles').update({ phantom_address: addr }).eq('id', currentUserId);
      }
    } catch (error) {
      console.error("Error conectando Phantom:", error);
    } finally {
      setIsConnectingPhantom(false);
    }
  };

  // 🚀 OBTENER SALDOS DE SOL Y DE INDATOKEN (DEVNET)
  const fetchPhantomBalances = async (address) => {
    if (!address) return;
    setIsRefreshingPhantomBalance(true);
    try {
      // Usamos el RPC de Devnet
      const rpcUrl = 'https://api.devnet.solana.com';

      // 1. Obtener saldo de SOL nativo
      const resSol = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0', id: 1, method: 'getBalance', params: [address]
        })
      });
      const dataSol = await resSol.json();
      if (dataSol.result) {
        setPhantomBalance((dataSol.result.value / 1e9).toFixed(4));
      }

      // 2. Obtener saldo del INDATOKEN
      // ⚠️ REEMPLAZA ESTO POR EL ADDRESS DE TU TOKEN EN DEVNET ⚠️
      // 2. Obtener saldo del INDATOKEN
      const INDATOKEN_MINT = "XoYYToWuANiP5i8aELDhcYuUFWDcvcZAcGAfxb7z6D4"; 

      // ✅ Lo simplificamos para que siempre entre a buscar el saldo
      if (INDATOKEN_MINT) {
        const resToken = await fetch(rpcUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0', id: 2, method: 'getTokenAccountsByOwner',
            params: [
              address,
              { mint: INDATOKEN_MINT },
              { encoding: "jsonParsed" }
            ]
          })
        });
        const dataToken = await resToken.json();
        
        // Validar si el usuario tiene una cuenta de este token
        if (dataToken.result && dataToken.result.value.length > 0) {
          const tokenAmount = dataToken.result.value[0].account.data.parsed.info.tokenAmount.uiAmount;
          setIndatokenBalance(tokenAmount.toLocaleString()); // Formatear con comas
        } else {
          setIndatokenBalance("0");
        }
      }
    } catch (error) {
      console.error("Error obteniendo saldos de Phantom:", error);
    } finally {
      setIsRefreshingPhantomBalance(false);
    }
  };

  const handleDisconnectPhantom = async () => {
    if (window.phantom?.solana) {
      await window.phantom.solana.disconnect();
    }
    setPhantomAddress('');
    setPhantomBalance(null);
    setIndatokenBalance(null);
    if (currentUserId) await supabase.from('profiles').update({ phantom_address: null }).eq('id', currentUserId);
  };

  // ==========================================
  // METODOS DEL PERFIL
  // ==========================================
  const handleInputChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !currentUserId) return;
    if (file.size > 2 * 1024 * 1024) return alert('El tamaño debe ser menor a 2MB');
    
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
    setIsUploadingPhoto(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUserId}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
      setFormData(prev => ({ ...prev, avatar_url: urlData.publicUrl }));
    } catch (error) {
      console.error(error);
      alert('Error subiendo la foto a Supabase.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!currentUserId) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from('profiles').update({
        full_name: formData.full_name,
        username: formData.username,
        location: formData.location,
        bio: formData.bio,
        avatar_url: formData.avatar_url
      }).eq('id', currentUserId);
      if (error) throw error;
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error(error);
      alert('Error al guardar tus cambios.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword) return;
    setIsUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      alert('Contraseña actualizada');
      setNewPassword('');
    } catch (error) {
      alert(error.message);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'payments', label: 'Web3 Wallet', icon: Wallet },
    { id: 'security', label: 'Security', icon: Eye }
  ];

  return (
    <div className="flex-1 bg-black text-white flex flex-col">
      <Header 
        userType={userType}
        title="Settings & Profile"
        subtitle="Manage your account, preferences, and Web3 wallet"
      />

      <div className="flex-1 overflow-y-auto">
        <div className="border-b border-cyan-500/20 px-8 bg-dark-light">
          <div className="flex gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all relative ${
                    activeTab === tab.id ? 'text-cyan-400' : 'text-gray-400 hover:text-cyan-400'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                  {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400"></div>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            
            {/* 👤 PESTAÑA PERFIL */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="bg-dark-light border border-cyan-500/20 rounded-2xl p-6">
                  <h3 className="text-white font-bold mb-4">Profile Photo</h3>
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Profile" className="w-24 h-24 rounded-full object-cover border-2 border-cyan-500/50" />
                      ) : (
                        <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-5xl">👤</div>
                      )}
                      <label htmlFor="photo-upload" className="absolute bottom-0 right-0 w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center hover:bg-cyan-600 cursor-pointer transition-transform hover:scale-110">
                        <Camera size={16} className="text-white" />
                      </label>
                      <input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" disabled={isUploadingPhoto} />
                    </div>
                    <div>
                      <label htmlFor="photo-upload" className={`px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 font-semibold text-sm cursor-pointer inline-flex items-center gap-2 ${isUploadingPhoto ? 'opacity-50 pointer-events-none' : ''}`}>
                        {isUploadingPhoto ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Subiendo...</> : 'Upload New Photo'}
                      </label>
                      <p className="text-gray-400 text-xs mt-2">JPG, PNG (max. 2MB)</p>
                    </div>
                  </div>
                </div>

                <div className="bg-dark-light border border-cyan-500/20 rounded-2xl p-6">
                  <h3 className="text-white font-bold mb-4">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Full Name</label>
                      <input type="text" value={formData.full_name} onChange={(e) => handleInputChange('full_name', e.target.value)} className="w-full px-4 py-3 bg-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500" />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Username</label>
                      <input type="text" value={formData.username} onChange={(e) => handleInputChange('username', e.target.value)} className="w-full px-4 py-3 bg-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500" />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Email</label>
                      <input type="email" value={formData.email} disabled className="w-full px-4 py-3 bg-dark border border-gray-700 rounded-lg text-gray-500 cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Phone</label>
                      <input type="tel" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} className="w-full px-4 py-3 bg-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-gray-400 text-sm mb-2">Location</label>
                      <input type="text" value={formData.location} onChange={(e) => handleInputChange('location', e.target.value)} className="w-full px-4 py-3 bg-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-gray-400 text-sm mb-2">Bio</label>
                      <textarea rows={4} value={formData.bio} onChange={(e) => handleInputChange('bio', e.target.value)} className="w-full px-4 py-3 bg-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 resize-none" />
                    </div>
                  </div>
                </div>

                <button onClick={handleSaveProfile} disabled={isSaving || isUploadingPhoto} className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl hover:from-cyan-600 hover:to-blue-600 flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20">
                  {isSaving ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Guardando...</> : showSuccess ? <><Check size={20} /> ¡Perfil guardado!</> : <><Save size={20} /> Guardar Cambios</>}
                </button>
              </div>
            )}

            {/* 💳 PESTAÑA WEB3 / PHANTOM SOLANA */}
            {activeTab === 'payments' && (
              <div className="space-y-6">
                
                {/* 👻 SECCIÓN PHANTOM */}
                <div className="bg-gradient-to-br from-gray-900 via-dark-light to-black border-2 border-purple-500/30 rounded-2xl p-6 shadow-xl shadow-purple-500/10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-500/20 border border-purple-500/40 rounded-xl flex items-center justify-center text-3xl">👻</div>
                      <div>
                        <h3 className="text-white font-bold text-xl flex items-center gap-2">
                          Phantom Wallet
                          {phantomAddress && <span className="bg-green-500/20 text-green-400 border border-green-500/30 text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1 font-semibold"><CheckCircle size={12} /> Conectada (Devnet)</span>}
                        </h3>
                        <p className="text-gray-400 text-sm">Conecta tu billetera crypto de la red Solana</p>
                      </div>
                    </div>
                  </div>

                  {phantomAddress ? (
                    <div className="space-y-4">
                      <div className="bg-black/60 border border-purple-500/30 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">Dirección Pública de Solana</div>
                          <div className="font-mono text-purple-400 text-sm font-bold break-all flex items-center gap-2">
                            {phantomAddress}
                            <a href={`https://explorer.solana.com/address/${phantomAddress}?cluster=devnet`} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white" title="Ver en Solana Explorer"><ExternalLink size={14} /></a>
                          </div>
                        </div>
                        
                        {/* Contenedor de Saldos */}
                        <div className="flex gap-4">
                          Saldo SOL
                          <div className="bg-gradient-to-r from-purple-950/40 to-indigo-950/40 border border-purple-500/40 rounded-xl p-4 min-w-[140px]">
                            <div className="text-xs text-gray-400 font-semibold mb-1">Saldo SOL</div>
                            <div className="text-xl font-extrabold text-white flex items-center gap-1">
                              {phantomBalance !== null ? `${phantomBalance}` : '...'} <span className="text-sm font-normal text-gray-400">SOL</span>
                            </div>
                          </div>

                          {/* Saldo INDATOKEN */}
                          <div className="bg-gradient-to-r from-cyan-950/40 to-blue-950/40 border border-cyan-500/40 rounded-xl p-4 min-w-[140px] flex items-center justify-between">
                            <div>
                              <div className="text-xs text-cyan-400 font-semibold flex items-center gap-1 mb-1">
                                <Coins size={12} /> Indatokens
                              </div>
                              <div className="text-xl font-extrabold text-white flex items-center gap-1">
                                {indatokenBalance !== null ? `${indatokenBalance}` : '...'} <span className="text-sm font-normal text-cyan-500">INDT</span>
                              </div>
                            </div>
                          </div>

                          <button onClick={() => fetchPhantomBalances(phantomAddress)} disabled={isRefreshingPhantomBalance} className="p-2 h-fit text-gray-400 hover:text-purple-400 bg-black/40 rounded-lg border border-gray-800 transition-all self-center">
                            <RefreshCw size={16} className={isRefreshingPhantomBalance ? 'animate-spin text-purple-400' : ''} />
                          </button>
                        </div>

                      </div>
                      <div className="flex justify-end pt-2">
                        <button onClick={handleDisconnectPhantom} className="px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/20 font-semibold text-sm">Desconectar Phantom</button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-black/40 border border-gray-800 rounded-xl">
                      <Wallet size={48} className="text-purple-500/60 mx-auto mb-3 animate-pulse" />
                      <p className="text-gray-300 font-semibold mb-1">No has vinculado tu Phantom Wallet</p>
                      <button onClick={handleConnectPhantom} disabled={isConnectingPhantom} className="mt-4 px-8 py-3.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold rounded-xl hover:from-purple-600 hover:to-indigo-700 shadow-lg shadow-purple-500/20 inline-flex items-center gap-2">
                        {isConnectingPhantom ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Conectando...</> : <><Wallet size={20} /> Conectar Phantom</>}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 🔒 PESTAÑA SEGURIDAD */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="bg-dark-light border border-cyan-500/20 rounded-2xl p-6">
                  <h3 className="text-white font-bold mb-4">Change Password</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">New Password</label>
                      <div className="relative">
                        <input type={showPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-3 bg-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 pr-12" />
                        <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-400"><Eye size={20} /></button>
                      </div>
                    </div>
                  </div>
                  <button onClick={handleUpdatePassword} disabled={isUpdatingPassword || !newPassword} className="w-full mt-4 py-3 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 font-semibold disabled:opacity-50">
                    {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;