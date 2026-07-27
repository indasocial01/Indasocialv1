import React, { useState } from 'react';
import Link from 'next/link';
import { Clock, Heart, MessageCircle, Eye, TrendingUp, Lock, ChevronRight } from 'lucide-react';
import PostReader from '../components/PostReader';
import { categories, publicFreePosts, publicPremiumPosts } from '../data/blogData';

const PublicBlog = ({ onLoginClick }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPost, setSelectedPost] = useState(null);

  const allPosts = [...publicFreePosts, ...publicPremiumPosts];
  const filteredPosts = selectedCategory === 'all' 
    ? allPosts 
    : allPosts.filter(p => p.category === selectedCategory);

  const PostCard = ({ post }) => {
    const isLocked = post.requiresLogin;

    return (
      <div 
        onClick={() => isLocked ? onLoginClick() : setSelectedPost(post)}
        className="bg-slate-900/80 border border-white/10 rounded-2xl overflow-hidden hover:border-cyan-500/50 transition-all group cursor-pointer"
      >
        {/* Image with Lock Badge */}
        <div className="relative h-64 overflow-hidden">
          <img 
            src={post.imageUrl} 
            alt={post.title}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${isLocked ? 'blur-[5px]' : ''}`}
          />
          <div className={`absolute inset-0 bg-gradient-to-t ${post.gradient} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
          
          {isLocked && (
            <div className="absolute top-4 right-4 z-10 bg-cyan-500/90 backdrop-blur-sm px-3 py-2 rounded-full flex items-center gap-2">
              <Lock size={16} className="text-white" />
              <span className="text-white text-sm font-bold">Sign in to read</span>
            </div>
          )}

          {!isLocked && (
            <div className="absolute top-4 left-4 z-10 bg-green-500/90 backdrop-blur-sm px-3 py-1 rounded-full">
              <span className="text-white text-xs font-bold">FREE</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={14} className="text-gray-400" />
            <span className="text-gray-400 text-sm">{post.readTime}</span>
          </div>

          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors line-clamp-2">
            {post.title}
          </h3>
          
          <p className="text-gray-400 text-sm mb-4 line-clamp-2">
            {post.excerpt}
          </p>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="text-2xl">{post.authorAvatar}</div>
              <div>
                <div className="text-white text-sm font-semibold">{post.author}</div>
                <div className="text-gray-500 text-xs">{post.authorBio || post.category}</div>
              </div>
            </div>
          </div>

          {isLocked ? (
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <span className="text-cyan-400 text-sm font-semibold">Únete para leer más</span>
              <ChevronRight size={20} className="text-cyan-400" />
            </div>
          ) : (
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <span className="text-cyan-400 text-sm font-semibold">Click to read full article</span>
              <ChevronRight size={20} className="text-cyan-400" />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Public Header */}
      <nav className="fixed top-0 w-full z-40 bg-slate-900/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                </svg>
              </div>
              <span className="text-white font-bold text-xl">Indasocial</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-gray-300 hover:text-white transition-colors">Home</Link>
              <a href="#blog" className="text-cyan-400 font-semibold">Blog</a>
              <a href="#community" className="text-gray-300 hover:text-white transition-colors">Community</a>
            </div>

            <button
              onClick={onLoginClick}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-white">Community </span>
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Insights
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Stories, strategies, and insights from the IndaSocial community
          </p>
        </div>
      </div>

      {/* Categories */}
      <div className="border-b border-white/10 bg-slate-900/50 backdrop-blur-sm sticky top-16 z-30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-3 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
                selectedCategory === cat.id 
                  ? 'bg-cyan-500 text-white' 
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {cat.label} ({cat.count})
            </button>
          ))}
        </div>
      </div>

      {/* Free Content Section */}
      <div className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={24} className="text-green-400" />
            <h2 className="text-2xl font-bold text-white">Free Articles</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {publicFreePosts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {/* Premium Content Section */}
          {publicPremiumPosts.length > 0 && (
            <>
              <div className="flex items-center gap-2 mb-6">
                <Lock size={24} className="text-cyan-400" />
                <h2 className="text-2xl font-bold text-white">Premium Content</h2>
                <span className="text-sm text-gray-400">(Sign in required)</span>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {publicPremiumPosts.map(post => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-white/10 rounded-3xl p-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Join the Community
            </h2>
            <p className="text-xl text-gray-300 mb-8">
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
        </div>
      </div>

      {/* Post Reader Modal */}
      {selectedPost && (
        <PostReader
          post={selectedPost}
          isOpen={!!selectedPost}
          onClose={() => setSelectedPost(null)}
          onUnlock={() => {}} // No unlock in public blog
        />
      )}
    </div>
  );
};

export default PublicBlog;