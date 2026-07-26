"use client";
import React, { useState, useEffect } from 'react';
import { Clock, Heart, MessageCircle, Eye, TrendingUp, Lock, ChevronRight, PenSquare, Upload, X, Image as ImageIcon } from 'lucide-react';
import PostReader from '../components/PostReader';
import { createClient } from '@/utils/supabase/client';

const categories = [
  { id: 'all', label: 'All', icon: '🌐' },
  { id: 'marketing', label: 'Marketing', icon: '📈' },
  { id: 'design', label: 'Design', icon: '🎨' },
  { id: 'business', label: 'Business', icon: '💼' },
  { id: 'tech', label: 'Technology', icon: '🎬' }
];

const BlogPublic = ({ onLoginClick }) => {
  const supabase = createClient();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPost, setSelectedPost] = useState(null);

  // Estados para publicaciones desde la Base de Datos
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Estados para el Modal de Crear Publicación
  const [showWriteModal, setShowUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [writeForm, setWriteForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'marketing',
    coverImage: null
  });
  const [coverPreview, setCoverPreview] = useState(null);

  // 1. Obtener usuario y cargar publicaciones desde Supabase
  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) setCurrentUserId(user.id);

        const { data, error } = await supabase
          .from('posts')
          .select(`
            *,
            profiles:author_id (full_name, avatar_url)
          `)
          .order('created_at', { ascending: false });

        if (!error && data) {
          const formattedPosts = data.map(post => ({
            id: post.id,
            title: post.title || 'Sin título',
            excerpt: post.description || post.content?.substring(0, 120) + '...',
            content: post.content || '',
            category: post.category || 'marketing',
            author: post.profiles?.full_name || 'Comunidad Inda',
            authorAvatar: post.profiles?.avatar_url || '👤',
            readTime: `${Math.ceil((post.content?.length || 500) / 500)} min read`,
            views: post.students || 120,
            likes: post.downloads || 15,
            imageUrl: post.thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
            gradient: 'from-blue-500 to-purple-600',
            requiresLogin: post.is_premium
          }));
          setPosts(formattedPosts);
        }
      } catch (err) {
        console.error("Error al cargar posts del blog:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, [supabase]);

  // Filtrado de publicaciones
  const filteredPosts = selectedCategory === 'all'
    ? posts
    : posts.filter(p => p.category === selectedCategory);

  const featuredPost = filteredPosts[0];
  const regularPosts = filteredPosts.slice(1);

  // 2. Manejar la apertura del editor
  const handleOpenWriteModal = () => {
    if (!currentUserId) {
      onLoginClick(); // Si no está autenticado, lo manda a login
    } else {
      setShowUploadModal(true);
    }
  };

  // Previsualización de imagen
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setWriteForm({ ...writeForm, coverImage: file });
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // 3. Guardar nueva publicación en la base de datos
  const handlePublishPost = async (e) => {
    e.preventDefault();
    if (!currentUserId) return;

    setIsUploading(true);

    try {
      let coverUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80';

      // Subir imagen a storage si el usuario seleccionó una
      if (writeForm.coverImage) {
        const coverExt = writeForm.coverImage.name.split('.').pop();
        const coverName = `${currentUserId}-${Date.now()}.${coverExt}`;
        const { error: uploadErr } = await supabase.storage.from('covers').upload(coverName, writeForm.coverImage);

        if (!uploadErr) {
          coverUrl = supabase.storage.from('covers').getPublicUrl(coverName).data.publicUrl;
        }
      }

      // Guardar fila en tabla posts
      const { data, error: dbError } = await supabase
        .from('posts')
        .insert({
          author_id: currentUserId,
          title: writeForm.title,
          description: writeForm.excerpt,
          content: writeForm.content,
          category: writeForm.category,
          thumbnail: coverUrl,
          is_premium: false // Los artículos de blog públicos son gratuitos por defecto
        })
        .select(`*, profiles:author_id (full_name, avatar_url)`)
        .single();

      if (dbError) throw dbError;

      // Actualizar UI
      const newFormattedPost = {
        id: data.id,
        title: data.title,
        excerpt: data.description,
        content: data.content,
        category: data.category,
        author: data.profiles?.full_name || 'Usuario',
        authorAvatar: data.profiles?.avatar_url || '👤',
        readTime: '3 min read',
        views: 1,
        likes: 0,
        imageUrl: data.thumbnail,
        gradient: 'from-cyan-500 to-blue-500',
        requiresLogin: false
      };

      setPosts(prev => [newFormattedPost, ...prev]);
      setShowUploadModal(false);
      setWriteForm({ title: '', excerpt: '', content: '', category: 'marketing', coverImage: null });
      setCoverPreview(null);
      alert('🎉 ¡Artículo publicado exitosamente en el Blog!');

    } catch (err) {
      console.error("Error al publicar en el blog:", err);
      alert("Hubo un error al guardar tu publicación.");
    } finally {
      setIsUploading(false);
    }
  };

  const PostCard = ({ post, isFeatured = false }) => {
    const isLocked = post.requiresLogin;

    return (
      <div
        onClick={() => isLocked ? onLoginClick() : setSelectedPost(post)}
        className={`${isFeatured ? 'md:col-span-2' : ''} bg-gray-900 border border-cyan-500/20 rounded-2xl overflow-hidden hover:border-cyan-500/50 transition-all group cursor-pointer relative`}
      >
        {isLocked && (
          <div className="absolute top-4 right-4 z-10 bg-cyan-500/90 backdrop-blur-sm px-3 py-2 rounded-full flex items-center gap-2">
            <Lock size={16} className="text-white" />
            <span className="text-white text-sm font-bold font-sans">Sign in to read</span>
          </div>
        )}

        <div className={`${isFeatured ? 'md:flex' : ''}`}>
          <div className={`${isFeatured ? 'md:w-1/2' : ''} h-64 overflow-hidden relative`}>
            <img
              src={post.imageUrl}
              alt={post.title}
              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${isLocked ? 'blur-sm' : ''}`}
            />
            <div className={`absolute inset-0 bg-gradient-to-t ${post.gradient} opacity-20 group-hover:opacity-30 transition-opacity`}></div>
          </div>

          <div className={`${isFeatured ? 'md:w-1/2' : ''} p-6 flex flex-col justify-between`}>
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className={`px-3 py-1 bg-gradient-to-r ${post.gradient} rounded-full`}>
                  <span className="text-white text-xs font-semibold capitalize">{post.category}</span>
                </div>
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
                    <img src={post.authorAvatar} alt="Autor" className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <div className="text-lg">{post.authorAvatar}</div>
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
              </div>

              {isLocked && (
                <div className="mt-4 pt-4 border-t border-gray-800">
                  <div className="flex items-center justify-between text-cyan-400">
                    <span className="text-sm font-semibold">Únete para leer más</span>
                    <ChevronRight size={20} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <nav className="fixed top-0 w-full z-40 bg-black/80 backdrop-blur-md border-b border-cyan-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
                </svg>
              </div>
              <span className="text-white font-bold text-xl">Indasocial</span>
              <span className="text-gray-500 mx-2">/</span>
              <span className="text-cyan-400 font-semibold">Blog</span>
            </div>

            <div className="flex items-center gap-3">
              {/* 🚀 BOTÓN WRITE POST */}
              <button
                onClick={handleOpenWriteModal}
                className="px-4 py-2 bg-gray-800 text-cyan-400 border border-cyan-500/30 rounded-lg font-semibold hover:bg-gray-700 transition-all flex items-center gap-2 text-sm"
              >
                <PenSquare size={16} />
                Write Post
              </button>

              <button
                onClick={onLoginClick}
                className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all text-sm"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-12">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 text-transparent bg-clip-text">
              Stories from the IndaSocial Community
            </h1>
            <p className="text-xl text-gray-400">
              Discover insights, trends, and stories from creators and brands shaping the future of Web3
            </p>
          </div>
        </div>

        {/* Featured Post */}
        {featuredPost && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={20} className="text-cyan-400" />
              <span className="text-cyan-400 font-semibold">Featured Story</span>
            </div>
            <PostCard post={featuredPost} isFeatured={true} />
          </section>
        )}

        {/* Category Filters */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Posts Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : regularPosts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No hay publicaciones adicionales en esta categoría.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {regularPosts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </section>

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
          <div className="bg-gradient-to-r from-cyan-900/30 to-purple-900/30 border border-cyan-500/20 rounded-2xl p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Join the Community</h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Get access to exclusive content, connect with creators and brands, and earn INDA tokens
            </p>
            <button
              onClick={onLoginClick}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-bold text-lg hover:from-cyan-600 hover:to-blue-600 transition-all inline-flex items-center gap-2"
            >
              Get Started
              <ChevronRight size={24} />
            </button>
          </div>
        </section>
      </div>

      {/* Post Reader */}
      {selectedPost && (
        <PostReader
          post={selectedPost}
          isOpen={!!selectedPost}
          onClose={() => setSelectedPost(null)}
          onUnlock={() => { }}
        />
      )}

      {/* 🚀 MODAL WRITE POST */}
      {showWriteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-gray-900 border border-cyan-500/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-cyan-500/20">
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-6 flex items-center justify-between sticky top-0 z-10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <PenSquare size={24} /> Escribir Artículo
              </h2>
              <button onClick={() => setShowUploadModal(false)} className="text-white hover:bg-white/20 rounded-lg p-2 transition-all"><X size={20} /></button>
            </div>

            <form onSubmit={handlePublishPost} className="p-6 space-y-4">
              {/* Portada */}
              <div>
                <label className="block text-sm text-gray-400 mb-2 font-semibold">Imagen de Portada</label>
                <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-xl cursor-pointer hover:bg-gray-800 border-gray-700 hover:border-cyan-500 transition-all overflow-hidden relative">
                  {coverPreview ? (
                    <img src={coverPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <ImageIcon className="w-8 h-8 mb-2 text-gray-400" />
                      <p className="text-xs text-gray-400">Click para seleccionar imagen</p>
                    </div>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1 font-semibold">Título del Artículo</label>
                <input
                  required
                  type="text"
                  value={writeForm.title}
                  onChange={e => setWriteForm({ ...writeForm, title: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                  placeholder="Ej. El futuro de las marcas en Web3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1 font-semibold">Categoría</label>
                  <select
                    value={writeForm.category}
                    onChange={e => setWriteForm({ ...writeForm, category: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                  >
                    {categories.filter(c => c.id !== 'all').map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1 font-semibold">Resumen Corto</label>
                  <input
                    required
                    type="text"
                    value={writeForm.excerpt}
                    onChange={e => setWriteForm({ ...writeForm, excerpt: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                    placeholder="Breve introducción..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1 font-semibold">Contenido del Artículo</label>
                <textarea
                  required
                  rows={6}
                  value={writeForm.content}
                  onChange={e => setWriteForm({ ...writeForm, content: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-cyan-500 resize-none"
                  placeholder="Escribe todo el contenido de tu post aquí..."
                />
              </div>

              <button
                type="submit"
                disabled={isUploading}
                className="w-full mt-4 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 transition-all flex justify-center items-center gap-2"
              >
                {isUploading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Upload size={20} /> Publicar Artículo
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogPublic;