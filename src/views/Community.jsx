import React, { useState, useEffect } from 'react';
import {
  Users, Heart, MessageCircle, Eye, UserPlus, Send, Image as ImageIcon
} from 'lucide-react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { createClient } from '@/utils/supabase/client';

const Community = () => {
  const { currentUser } = useAuth();
  const supabase = createClient();
  const [newPost, setNewPost] = useState('');
  const [communityPosts, setCommunityPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState(new Set());

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase.from('community_posts').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        const formatted = data.map((post) => ({
          id: post.id,
          user: post.author_name || 'Community Member',
          timestamp: new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          avatar: '👤',
          post: post.content,
          likes: post.likes || 0,
          comments: post.comments || 0,
          views: post.views || 0,
          verified: true,
        }));
        setCommunityPosts(formatted);
      }
    };

    fetchPosts();
  }, [supabase]);

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('community_posts').insert({
      author_id: user?.id || null,
      author_name: currentUser?.name || 'Anonymous',
      content: newPost,
      likes: 0,
      comments: 0,
      views: 0,
    });

    if (!error) {
      setCommunityPosts([{ id: Date.now(), user: currentUser?.name || 'Anonymous', timestamp: 'Just now', avatar: currentUser?.avatar || '👤', post: newPost, likes: 0, comments: 0, views: 0, verified: true }, ...communityPosts]);
      setNewPost('');
    }
  };

  const handleLikePost = async (postId) => {
    const isLiked = likedPosts.has(postId);
    const newLikedPosts = new Set(likedPosts);

    if (isLiked) {
      newLikedPosts.delete(postId);
    } else {
      newLikedPosts.add(postId);
    }

    setLikedPosts(newLikedPosts);

    const post = communityPosts.find((item) => item.id === postId);
    if (post) {
      await supabase.from('community_posts').update({ likes: Math.max(0, post.likes + (isLiked ? -1 : 1)) }).eq('id', postId);
    }
  };

  const members = [
    { id: 1, name: 'Sarah', avatar: '👩‍🦰', role: 'Creator', followers: '120k' },
    { id: 2, name: 'EcoFashion', avatar: '🌱', role: 'Brand', followers: '500k' },
    { id: 3, name: 'Alex', avatar: '👤', role: 'Creator', followers: '80k' }
  ];

  return (
    <div className="flex-1 bg-black text-white flex flex-col">
      <Header 
        title="Community"
        subtitle="Connect and engage with fellow members"
      />
      
      <div className="flex-1 overflow-y-auto p-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column - Stats + Feed */}
          <div className="md:col-span-2 space-y-6">
            {/* Community Dashboard */}
            <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border border-cyan-500/30 rounded-2xl p-6">
              <h2 className="text-cyan-400 text-lg font-semibold mb-4">Community Dashboard</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-4xl font-bold mb-1">190</div>
                  <div className="text-gray-400 text-sm">Members</div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-1">32</div>
                  <div className="text-gray-400 text-sm">Posts</div>
                </div>
              </div>
            </div>

            {/* Community Feed */}
            <div className="bg-gray-900 border border-cyan-500/20 rounded-2xl p-6">
              <h2 className="text-cyan-400 text-lg font-semibold mb-4">Community Feed</h2>
              
              {/* Create Post Box */}
              <div className="bg-black border border-cyan-500/30 rounded-xl p-4 mb-6">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-xl flex-shrink-0">
                    {currentUser?.avatar || '👤'}
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      placeholder="Share something with the community..."
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 resize-none"
                      rows={3}
                    />
                    <div className="flex items-center justify-between mt-3">
                      <button className="text-gray-400 hover:text-cyan-400 transition-colors">
                        <ImageIcon size={20} />
                      </button>
                      <button
                        onClick={handleCreatePost}
                        disabled={!newPost.trim()}
                        className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <Send size={16} />
                        Post
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                {communityPosts.map(post => (
                  <div key={post.id} className="bg-black border border-gray-800 rounded-xl p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-orange-500 rounded-full flex items-center justify-center text-2xl">
                        {post.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{post.user}</span>
                          {post.verified && (
                            <svg className="w-4 h-4 text-cyan-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                          {post.role && (
                            <span className="text-xs text-green-400">{post.role}</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">{post.timestamp}</div>
                      </div>
                    </div>
                    
                    <p className="text-gray-300 mb-3">{post.post}</p>
                    
                    <div className="flex items-center gap-6 text-gray-400 text-sm">
                      <button 
                        onClick={() => handleLikePost(post.id)}
                        className={`flex items-center gap-1 transition-colors ${
                          likedPosts.has(post.id) ? 'text-pink-400' : 'hover:text-pink-400'
                        }`}
                      >
                        <Heart size={16} fill={likedPosts.has(post.id) ? 'currentColor' : 'none'} />
                        <span>{post.likes}</span>
                      </button>
                      <button className="flex items-center gap-1 hover:text-cyan-400 transition-colors">
                        <MessageCircle size={16} />
                        <span>{post.comments}</span>
                      </button>
                      <div className="flex items-center gap-1">
                        <Eye size={16} />
                        <span>{post.views}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - User Profile Card */}
          <div className="space-y-6">
            {/* User Profile - USANDO CURRENT USER */}
            <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-2 border-purple-500/30 rounded-2xl p-6 text-center">
              <div className="inline-block px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-full text-cyan-400 text-xs font-semibold mb-4">
                {currentUser?.type === 'brand' ? 'Brand' : 'Creator'}
              </div>
              
              <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
                {currentUser?.avatar || '👤'}
              </div>
              
              <h3 className="text-2xl font-bold mb-2">{currentUser?.name || 'User'}</h3>
              
              <div className="mb-4">
                <div className="text-cyan-400 text-sm mb-1">Reach</div>
                <div className="text-3xl font-bold">{currentUser?.reach || '0'}</div>
                <div className="text-gray-400 text-sm">
                  {currentUser?.type === 'brand' ? 'customers' : 'followers'}
                </div>
              </div>
              
              <div className="bg-gray-900/50 rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-2">
                  {currentUser?.type === 'brand' ? 'Industry' : 'Content style'}
                </div>
                <div className="font-semibold">{currentUser?.category || 'Not specified'}</div>
              </div>
            </div>

            {/* Members List */}
            <div className="bg-purple-900/20 border border-purple-500/20 rounded-2xl p-6">
              <h3 className="font-semibold mb-4">Members</h3>
              <div className="space-y-3">
                {members.map(member => (
                  <div key={member.id} className="flex items-center gap-3 p-2 hover:bg-purple-500/10 rounded-lg transition-colors cursor-pointer">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-xl">
                      {member.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{member.name}</div>
                      <div className="text-xs text-gray-400">{member.followers}</div>
                    </div>
                    <button className="text-cyan-400 hover:text-cyan-300">
                      <UserPlus size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-cyan-900/20 border border-cyan-500/20 rounded-2xl p-6">
              <h3 className="font-semibold mb-4">Profile</h3>
              <div className="space-y-2">
                <button className="w-full text-left px-4 py-3 bg-gray-900 hover:bg-cyan-500/10 rounded-xl transition-colors text-sm">
                  View Full Profile
                </button>
                <button className="w-full text-left px-4 py-3 bg-gray-900 hover:bg-cyan-500/10 rounded-xl transition-colors text-sm">
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;
