"use client";
import React, { useState, useEffect } from 'react';
import {
  BookOpen, Video, FileText, Download, Star, ShoppingCart,
  Plus, DollarSign, Users, TrendingUp, Play, Lock, CheckCircle,
  Filter, Search, Upload, Eye, X, Image as ImageIcon
} from 'lucide-react';
import Header from '../components/Header';
import { createClient } from '@/utils/supabase/client';

const LearnEarn = ({ userType }) => {
  const supabase = createClient();
  const [currentUserId, setCurrentUserId] = useState(null);

  const [activeTab, setActiveTab] = useState('free');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);

  const [freeContent, setFreeContent] = useState([]);
  const [premiumContent, setPremiumContent] = useState([]);
  const [myContent, setMyContent] = useState([]);
  const [purchases, setPurchases] = useState([]);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  // Estado del formulario de subida
  const [isUploading, setIsUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    category: 'marketing',
    coverImage: null,
    contentFile: null,
    isFree: true,
    price: 0
  });
  const [coverPreview, setCoverPreview] = useState(null);

  const categories = [
    { id: 'all', name: 'All', icon: BookOpen },
    { id: 'marketing', name: 'Marketing', icon: TrendingUp },
    { id: 'design', name: 'Design', icon: FileText },
    { id: 'business', name: 'Business', icon: Users },
    { id: 'tech', name: 'Technology', icon: Video }
  ];

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserId(user.id);

      // Usamos profiles:author_id para hacer el JOIN correcto
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`*, profiles:author_id (full_name, avatar_url)`)
        .order('created_at', { ascending: false });

      if (!postsError && postsData) {
        const formattedPosts = postsData.map(post => ({
          id: post.id,
          author_id: post.author_id,
          title: post.title || 'Sin Título',
          type: 'resource',
          category: post.category || 'marketing',
          author: post.profiles?.full_name || 'Usuario',
          authorAvatar: post.profiles?.avatar_url || '👤',
          fileUrl: post.content || '',
          price: post.price || 0,
          students: post.students || Math.floor(Math.random() * 500) + 10,
          downloads: post.downloads || Math.floor(Math.random() * 200) + 5,
          rating: post.rating || 4.8,
          thumbnail: post.thumbnail || '📚',
          isFree: !post.is_premium,
          bestseller: post.bestseller || false
        }));

        setFreeContent(formattedPosts.filter(p => p.isFree));
        setPremiumContent(formattedPosts.filter(p => !p.isFree));
        setMyContent(formattedPosts.filter(p => p.author_id === user.id));
      }

      const { data: unlocksData } = await supabase
        .from('post_unlocks')
        .select(`post_id, posts (*, profiles:author_id (full_name, avatar_url))`)
        .eq('user_id', user.id);

      if (unlocksData) {
        const myPurchases = unlocksData
          .map(u => u.posts)
          .filter(Boolean)
          .map(post => ({
            id: post.id,
            title: post.title,
            fileUrl: post.content,
            author: post.profiles?.full_name || 'Usuario',
            authorAvatar: post.profiles?.avatar_url || '👤',
            thumbnail: post.thumbnail || '📚',
            isFree: !post.is_premium,
            price: post.price || 0,
          }));
        setPurchases(myPurchases);
      }

      const savedCart = localStorage.getItem('cart');
      if (savedCart) setCart(JSON.parse(savedCart));
    };

    fetchData();
  }, [supabase]);

  const filterContent = (content) => {
    return content.filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  };

  const addToCart = (item) => {
    if (cart.find(i => i.id === item.id)) {
      alert('Item already in cart!');
      return;
    }
    setCart([...cart, item]);
    localStorage.setItem('cart', JSON.stringify([...cart, item]));
  };

  const removeFromCart = (itemId) => {
    const newCart = cart.filter(i => i.id !== itemId);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const handleCheckout = async () => {
    if (cart.length === 0 || !currentUserId) return;

    const unlocksToInsert = cart.map(item => ({
      user_id: currentUserId,
      post_id: item.id
    }));

    const { error } = await supabase.from('post_unlocks').insert(unlocksToInsert);

    if (error) {
      console.error("Error al procesar la compra:", error);
      alert('Hubo un error procesando tu compra.');
      return;
    }

    setPurchases(prev => [...prev, ...cart]);
    setCart([]);
    localStorage.removeItem('cart');
    setShowCheckout(false);
    alert('🎉 ¡Compra exitosa! Revisa la pestaña "My Purchases" para descargar tu contenido.');
  };

  // Subida de contenido usando author_id
  const handleUploadContent = async (e) => {
    e.preventDefault();
    if (!currentUserId) return;

    if (!uploadForm.coverImage || !uploadForm.contentFile) {
      alert("Por favor selecciona una imagen de portada y un archivo PDF.");
      return;
    }

    setIsUploading(true);

    try {
      // 1. Subir Portada a 'covers'
      const coverExt = uploadForm.coverImage.name.split('.').pop();
      const coverName = `${currentUserId}-${Date.now()}.${coverExt}`;

      const { error: coverError } = await supabase.storage
        .from('covers')
        .upload(coverName, uploadForm.coverImage);
      if (coverError) throw coverError;

      const coverUrl = supabase.storage.from('covers').getPublicUrl(coverName).data.publicUrl;

      // 2. Subir PDF a 'contents'
      const fileExt = uploadForm.contentFile.name.split('.').pop();
      const fileName = `${currentUserId}-${Date.now()}.${fileExt}`;

      const { error: fileError } = await supabase.storage
        .from('contents')
        .upload(fileName, uploadForm.contentFile);
      if (fileError) throw fileError;

      const fileUrl = supabase.storage.from('contents').getPublicUrl(fileName).data.publicUrl;

      // 3. Guardar en la tabla 'posts' usando author_id
      const { data, error: dbError } = await supabase
        .from('posts')
        .insert({
          author_id: currentUserId, // 👈 Se usa author_id
          title: uploadForm.title,
          content: fileUrl,
          category: uploadForm.category,
          thumbnail: coverUrl,
          is_premium: !uploadForm.isFree,
          price: uploadForm.isFree ? 0 : Number(uploadForm.price),
        })
        .select(`*, profiles:author_id (full_name, avatar_url)`)
        .single();

      if (dbError) throw dbError;

      const newPost = {
        id: data.id,
        author_id: data.author_id,
        title: data.title,
        type: 'resource',
        category: data.category,
        author: data.profiles?.full_name || 'Usuario',
        authorAvatar: data.profiles?.avatar_url || '👤',
        fileUrl: data.content,
        price: data.price,
        rating: 5.0,
        downloads: 0,
        students: 0,
        thumbnail: data.thumbnail,
        isFree: !data.is_premium,
        bestseller: false
      };

      setMyContent(prev => [newPost, ...prev]);
      if (newPost.isFree) setFreeContent(prev => [newPost, ...prev]);
      else setPremiumContent(prev => [newPost, ...prev]);

      setShowUploadModal(false);
      setUploadForm({ title: '', category: 'marketing', coverImage: null, contentFile: null, isFree: true, price: 0 });
      setCoverPreview(null);
      alert('🎉 ¡Contenido publicado exitosamente!');

    } catch (error) {
      console.error("Error subiendo el contenido:", error);
      alert("Hubo un problema al publicar tu contenido.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadForm({ ...uploadForm, coverImage: file });
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const ContentCard = ({ item, showPrice = true }) => {
    const isPurchased = purchases.some(p => p.id === item.id);
    const inCart = cart.some(c => c.id === item.id);
    const isMyOwnContent = item.author_id === currentUserId;

    const handleAccessContent = () => {
      if (item.fileUrl) {
        window.open(item.fileUrl, '_blank');
      } else {
        alert("El archivo no está disponible.");
      }
    };

    return (
      <div className="bg-gray-900 border border-cyan-500/30 rounded-2xl overflow-hidden hover:border-cyan-500/50 transition-all flex flex-col h-full">
        <div className="h-48 bg-gradient-to-br from-cyan-900/30 to-blue-900/30 flex items-center justify-center relative overflow-hidden">
          {item.thumbnail?.includes('http') ? (
            <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover transition-transform hover:scale-105" />
          ) : (
            <div className="text-6xl">{item.thumbnail}</div>
          )}
          {item.bestseller && (
            <div className="absolute top-3 left-3 px-3 py-1 bg-yellow-500 text-black text-xs font-bold rounded-full z-10">
              ⭐ BESTSELLER
            </div>
          )}
          {item.isFree && (
            <div className="absolute top-3 right-3 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full z-10">
              FREE
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
        </div>

        <div className="p-5 flex flex-col flex-1">
          <h3 className="text-white font-bold mb-3 line-clamp-2">{item.title}</h3>

          <div className="flex items-center gap-2 mb-4">
            {item.authorAvatar?.includes('http') ? (
              <img src={item.authorAvatar} alt="Autor" className="w-6 h-6 rounded-full object-cover" />
            ) : (
              <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                {item.authorAvatar}
              </div>
            )}
            <span className="text-gray-400 text-xs">{item.author}</span>
          </div>

          <div className="mt-auto">
            <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
              {item.downloads >= 0 && (
                <span className="flex items-center gap-1"><Download size={12} />{item.downloads}</span>
              )}
              <span className="flex items-center gap-1"><Star size={12} className="text-yellow-400" />{item.rating}</span>
            </div>

            {showPrice && (
              <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                {item.isFree ? (
                  <span className="text-green-400 font-bold">GRATIS</span>
                ) : (
                  <span className="text-white font-bold text-xl">${item.price}</span>
                )}

                {item.isFree || isMyOwnContent || isPurchased ? (
                  <button
                    onClick={handleAccessContent}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 text-sm flex items-center gap-2"
                  >
                    <Download size={16} /> Descargar PDF
                  </button>
                ) : inCart ? (
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="px-4 py-2 bg-red-500/20 border border-red-500 text-red-400 rounded-lg font-semibold hover:bg-red-500/30 text-sm"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    onClick={() => addToCart(item)}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 text-sm flex items-center gap-2"
                  >
                    <ShoppingCart size={16} /> Add to Cart
                  </button>
                )}
              </div>
            )}

            {!showPrice && (
              <button
                onClick={handleAccessContent}
                className="w-full mt-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 text-sm flex items-center justify-center gap-2"
              >
                <Download size={16} /> Descargar PDF
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 bg-black text-white flex flex-col">
      <Header
        title="Learn & Earn"
        subtitle="Sube, vende y accede a recursos en formato PDF"
      />

      <div className="flex-1 overflow-y-auto p-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar recursos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowCheckout(true)}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 flex items-center gap-2 relative"
          >
            <ShoppingCart size={20} />
            Cart
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">
                {cart.length}
              </span>
            )}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-8 border-b border-gray-800">
          <button
            onClick={() => setActiveTab('free')}
            className={`px-6 py-3 font-semibold transition-all relative ${activeTab === 'free' ? 'text-green-400' : 'text-gray-400 hover:text-white'}`}
          >
            🆓 Contenido Gratis
            {activeTab === 'free' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-400"></div>}
          </button>
          <button
            onClick={() => setActiveTab('premium')}
            className={`px-6 py-3 font-semibold transition-all relative ${activeTab === 'premium' ? 'text-cyan-400' : 'text-gray-400 hover:text-white'}`}
          >
            💎 Premium
            {activeTab === 'premium' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400"></div>}
          </button>
          <button
            onClick={() => setActiveTab('purchases')}
            className={`px-6 py-3 font-semibold transition-all relative ${activeTab === 'purchases' ? 'text-purple-400' : 'text-gray-400 hover:text-white'}`}
          >
            📚 Mis Compras ({purchases.length})
            {activeTab === 'purchases' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400"></div>}
          </button>
          {(userType === 'creator' || userType === 'brand') && (
            <button
              onClick={() => setActiveTab('mycontent')}
              className={`px-6 py-3 font-semibold transition-all relative ${activeTab === 'mycontent' ? 'text-orange-400' : 'text-gray-400 hover:text-white'}`}
            >
              📤 Mi Contenido
              {activeTab === 'mycontent' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-400"></div>}
            </button>
          )}
        </div>

        {/* Grids */}
        {activeTab === 'free' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filterContent(freeContent).map(item => <ContentCard key={item.id} item={item} />)}
          </div>
        )}

        {activeTab === 'premium' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filterContent(premiumContent).map(item => <ContentCard key={item.id} item={item} />)}
          </div>
        )}

        {activeTab === 'purchases' && (
          <div>
            {purchases.length === 0 ? (
              <div className="text-center py-12 bg-gray-900 rounded-2xl border border-cyan-500/20">
                <BookOpen size={48} className="text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No has comprado nada aún</p>
                <p className="text-gray-500 text-sm mt-2">Explora el contenido premium para empezar a aprender</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {purchases.map(item => <ContentCard key={item.id} item={item} showPrice={false} />)}
              </div>
            )}
          </div>
        )}

        {activeTab === 'mycontent' && (
          <div>
            <div className="mb-6 flex justify-end">
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-600 flex items-center gap-2"
              >
                <Plus size={20} /> Subir Nuevo Contenido
              </button>
            </div>
            {myContent.length === 0 ? (
              <div className="text-center py-12 bg-gray-900 rounded-2xl border border-cyan-500/20">
                <Upload size={48} className="text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No has subido contenido aún</p>
                <p className="text-gray-500 text-sm mt-2">¡Sube un PDF y empieza a generar ingresos!</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filterContent(myContent).map(item => <ContentCard key={item.id} item={item} showPrice={true} />)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-gray-900 border border-cyan-500/30 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl shadow-cyan-500/20">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <ShoppingCart size={24} /> Checkout
              </h2>
              <button onClick={() => setShowCheckout(false)} className="text-white hover:bg-white/20 rounded-lg p-2 transition-all"><X size={20} /></button>
            </div>

            <div className="p-6">
              {cart.length === 0 ? (
                <div className="text-center py-8"><p className="text-gray-400">Your cart is empty</p></div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map(item => (
                      <div key={item.id} className="flex items-center justify-between bg-gray-800 border border-gray-700 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                            <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <h3 className="text-white font-semibold line-clamp-1 max-w-[200px] md:max-w-xs">{item.title}</h3>
                            <p className="text-gray-400 text-sm">{item.author}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-white font-bold">${item.price}</span>
                          <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-300 w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-500/10 transition-all">✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-800 pt-4 mb-6">
                    <div className="flex items-center justify-between text-xl font-bold">
                      <span className="text-white">Total:</span>
                      <span className="text-green-400">${cart.reduce((sum, item) => sum + item.price, 0)}</span>
                    </div>
                  </div>
                  <button onClick={handleCheckout} className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 text-lg transition-all">
                    Pagar y Desbloquear Contenido
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-gray-900 border border-cyan-500/30 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-cyan-500/20">
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-6 flex items-center justify-between sticky top-0 z-10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Upload size={24} /> Publicar Nuevo Recurso
              </h2>
              <button onClick={() => setShowUploadModal(false)} className="text-white hover:bg-white/20 rounded-lg p-2 transition-all"><X size={20} /></button>
            </div>

            <form onSubmit={handleUploadContent} className="p-6 space-y-6">

              {/* Portada */}
              <div>
                <label className="block text-sm text-gray-400 mb-2 font-semibold">1. Imagen de Portada (JPG/PNG)</label>
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
                    <input required type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                </div>
              </div>

              {/* PDF */}
              <div>
                <label className="block text-sm text-gray-400 mb-2 font-semibold">2. Archivo del Recurso (PDF)</label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer hover:bg-gray-800 border-gray-700 hover:border-cyan-500 transition-all">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FileText className={`w-8 h-8 mb-2 ${uploadForm.contentFile ? 'text-green-400' : 'text-gray-400'}`} />
                      <p className="text-sm text-gray-400">
                        {uploadForm.contentFile ? (
                          <span className="text-green-400 font-semibold">{uploadForm.contentFile.name}</span>
                        ) : (
                          <><span className="font-semibold text-cyan-400">Click para subir tu PDF</span></>
                        )}
                      </p>
                    </div>
                    <input
                      required
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={e => setUploadForm({ ...uploadForm, contentFile: e.target.files[0] })}
                    />
                  </label>
                </div>
              </div>

              {/* Info básica */}
              <div className="space-y-4 pt-4 border-t border-gray-800">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Título del Recurso</label>
                  <input
                    required
                    type="text"
                    value={uploadForm.title}
                    onChange={e => setUploadForm({ ...uploadForm, title: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                    placeholder="Ej. Guía maestra de Ventas"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Categoría</label>
                  <select
                    value={uploadForm.category}
                    onChange={e => setUploadForm({ ...uploadForm, category: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                  >
                    {categories.filter(c => c.id !== 'all').map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                  <label className="block text-sm text-gray-400 mb-3">Modelo de Monetización</label>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer text-white">
                      <input
                        type="radio"
                        name="priceType"
                        checked={uploadForm.isFree}
                        onChange={() => setUploadForm({ ...uploadForm, isFree: true, price: 0 })}
                        className="w-4 h-4 text-cyan-500 bg-gray-900 border-gray-700"
                      />
                      Gratis
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-white">
                      <input
                        type="radio"
                        name="priceType"
                        checked={!uploadForm.isFree}
                        onChange={() => setUploadForm({ ...uploadForm, isFree: false })}
                        className="w-4 h-4 text-cyan-500 bg-gray-900 border-gray-700"
                      />
                      Premium
                    </label>
                  </div>

                  {!uploadForm.isFree && (
                    <div className="mt-4 animate-fadeIn">
                      <label className="block text-sm text-gray-400 mb-1">Precio ($USD)</label>
                      <input
                        required={!uploadForm.isFree}
                        type="number"
                        min="1"
                        value={uploadForm.price}
                        onChange={e => setUploadForm({ ...uploadForm, price: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                        placeholder="Ej. 19"
                      />
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isUploading}
                className="w-full mt-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 transition-all flex justify-center items-center gap-2 shadow-lg shadow-cyan-500/20"
              >
                {isUploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Subiendo archivos...
                  </>
                ) : (
                  <>
                    <Upload size={20} /> Publicar Recurso
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

export default LearnEarn;