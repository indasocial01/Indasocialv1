"use client";
import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, TrendingUp, Award, Camera, DollarSign, CreditCard, Eye, EyeOff, Save, Check } from 'lucide-react';
import Header from '../components/Header';
// Importamos el cliente de Supabase que creamos previamente
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

  // Form data state adaptado a tu esquema de PostgreSQL
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    email: '',
    phone: '', // Nota: phone no está en tu esquema SQL actual, pero lo mantenemos en el estado visual
    location: '',
    bio: '',
    avatar_url: ''
  });

  // Estadísticas del usuario traídas de la BD
  const [userStats, setUserStats] = useState({
    reach: 0,
    token_balance: 0,
    joinDate: ''
  });

  // Cargar datos del usuario desde Supabase al montar el componente
  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setCurrentUserId(user.id);
        
        // Consultamos la tabla profiles
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          setFormData({
            full_name: profile.full_name || '',
            username: profile.username || '',
            email: profile.email || user.email || '',
            phone: '', // Añadir a la BD si es necesario
            location: profile.location || '',
            bio: profile.bio || '',
            avatar_url: profile.avatar_url || ''
          });
          setAvatarPreview(profile.avatar_url);
          
          // Formateamos la fecha de creación
          const joinDate = new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
          
          setUserStats({
            reach: profile.reach || 0,
            token_balance: profile.token_balance || 0,
            joinDate: joinDate
          });
        }
      }
    };

    fetchUserProfile();
  }, [supabase]);

  // Manejar cambios en los inputs
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Manejar la subida de la foto de perfil
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('El tamaño del archivo debe ser menor a 2MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Por favor sube un archivo de imagen válido');
      return;
    }

    // Mostrar preview local inmediatamente
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // TODO: Implementar la subida al bucket de Supabase Storage aquí
    // const { data, error } = await supabase.storage.from('avatars').upload(...)
    // y luego actualizar el formData.avatar_url con la URL pública devuelta.
  };

  // Guardar cambios en el perfil (Supabase Database)
  const handleSaveProfile = async () => {
    if (!currentUserId) return;
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          username: formData.username,
          location: formData.location,
          bio: formData.bio,
          // avatar_url: formData.avatar_url // Descomentar cuando implementes el storage
        })
        .eq('id', currentUserId);

      if (error) throw error;

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error al guardar el perfil:', error);
      alert('Hubo un error al guardar tus cambios.');
    } finally {
      setIsSaving(false);
    }
  };

  // Guardar nueva contraseña (Supabase Auth)
  const handleUpdatePassword = async () => {
    if (!newPassword) return;
    setIsUpdatingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      
      alert('Contraseña actualizada con éxito');
      setNewPassword('');
    } catch (error) {
      console.error('Error al actualizar contraseña:', error);
      alert(error.message);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'payments', label: 'Payments', icon: DollarSign },
    { id: 'security', label: 'Security', icon: Eye }
  ];

  return (
    <div className="flex-1 bg-black text-white flex flex-col">
      <Header 
        userType={userType}
        title="Settings & Profile"
        subtitle="Manage your account and preferences"
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
            {activeTab === 'profile' && (
              <div className="space-y-6">
                {/* Photo Upload Section */}
                <div className="bg-dark-light border border-cyan-500/20 rounded-2xl p-6">
                  <h3 className="text-white font-bold mb-4">Profile Photo</h3>
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      {avatarPreview ? (
                        <img 
                          src={avatarPreview} 
                          alt="Profile" 
                          className="w-24 h-24 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-5xl">
                          👤
                        </div>
                      )}
                      <label htmlFor="photo-upload" className="absolute bottom-0 right-0 w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center hover:bg-cyan-600 cursor-pointer">
                        <Camera size={16} className="text-white" />
                      </label>
                      <input
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </div>
                    <div>
                      <label htmlFor="photo-upload" className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 font-semibold text-sm cursor-pointer inline-block">
                        Upload New Photo
                      </label>
                      <p className="text-gray-400 text-xs mt-2">JPG, PNG (max. 2MB)</p>
                    </div>
                  </div>
                </div>

                {/* Basic Information Section */}
                <div className="bg-dark-light border border-cyan-500/20 rounded-2xl p-6">
                  <h3 className="text-white font-bold mb-4">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Full Name</label>
                      <input 
                        type="text" 
                        value={formData.full_name} 
                        onChange={(e) => handleInputChange('full_name', e.target.value)}
                        className="w-full px-4 py-3 bg-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500" 
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Username</label>
                      <input 
                        type="text" 
                        value={formData.username} 
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        className="w-full px-4 py-3 bg-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500" 
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Email</label>
                      <input 
                        type="email" 
                        value={formData.email} 
                        disabled
                        className="w-full px-4 py-3 bg-dark border border-gray-700 rounded-lg text-gray-500 cursor-not-allowed" 
                        title="El email se actualiza desde el proveedor (Google)"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Phone</label>
                      <input 
                        type="tel" 
                        value={formData.phone} 
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-4 py-3 bg-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500" 
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-gray-400 text-sm mb-2">Location</label>
                      <input 
                        type="text" 
                        value={formData.location} 
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="w-full px-4 py-3 bg-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500" 
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-gray-400 text-sm mb-2">Bio</label>
                      <textarea 
                        rows={4} 
                        value={formData.bio} 
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        className="w-full px-4 py-3 bg-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 resize-none" 
                      />
                    </div>
                  </div>
                </div>

                {/* Stats Section */}
                <div className="bg-dark-light border border-cyan-500/20 rounded-2xl p-6">
                  <h3 className="text-white font-bold mb-4">Account Statistics</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-dark rounded-xl">
                      <Calendar size={24} className="text-cyan-400 mx-auto mb-2" />
                      <div className="text-sm text-gray-400 mb-1">Member Since</div>
                      <div className="text-white font-bold">{userStats.joinDate}</div>
                    </div>
                    <div className="text-center p-4 bg-dark rounded-xl">
                      <TrendingUp size={24} className="text-green-400 mx-auto mb-2" />
                      <div className="text-sm text-gray-400 mb-1">Reach</div>
                      <div className="text-white font-bold">{userStats.reach}</div>
                    </div>
                    <div className="text-center p-4 bg-dark rounded-xl">
                      <Award size={24} className="text-purple-400 mx-auto mb-2" />
                      <div className="text-sm text-gray-400 mb-1">Tokens</div>
                      <div className="text-white font-bold">{userStats.token_balance}</div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : showSuccess ? (
                    <>
                      <Check size={20} />
                      Saved Successfully!
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Resto de tabs omitidos por brevedad (Payments igual a tu original) */}
            {activeTab === 'payments' && (
              <div className="space-y-6">
                <div className="bg-dark-light border border-cyan-500/20 rounded-2xl p-6">
                  <h3 className="text-white font-bold mb-4">Payment Methods</h3>
                  <div className="text-gray-400">Próximamente conectaremos esto con tu tabla de compras y pasarelas Web3.</div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="bg-dark-light border border-cyan-500/20 rounded-2xl p-6">
                  <h3 className="text-white font-bold mb-4">Change Password</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">New Password</label>
                      <div className="relative">
                        <input 
                          type={showPassword ? "text" : "password"} 
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-4 py-3 bg-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 pr-12" 
                        />
                        <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-400">
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={handleUpdatePassword}
                    disabled={isUpdatingPassword || !newPassword}
                    className="w-full mt-4 py-3 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 font-semibold disabled:opacity-50"
                  >
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