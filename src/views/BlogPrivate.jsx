import React, { useState } from 'react';
import { Clock, Heart, MessageCircle, Eye, TrendingUp, Plus, Award } from 'lucide-react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';

const BlogPrivate = () => {
  const { currentUser } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showWriteModal, setShowWriteModal] = useState(false);

  const categories = [
    { id: 'all', label: 'All Stories', count: 12 },
    { id: 'sustainability', label: 'Sustainability', count: 4 },
    { id: 'innovation', label: 'Innovation', count: 3 },
    { id: 'fashion', label: 'Fashion', count: 3 },
    { id: 'business', label: 'Business', count: 2 }
  ];

  const blogPosts = [
    { id: 1, title: 'Building Sustainable Fashion Communities', excerpt: 'How Sarah creates authentic connections with eco-conscious brands...', author: 'Sarah Johnson', authorAvatar: '👩‍🦰', authorBio: 'Lifestyle Creator • 120k', date: 'Feb 18, 2026', category: 'sustainability', readTime: '5 min', gradient: 'from-green-500 to-emerald-600', views: '1.2k', likes: 89, comments: 12, featured: true, rewards: 50 },
    { id: 2, title: 'The Future of Creator Economy', excerpt: 'Blockchain technology is revolutionizing how creators earn and connect...', author: 'Alex Chen', authorAvatar: '👨', authorBio: 'Tech Expert', date: 'Feb 15, 2026', category: 'innovation', readTime: '8 min', gradient: 'from-purple-500 to-indigo-600', views: '2.5k', likes: 156, comments: 24, featured: true, rewards: 85 },
    { id: 3, title: 'How to Price Your Services', excerpt: 'A comprehensive guide to calculating your worth as a creator...', author: 'Maria Garcia', authorAvatar: '👩', authorBio: 'Business Coach', date: 'Feb 12, 2026', category: 'business', readTime: '6 min', gradient: 'from-orange-500 to-amber-600', views: '3.1k', likes: 234, comments: 45, rewards: 120 },
    { id: 4, title: 'Web3 Marketing Strategies', excerpt: 'Essential tactics for promoting your brand in the decentralized era...', author: 'David Kim', authorAvatar: '👨‍💼', authorBio: 'Marketing Guru', date: 'Feb 10, 2026', category: 'business', readTime: '7 min', gradient: 'from-blue-500 to-cyan-600', views: '1.8k', likes: 92, comments: 18, rewards: 65 },
    { id: 5, title: 'Sustainable Content Creation', excerpt: 'Tips for creating eco-friendly content that resonates with audiences...', author: 'Emma Wilson', authorAvatar: '👩‍🎨', authorBio: 'Eco Creator', date: 'Feb 8, 2026', category: 'sustainability', readTime: '5 min', gradient: 'from-green-500 to-teal-600', views: '900', likes: 45, comments: 8, rewards: 35 }
  ];

  const filteredPosts = selectedCategory === 'all' ? blogPosts : blogPosts.filter(p => p.category === selectedCategory);
  const featuredPost = blogPosts.find(p => p.featured);
  const regularPosts = filteredPosts.filter(p => !p.featured);

  return (
    <div className="flex-1 bg-black text-white flex flex-col">
      <Header 
        title="Community Blog"
        subtitle="Share your insights and earn rewards"
      />

      <div className="flex-1 overflow-y-auto">
        {/* Rewards Banner */}
        <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border-b border-yellow-500/20 px-8 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Award size={24} className="text-yellow-400" />
              <div>
                <div className="text-white font-semibold">Earn INDA tokens by creating quality content</div>
                <div className="text-gray-400 text-sm">Get rewarded based on engagement (views, likes, comments)</div>
              </div>
            </div>
            <button
              onClick={() => setShowWriteModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all flex items-center gap-2"
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
                <span className="ml-auto flex items-center gap-2 text-yellow-400 text-sm">
                  <Award size={16} />
                  {featuredPost.rewards} INDA earned
                </span>
              </div>
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-xs font-semibold">
                      {categories.find(c => c.id === featuredPost.category)?.label}
                    </span>
                    <span className="flex items-center gap-1 text-gray-400 text-xs">
                      <Clock size={14} />
                      {featuredPost.readTime}
                    </span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">{featuredPost.title}</h2>
                  <p className="text-gray-400 mb-6">{featuredPost.excerpt}</p>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-2xl">
                      {featuredPost.authorAvatar}
                    </div>
                    <div>
                      <div className="text-white font-semibold">{featuredPost.author}</div>
                      <div className="text-gray-400 text-sm">{featuredPost.authorBio}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-gray-400">
                    <div className="flex items-center gap-2"><Eye size={18} /><span className="text-sm">{featuredPost.views}</span></div>
                    <div className="flex items-center gap-2"><Heart size={18} /><span className="text-sm">{featuredPost.likes}</span></div>
                    <div className="flex items-center gap-2"><MessageCircle size={18} /><span className="text-sm">{featuredPost.comments}</span></div>
                  </div>
                  <button className="mt-6 px-6 py-3 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 transition-all font-semibold">
                    Read Full Story
                  </button>
                </div>
                <div className={`h-80 bg-gradient-to-br ${featuredPost.gradient} rounded-2xl`}></div>
              </div>
            </div>
          </section>
        )}

        {/* Category Filter */}
        <section className="border-b border-cyan-500/20 bg-dark-light py-4 px-8 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto flex items-center gap-3 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
                  selectedCategory === cat.id ? 'bg-cyan-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {cat.label} ({cat.count})
              </button>
            ))}
          </div>
        </section>

        {/* Posts Grid */}
        <section className="py-8 px-8">
          <div className="max-w-6xl mx-auto">
            {selectedCategory !== 'all' && (
              <h2 className="text-2xl font-bold mb-6">{categories.find(c => c.id === selectedCategory)?.label}</h2>
            )}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularPosts.map((post) => (
                <article key={post.id} className="bg-dark-light border border-cyan-500/20 rounded-2xl overflow-hidden hover:border-cyan-500/50 transition-all group cursor-pointer">
                  <div className={`h-48 bg-gradient-to-br ${post.gradient} group-hover:scale-105 transition-transform relative`}>
                    {post.rewards && (
                      <div className="absolute top-4 right-4 px-3 py-1 bg-yellow-500/90 text-black rounded-full text-xs font-bold flex items-center gap-1">
                        <Award size={12} />
                        {post.rewards} INDA
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-xs font-semibold">
                        {categories.find(c => c.id === post.category)?.label}
                      </span>
                      <span className="flex items-center gap-1 text-gray-400 text-xs">
                        <Clock size={14} />
                        {post.readTime}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold mb-3 group-hover:text-cyan-400 transition-colors line-clamp-2">{post.title}</h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-800">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xl">
                        {post.authorAvatar}
                      </div>
                      <div className="flex-1">
                        <div className="text-white text-sm font-semibold">{post.author}</div>
                        <div className="text-gray-500 text-xs">{post.authorBio}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-gray-400 text-sm">
                      <div className="flex items-center gap-1"><Eye size={16} />{post.views}</div>
                      <div className="flex items-center gap-1"><Heart size={16} />{post.likes}</div>
                      <div className="flex items-center gap-1"><MessageCircle size={16} />{post.comments}</div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Write Post Modal */}
      {showWriteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-light border border-cyan-500/30 rounded-3xl p-8 max-w-2xl w-full">
            <h2 className="text-2xl font-bold mb-6">Create New Post</h2>
            <div className="space-y-4 mb-6">
              <input
                type="text"
                placeholder="Post Title"
                className="w-full px-4 py-3 bg-black border border-gray-700 rounded-xl text-white focus:outline-none focus:border-cyan-500"
              />
              <select className="w-full px-4 py-3 bg-black border border-gray-700 rounded-xl text-white focus:outline-none focus:border-cyan-500">
                <option>Select Category</option>
                {categories.filter(c => c.id !== 'all').map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
              <textarea
                rows={8}
                placeholder="Write your content here..."
                className="w-full px-4 py-3 bg-black border border-gray-700 rounded-xl text-white focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 text-yellow-400 mb-2">
                <Award size={20} />
                <span className="font-semibold">Earn INDA Tokens</span>
              </div>
              <p className="text-gray-400 text-sm">Quality posts earn rewards based on engagement. The more views, likes, and comments, the more INDA you earn!</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowWriteModal(false)}
                className="flex-1 px-6 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-all font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowWriteModal(false)}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all font-semibold"
              >
                Publish Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogPrivate;
