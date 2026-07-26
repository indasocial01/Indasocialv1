import React, { useState } from 'react';
import { X, Image as ImageIcon, Send, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createClient } from '@/utils/supabase/client';

const WritePost = ({ isOpen, onClose, onPostCreated }) => {
  const { currentUser } = useAuth();
  const supabase = createClient();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('reviews');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { id: 'reviews', label: 'Reseña', icon: '⭐' },
    { id: 'interviews', label: 'Entrevista', icon: '🎤' },
    { id: 'events', label: 'Evento', icon: '🎉' }
  ];

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert('Por favor completa título y contenido');
      return;
    }

    if (!currentUser?.id) {
      alert('Debes iniciar sesión para publicar');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          author_id: currentUser.id,
          title: title.trim(),
          content: content.trim(),
          excerpt: content.trim().slice(0, 140),
          is_premium: false,
          token_cost: 0,
          status: 'published',
          published_at: new Date().toISOString(),
        })
        .select('*')
        .single();

      if (error) throw error;

      const newPost = {
        id: data.id,
        title: data.title,
        excerpt: data.excerpt || data.content?.slice(0, 140),
        fullContent: data.content,
        author: currentUser?.name || 'User',
        authorAvatar: currentUser?.avatar || '👤',
        authorBio: currentUser?.category || 'Creator',
        date: new Date(data.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        category,
        readTime: `${Math.max(1, Math.ceil((data.content?.split(/\s+/).length || 0) / 200))} min`,
        gradient: 'from-cyan-500 to-blue-600',
        imageUrl: imagePreview || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
        views: 0,
        likes: 0,
        comments: 0,
        rewards: 0,
        featured: false,
        requiresTokens: false,
        unlockCost: 0,
        isUnlocked: true,
        isPremium: false,
        content: data.content,
        author_id: currentUser.id,
      };

      onPostCreated(newPost);

      setTitle('');
      setContent('');
      setImagePreview(null);
      setImageFile(null);
      onClose();
    } catch (error) {
      console.error('Error al publicar el post:', error);
      alert('No se pudo publicar el post. Revisa la conexión con Supabase.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-cyan-500/30 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 border-b border-cyan-500/20 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Crear Nuevo Post</h2>
            <p className="text-gray-400 text-sm mt-1">Comparte tu contenido con la comunidad</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <X className="text-gray-400" size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Título del Post</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Escribe un título llamativo..."
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
              maxLength={100}
            />
            <div className="text-right text-xs text-gray-500 mt-1">{title.length}/100</div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Categoría</label>
            <div className="grid grid-cols-3 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    category === cat.id ? 'border-cyan-500 bg-cyan-500/20 text-cyan-400' : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <div className="text-2xl mb-1">{cat.icon}</div>
                  <div className="text-sm font-semibold">{cat.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Imagen de Portada</label>
            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden">
                <img src={imagePreview} alt="Preview" className="w-full h-64 object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setImageFile(null);
                  }}
                  className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>
            ) : (
              <label className="block w-full h-64 border-2 border-dashed border-gray-700 rounded-xl hover:border-cyan-500 transition-colors cursor-pointer">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <ImageIcon size={48} className="mb-3" />
                  <p className="font-semibold">Click para subir imagen</p>
                  <p className="text-sm text-gray-500 mt-1">PNG, JPG, GIF (max 5MB)</p>
                </div>
              </label>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Contenido</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escribe tu contenido aquí..."
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors min-h-[300px] resize-y"
              maxLength={5000}
            />
            <div className="flex items-center justify-between mt-2">
              <div className="text-xs text-gray-500">{content.split(/\s+/).filter(Boolean).length} palabras • ~{Math.max(1, Math.ceil(content.split(/\s+/).filter(Boolean).length / 200))} min lectura</div>
              <div className="text-xs text-gray-500">{content.length}/5000</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border border-cyan-500/30 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-cyan-500/20 rounded-lg">
                <Award className="text-cyan-400" size={24} />
              </div>
              <div>
                <h4 className="font-semibold text-white">Gana INDA Tokens</h4>
                <p className="text-sm text-gray-400">Tus publicaciones pueden generar engagement y reputación dentro de la comunidad.</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-semibold transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting || !title.trim() || !content.trim()} className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Publicando...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Publicar Post
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WritePost;
