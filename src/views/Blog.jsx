"use client";
import React, { useState, useEffect } from 'react';
import { Clock, Heart, MessageCircle, Eye, TrendingUp, Plus, Award, Lock, Trash2, X, Upload, Image as ImageIcon } from 'lucide-react';
import Header from '../components/Header';
import PostReader from '../components/PostReader';
import { useAuth } from '../context/AuthContext';
import { categories, privateBlogPosts } from '../data/blogData';
import { createClient } from '@/utils/supabase/client';

const Blog = ({ userType }) => {
  const supabase = createClient();
  const { currentUser, unlockPost: unlockPostInAuth } = useAuth();
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPost, setSelectedPost] = useState(null);
  const [unlockedPosts, setUnlockedPosts] = useState(new Set());
  const [currentUserId, setCurrentUserId] = useState(null);

  // Estados para la Base de Datos Real
  const [dbPosts, setDbPosts] = useState([]);
  
  // Estados para el Modal de Crear Post
  const [showWritePost, setShowWritePost] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [coverPreview, setCoverPreview] = useState(null);
  const [writeForm, setWriteForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'marketing',
    isPremium: false,
    price: 0,
    coverImage: null
  });

  // 1. Cargar Posts de Supabase
  useEffect(() => {
    const fetchDbPosts = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);

      const { data, error } = await supabase
        .from('posts')
        .select(`*, profiles:author_id(full_name, avatar_url)`)
        .order('created_at', { ascending: false });

      if (!error && data) {
        const formatted = data.map(post => ({
          id: post.id,
          title: post.title || 'Sin Título',
          excerpt: post.description || 'Sin resumen',
          content: post.content || '',
          category: post.category || 'marketing',
          author: post.profiles?.full_name || 'Comunidad Inda',
          authorAvatar: post.profiles?.avatar_url || '👤',
          imageUrl: post.thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
          readTime: `${Math.ceil((post.content?.length || 500) / 500)} min read`,
          views: post.students || 0,
          likes: post.downloads || 0,
          comments: 0,
          requiresTokens: post.is_premium,
          unlockCost: post.price || 0,
          gradient: 'from-cyan-500 to-blue-500',
          isUserPost: post.author_id === (user?.id || currentUserId)
        }));
        setDbPosts(formatted);
      }
    };

    fetchDbPosts();
  }, [supabase, currentUserId]);

  // Combinar posts de la Base de Datos con los posts de prueba
  const allPosts = [...dbPosts, ...privateBlogPosts].map(post => ({
    ...post,
    isUnlocked: post.requiresTokens ? unlockedPosts.has(post.id) || post.isUnlocked : true,
  }));
  
  const filteredPosts = selectedCategory === 'all' ? allPosts : allPosts.filter(p => p.category === selectedCategory);
  const featuredPost = filteredPosts.find(p => p.featured) || filteredPosts[0]; // Si no hay destacado, toma el primero
  const regularPosts = filteredPosts.filter(p => p.id !== featuredPost?.id);

  // 2. Eliminar Post Real en Supabase
  const handleDeletePost = async (postId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este post?')) {
      try {
        // Intentar borrar de Supabase primero (si es un post real)
        await supabase.from('posts').delete().eq('id', postId);
        // Actualizar UI
        setDbPosts(dbPosts.filter(p => p.id !== postId));
      } catch (error) {
        console.error("Error al eliminar:", error);
      }
    }
  };

  const handleUnlock = (postId) => {
    const post = allPosts.find(p => p.id === postId);
    if (post && post.requiresTokens && !unlockedPosts.has(postId)) {
      const success = unlockPostInAuth(postId, post.unlockCost);
      if (success) {
        setUnlockedPosts(new Set([...unlockedPosts, postId]));
        setSelectedPost({ ...post, isUnlocked: true });
      }
    }
  };

  // 3. Manejar Preview de la Imagen
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setWriteForm({ ...writeForm, coverImage: file });
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // 4. Publicar Post Real en Supabase
  const handlePublishPost = async (e) => {
    e.preventDefault();
    if (!currentUserId) {
      alert("Por favor inicia sesión para publicar.");
      return;
    }
    
    setIsUploading(true);

    try {
      let coverUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80';

      // Si subió foto, guardarla en el bucket 'covers'
      if (writeForm.coverImage) {
        const coverExt = writeForm.coverImage.name.split('.').pop();
        const coverName = `${currentUserId}-${Date.now()}.${coverExt}`;
        const { error: uploadError } = await supabase.storage.from('covers').upload(coverName, writeForm.coverImage);
        
        if (!uploadError) {
          coverUrl = supabase.storage.from('covers').getPublicUrl(coverName).data.publicUrl;
        }
      }

      // Guardar en la tabla 'posts'
      const { data, error: dbError } = await supabase
        .from('posts')
        .insert({
          author_id: currentUserId,
          title: writeForm.title,
          description: writeForm.excerpt,
          content: writeForm.content,
          category: writeForm.category,
          thumbnail: coverUrl,
          is_premium: writeForm.isPremium,
          price: writeForm.isPremium ? Number(writeForm.price) : 0
        })
        .select(`*, profiles:author_id(full_name, avatar_url)`)
        .single();

      if (dbError) throw dbError;

      // Actualizar UI instantáneamente
      const newFormattedPost = {
        id: data.id,
        title: data.title,
        excerpt: data.description,
        content: data.content,
        category: data.category,
        author: data.profiles?.full_name || 'Comunidad Inda',
        authorAvatar: data.profiles?.avatar_url || '👤',
        imageUrl: data.thumbnail,
        readTime: '1 min read',
        views: 0,
        likes: 0,
        comments: 0,
        requiresTokens: data.is_premium,
        unlockCost: data.price,
        gradient: 'from-cyan-500 to-blue-500',
        isUserPost: true
      };

      setDbPosts([newFormattedPost, ...dbPosts]);
      setShowWritePost(false);
      setWriteForm({ title: '', excerpt: '', content: '', category: 'marketing', isPremium: false, price: 0, coverImage: null });
      setCoverPreview(null);
      alert('🎉 ¡Tu post ha sido publicado exitosamente!');

    } catch (err) {
      console.error("Error al publicar:", err);
      alert("Hubo un error al publicar tu post.");
    } finally {
      setIsUploading(false);
    }
  };

  const PostCard = ({ post, isFeatured = false }) => (
    <div 
      onClick={() => setSelectedPost(post)}
      className={`${isFeatured ? 'md:col-span-2' : ''} bg-gray-900 border border-cyan-500/20 rounded-2xl overflow-hidden hover:border-cyan-500/50 transition-all group cursor-pointer relative`}
    >
      {/* Lock badge for locked posts */}
      {post.requiresTokens && !post.isUnlocked && (
        <div className="absolute top-4 right-4 z-10 bg-yellow-500/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-2">
          <Lock size={14} className="text-white" />
          <span className="text-white text-xs font-bold">{post.unlockCost} INDA</span>
        </div>
      )}

      {/* Delete button for user posts */}
      {post.isUserPost && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDeletePost(post.id);
          }}
          className="absolute top-4 left-4 z-10 p-2 bg-red-500/80 hover:bg-red-600 rounded-lg transition-colors backdrop-blur-sm"
        >
          <Trash2 size={18} className="text-white" />
        </button>
      )}

      <div className={`${isFeatured ? 'md:flex' : ''}`}>
        <div className={`${isFeatured ? 'md:w-1/2' : ''} h-64 overflow-hidden relative`}>
          <img 
            src={post.imageUrl} 
            alt={post.title}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${post.requiresTokens && !post.isUnlocked ? 'blur-sm' : ''}`}
          />
          <div className={`absolute inset-0 bg-gradient-to-t ${post.gradient} opacity-20 group-hover:opacity-30 transition-opacity`}></div>
        </div>

        <div className={`${isFeatured ? 'md:w-1/2' : ''} p-6 flex flex-col justify-between`}>
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className={`px-3 py-1 bg-gradient-to-r ${post.gradient} rounded-full`}>
                <span className="text-white text-xs font-semibold capitalize">{post.category}</span>
              </div>
              {post.rewards && (
                <div className="flex items-center gap-1 text-yellow-400 text-sm">
                  <Award size={14} />
                  <span className="font-semibold">{post.rewards} INDA</span>
                </div>
              )}
            </div>

            <h3 className={`${isFeatured ? 'text-2xl' : 'text-xl'} font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors line-clamp-2`}>
              {post.title}
            </h3>
            <p className="text-gray-400 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
          </div>

          <div>
            <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
              <div className="flex items-center gap-2">
                {post.authorAvatar?.includes('http') ? (
                  <img 
                    src={post.authorAvatar} 
                    alt={post.author} 
                    className="w-10 h-10 rounded-full object-cover border border-cyan-500/30"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-lg text-white font-bold">
                    {post.authorAvatar || '👤'}
                  </div>
                )}
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>{post.readTime}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-gray-400">
                <Eye size={16} />
                <span>{post.views}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-400">
                <Heart size={16} />
                <span>{post.likes}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-400">
                <MessageCircle size={16} />
                <span>{post.comments}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 bg-black text-white flex flex-col">
      <Header 
        title="Community Blog"
        subtitle="Share your stories, earn rewards"
      />

      <div className="flex-1 overflow-y-auto">
        {/* Rewards Banner */}
        <div className="bg-gradient-to-r from-cyan-900/30 to-purple-900/30 border-b border-cyan-500/20 px-8 py-4">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <Award className="text-yellow-400" size={24} />
                <div>
                  <p className="text-white font-semibold">Earn INDA Tokens by Creating Content</p>
                  <p className="text-gray-400 text-sm">Get rewarded for quality posts and engagement</p>
                </div>
              </div>
              <div className="hidden md:block bg-gray-900 border border-cyan-500/30 rounded-xl px-4 py-2">
                <div className="text-xs text-gray-400">Your Balance</div>
                <div className="text-xl font-bold text-yellow-400">{currentUser?.indaBalance || 0} INDA</div>
              </div>
            </div>
            <button 
              onClick={() => setShowWritePost(true)}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
            >
              <Plus size={20} />
              Write Post
            </button>
          </div>
        </div>

        {/* Featured Post */}
        {featuredPost && selectedCategory === 'all' && (
          <section className="border-b border-cyan-500/20 bg-gradient-to-b from-gray-900 to-black py-12 px-8">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={20} className="text-cyan-400" />
                <span className="text-cyan-400 font-semibold text-sm">Featured Story</span>
              </div>
              <PostCard post={featuredPost} isFeatured={true} />
            </div>
          </section>
        )}

        {/* Category Filters */}
        <div className="border-b border-cyan-500/20 bg-gray-900/50 px-8 py-6 sticky top-0 z-10 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto">
            <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                    selectedCategory === cat.id
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span className="text-xs opacity-75">({cat.id === 'all' ? allPosts.length : allPosts.filter(p=>p.category===cat.id).length})</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        <section className="px-8 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularPosts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* 🚀 MODAL WRITE POST (Funcional e Integrado) */}
      {showWritePost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-gray-900 border border-cyan-500/30 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-cyan-500/20">
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-6 flex items-center justify-between sticky top-0 z-10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Plus size={24} /> Escribir Nueva Publicación
              </h2>
              <button onClick={() => setShowWritePost(false)} className="text-white hover:bg-white/20 rounded-lg p-2 transition-all"><X size={20}/></button>
            </div>

            <form onSubmit={handlePublishPost} className="p-6 space-y-6">
              
              {/* Portada */}
              <div>
                <label className="block text-sm text-gray-400 mb-2 font-semibold">Imagen de Portada</label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer hover:bg-gray-800 border-gray-700 hover:border-cyan-500 transition-all overflow-hidden relative">
                    {coverPreview ? (
                      <>
                        <img src={coverPreview} alt="Preview" className="w-full h-full object-cover opacity-60" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="bg-black/70 px-4 py-2 rounded-lg text-white text-sm font-semibold flex items-center gap-2">
                            <ImageIcon size={16} /> Cambiar Imagen
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <ImageIcon className="w-8 h-8 mb-3 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-400"><span className="font-semibold text-cyan-400">Click para subir</span> o arrastra la imagen</p>
                      </div>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                </div>
              </div>

              {/* Título y Categoría */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1 font-semibold">Título</label>
                  <input 
                    required 
                    type="text" 
                    value={writeForm.title}
                    onChange={e => setWriteForm({...writeForm, title: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-cyan-500" 
                    placeholder="Ej. El futuro de la monetización" 
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1 font-semibold">Categoría</label>
                  <select 
                    value={writeForm.category}
                    onChange={e => setWriteForm({...writeForm, category: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                  >
                    {categories.filter(c => c.id !== 'all').map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Resumen */}
              <div>
                <label className="block text-sm text-gray-400 mb-1 font-semibold">Resumen Corto (Excerpt)</label>
                <input 
                  required 
                  type="text" 
                  value={writeForm.excerpt}
                  onChange={e => setWriteForm({...writeForm, excerpt: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-cyan-500" 
                  placeholder="Una breve descripción para atrapar lectores..." 
                />
              </div>

              {/* Contenido */}
              <div>
                <label className="block text-sm text-gray-400 mb-1 font-semibold">Contenido del Post</label>
                <textarea 
                  required 
                  rows={8}
                  value={writeForm.content}
                  onChange={e => setWriteForm({...writeForm, content: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-cyan-500 resize-none" 
                  placeholder="Escribe todo el contenido de tu publicación aquí..." 
                />
              </div>

              {/* Monetización */}
              <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                <label className="block text-sm text-gray-400 mb-3 font-semibold">Monetización (Bloqueo por Tokens)</label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer text-white">
                    <input 
                      type="radio" 
                      name="priceType" 
                      checked={!writeForm.isPremium}
                      onChange={() => setWriteForm({...writeForm, isPremium: false, price: 0})}
                      className="w-4 h-4 text-cyan-500 bg-gray-900 border-gray-700" 
                    />
                    Gratis (Público)
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-yellow-400 font-semibold">
                    <input 
                      type="radio" 
                      name="priceType" 
                      checked={writeForm.isPremium}
                      onChange={() => setWriteForm({...writeForm, isPremium: true})}
                      className="w-4 h-4 text-yellow-500 bg-gray-900 border-gray-700" 
                    />
                    Contenido Premium
                  </label>
                </div>

                {writeForm.isPremium && (
                  <div className="mt-4 animate-fadeIn flex items-center gap-4">
                    <div className="w-1/3">
                      <label className="block text-sm text-gray-400 mb-1">Costo (INDA Tokens)</label>
                      <input 
                        required={writeForm.isPremium} 
                        type="number" 
                        min="1"
                        value={writeForm.price}
                        onChange={e => setWriteForm({...writeForm, price: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-yellow-400 font-bold focus:outline-none focus:border-yellow-500" 
                        placeholder="Ej. 10" 
                      />
                    </div>
                    <div className="text-xs text-gray-400 mt-4 flex-1">
                      Los usuarios deberán pagar esta cantidad de INDA tokens para desbloquear y leer el contenido completo de tu publicación.
                    </div>
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                disabled={isUploading}
                className="w-full mt-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 transition-all flex justify-center items-center gap-2 shadow-lg shadow-cyan-500/20"
              >
                {isUploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Publicando en la red...
                  </>
                ) : (
                  <>
                    <Upload size={20} /> Publicar Ahora
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Post Reader Modal */}
      <PostReader
        post={selectedPost}
        isOpen={!!selectedPost}
        onClose={() => setSelectedPost(null)}
        onUnlock={handleUnlock}
      />
    </div>
  );
};

export default Blog;