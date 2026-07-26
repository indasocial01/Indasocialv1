import React, { useState, useEffect } from 'react';
import { Clock, Heart, MessageCircle, Eye, TrendingUp, Plus, Award, Lock, Trash2 } from 'lucide-react';
import Header from '../components/Header';
import WritePost from '../components/WritePost';
import PostReader from '../components/PostReader';
import { useAuth } from '../context/AuthContext';
import { categories } from '../data/blogData';
import { createClient } from '@/utils/supabase/client';

const Blog = ({ userType }) => {
  const { currentUser, unlockPost: unlockPostInAuth } = useAuth();
  const supabase = createClient();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showWritePost, setShowWritePost] = useState(false);
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [unlockedPosts, setUnlockedPosts] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      let unlocked = [];

      if (user) {
        const { data: unlocksData } = await supabase.from('post_unlocks').select('post_id').eq('user_id', user.id);
        unlocked = (unlocksData || []).map((item) => item.post_id);
      }

      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const formattedPosts = data.map((post) => ({
          id: post.id,
          title: post.title,
          excerpt: post.excerpt || post.content?.slice(0, 140),
          fullContent: post.content,
          content: post.content,
          author: post.author_id === user?.id ? 'You' : 'Community',
          authorAvatar: '📝',
          authorBio: 'Creator',
          date: new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          category: 'community',
          readTime: `${Math.max(1, Math.ceil((post.content?.split(/\s+/).length || 0) / 200))} min`,
          gradient: 'from-cyan-500 to-blue-600',
          imageUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
          views: 0,
          likes: 0,
          comments: 0,
          rewards: 0,
          featured: false,
          requiresTokens: Boolean(post.is_premium),
          unlockCost: post.token_cost || 0,
          isUnlocked: !post.is_premium || unlocked.includes(post.id),
          isUserPost: post.author_id === user?.id,
          author_id: post.author_id,
          isPremium: post.is_premium,
        }));
        setPosts(formattedPosts);
        setUnlockedPosts(new Set(unlocked));
      }

      setLoading(false);
    };

    fetchPosts();
  }, [supabase]);

  const allPosts = posts.map((post) => ({
    ...post,
    isUnlocked: !post.requiresTokens || unlockedPosts.has(post.id) || post.isUnlocked,
  }));

  const filteredPosts = selectedCategory === 'all' ? allPosts : allPosts.filter((p) => p.category === selectedCategory);
  const featuredPost = filteredPosts.find((p) => p.featured);
  const regularPosts = filteredPosts.filter((p) => !p.featured);

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este post?')) return;

    const { error } = await supabase.from('posts').delete().eq('id', postId);
    if (!error) {
      setPosts(posts.filter((p) => p.id !== postId));
    }
  };

  const handleUnlock = async (postId) => {
    const post = allPosts.find((p) => p.id === postId);
    if (post && post.requiresTokens && !unlockedPosts.has(postId)) {
      const success = await unlockPostInAuth(postId, post.unlockCost);
      if (success) {
        const nextUnlocked = new Set(unlockedPosts);
        nextUnlocked.add(postId);
        setUnlockedPosts(nextUnlocked);
        setSelectedPost({ ...post, isUnlocked: true });
      }
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
          className="absolute top-4 left-4 z-10 p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
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

        <div className={`${isFeatured ? 'md:w-1/2' : ''} p-6`}>
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

          <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
            <div className="flex items-center gap-2">
              <div className="text-lg">{post.authorAvatar}</div>
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
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <Award className="text-yellow-400" size={24} />
                <div>
                  <p className="text-white font-semibold">Earn INDA Tokens by Creating Content</p>
                  <p className="text-gray-400 text-sm">Get rewarded for quality posts and engagement</p>
                </div>
              </div>
              <div className="bg-gray-900 border border-cyan-500/30 rounded-xl px-4 py-2">
                <div className="text-xs text-gray-400">Your Balance</div>
                <div className="text-xl font-bold text-yellow-400">{currentUser?.indaBalance || 0} INDA</div>
              </div>
            </div>
            <button 
              onClick={() => setShowWritePost(true)}
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
              </div>
              <PostCard post={featuredPost} isFeatured={true} />
            </div>
          </section>
        )}

        {/* Category Filters */}
        <div className="border-b border-cyan-500/20 bg-gray-900/50 px-8 py-6 sticky top-0 z-10 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto">
            <div className="flex gap-3 overflow-x-auto pb-2">
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
                  <span className="text-xs opacity-75">({cat.count})</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        <section className="px-8 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              {regularPosts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Write Post Modal */}
      <WritePost 
        isOpen={showWritePost}
        onClose={() => setShowWritePost(false)}
        onPostCreated={handlePostCreated}
      />

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
