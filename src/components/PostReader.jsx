import React, { useState } from 'react';
import { X, Clock, Eye, Heart, MessageCircle, Award, Lock, Unlock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PostReader = ({ post, isOpen, onClose, onUnlock }) => {
  const { currentUser } = useAuth();
  const [isUnlocking, setIsUnlocking] = useState(false);

  if (!isOpen || !post) return null;

  const handleUnlock = () => {
    setIsUnlocking(true);
    setTimeout(() => {
      onUnlock(post.id);
      setIsUnlocking(false);
    }, 1000);
  };

  // Post is locked if:
  // 1. Requires tokens AND not unlocked (community blog)
  // 2. Requires login AND not unlocked (public blog locked posts)
  // Free public posts have neither flag set
  const isLocked = (post.requiresTokens && !post.isUnlocked) || (post.requiresLogin && !currentUser);
  const canAfford = currentUser?.indaBalance >= (post.unlockCost || 0);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen flex items-start justify-center p-4 py-12">
        <div className="bg-gray-900 border border-cyan-500/30 rounded-2xl max-w-4xl w-full">
          {/* Header Image */}
          {post.imageUrl && (
            <div className="relative h-96 rounded-t-2xl overflow-hidden">
              <img 
                src={post.imageUrl} 
                alt={post.title}
                className={`w-full h-full object-cover ${isLocked ? 'blur-[0.15px]' : ''}`}
              />
              {isLocked && (
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent flex items-center justify-center">
                  <div className="text-center">
                    <Lock className="text-yellow-400 mx-auto mb-4" size={64} />
                    <h3 className="text-2xl font-bold text-white mb-2">Contenido Bloqueado</h3>
                    <p className="text-gray-400">Desbloquea con {post.unlockCost} INDA tokens</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Header */}
          <div className="p-8 border-b border-cyan-500/20">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className={`inline-block px-3 py-1 bg-gradient-to-r ${post.gradient} rounded-full text-white text-xs font-semibold mb-3`}>
                  {post.category}
                </div>
                <h1 className="text-3xl font-bold text-white mb-3">{post.title}</h1>
                <p className="text-gray-400 text-lg">{post.excerpt}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors ml-4"
              >
                <X className="text-gray-400" size={24} />
              </button>
            </div>

            {/* Meta Info */}
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xl">
                  {post.authorAvatar}
                </div>
                <div>
                  <div className="text-white font-semibold">{post.author}</div>
                  <div className="text-xs">{post.authorBio}</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={16} />
                <span>{post.readTime}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye size={16} />
                <span>{post.views}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart size={16} />
                <span>{post.likes}</span>
              </div>
              {post.rewards && (
                <div className="flex items-center gap-1 text-yellow-400">
                  <Award size={16} />
                  <span>{post.rewards} INDA</span>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {isLocked ? (
              <div className="text-center py-12">
                <Lock className="text-yellow-400 mx-auto mb-6" size={80} />
                <h3 className="text-2xl font-bold text-white mb-4">Desbloquea Este Contenido</h3>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                  Este post premium requiere {post.unlockCost} INDA tokens para desbloquear. 
                  Una vez desbloqueado, tendrás acceso permanente.
                </p>

                <div className="bg-gray-800 border border-cyan-500/30 rounded-xl p-6 max-w-md mx-auto mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-400">Tu Balance:</span>
                    <span className="text-white font-bold text-xl">{currentUser?.indaBalance || 0} INDA</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Costo:</span>
                    <span className="text-yellow-400 font-bold text-xl">{post.unlockCost} INDA</span>
                  </div>
                </div>

                {canAfford ? (
                  <button
                    onClick={handleUnlock}
                    disabled={isUnlocking}
                    className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-xl font-bold text-lg transition-all disabled:opacity-50 flex items-center gap-2 mx-auto"
                  >
                    {isUnlocking ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Desbloqueando...
                      </>
                    ) : (
                      <>
                        <Unlock size={24} />
                        Desbloquear por {post.unlockCost} INDA
                      </>
                    )}
                  </button>
                ) : (
                  <div className="text-red-400">
                    <p className="mb-4">No tienes suficientes INDA tokens</p>
                    <button className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-semibold transition-colors">
                      Ganar Más INDA
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Article Content */}
                <div className="prose prose-invert max-w-none">
                  {post.fullContent?.split('\n\n').map((paragraph, idx) => {
                    if (!paragraph.trim()) return null;
                    
                    // Check if it's a heading
                    if (paragraph.startsWith('**') && paragraph.endsWith(':**')) {
                      return (
                        <h2 key={idx} className="text-2xl font-bold text-white mt-8 mb-4">
                          {paragraph.replace(/\*\*/g, '').replace(':', '')}
                        </h2>
                      );
                    }
                    // Check if it's a bullet list
                    if (paragraph.includes('•') || (paragraph.includes('\n') && paragraph.match(/^[\•\-]/m))) {
                      const items = paragraph.split('\n').filter(line => line.trim());
                      return (
                        <ul key={idx} className="list-disc list-inside text-gray-300 space-y-2 my-4">
                          {items.map((item, i) => (
                            <li key={i}>{item.replace(/^[•\-]\s*/, '')}</li>
                          ))}
                        </ul>
                      );
                    }
                    // Check if it's a quote
                    if (paragraph.startsWith('"') && paragraph.endsWith('"')) {
                      return (
                        <blockquote key={idx} className="border-l-4 border-cyan-500 pl-6 py-4 my-6 italic text-gray-300 bg-cyan-500/5 rounded-r-xl">
                          {paragraph}
                        </blockquote>
                      );
                    }
                    // Regular paragraph with bold text support
                    return (
                      <p key={idx} className="text-gray-300 leading-relaxed mb-4 text-lg">
                        {paragraph.split('**').map((part, i) => 
                          i % 2 === 1 ? <strong key={i} className="text-white font-bold">{part}</strong> : part
                        )}
                      </p>
                    );
                  })}
                </div>

                {/* Article Images Gallery */}
                {post.images && post.images.length > 0 && (
                  <div className="my-12">
                    <h3 className="text-xl font-bold text-white mb-6">Galería de Fotos</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {post.images.map((img, idx) => (
                        <div key={idx} className="overflow-hidden rounded-xl bg-gray-800">
                          <img 
                            src={img}
                            alt={`${post.title} - Imagen ${idx + 1}`}
                            className="w-full h-auto hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              console.log('Image failed to load:', img);
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-gray-500 text-sm mt-4 text-center">
                      {post.images.length} fotos del evento
                    </p>
                  </div>
                )}

                {/* Engagement Actions */}
                <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-800">
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors">
                    <Heart size={20} />
                    <span className="font-semibold">{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-cyan-500/20 hover:text-cyan-400 rounded-lg transition-colors">
                    <MessageCircle size={20} />
                    <span className="font-semibold">{post.comments}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostReader;
