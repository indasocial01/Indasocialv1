import React, { useState } from 'react';
import { Heart, Users, DollarSign, FileText, MessageCircle, TrendingUp, Calendar, Eye, Filter, X, CheckCircle } from 'lucide-react';
import Header from '../components/Header';

const Notifications = ({ userType }) => {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const notifications = [
    { id: 1, type: 'match', title: 'New Match', message: 'You matched with EcoFashion Co.!', time: 'Just now', icon: Heart, color: 'from-pink-500 to-rose-600', read: false },
    { id: 2, type: 'proposal', title: 'Proposal Received', message: 'Weecoin sent you a project proposal - $5,000', time: '2h ago', icon: FileText, color: 'from-cyan-500 to-blue-600', read: false },
    { id: 3, type: 'follower', title: 'New Follower', message: 'Alex started following you', time: '1 day ago', icon: Users, color: 'from-purple-500 to-indigo-600', read: true },
    { id: 4, type: 'payment', title: 'Payment Received', message: 'You received $4,250 from EcoFashion Co.', time: '1 day ago', icon: DollarSign, color: 'from-green-500 to-emerald-600', read: true },
    { id: 5, type: 'engagement', title: 'Post Engagement', message: 'Your post reached 500 likes!', time: '2 days ago', icon: Heart, color: 'from-orange-500 to-amber-600', read: true }
  ];

  const filters = [
    { id: 'all', label: 'All', count: 10 },
    { id: 'matches', label: 'Matches', count: 1 },
    { id: 'proposals', label: 'Proposals', count: 2 },
    { id: 'engagement', label: 'Engagement', count: 3 },
    { id: 'payments', label: 'Payments', count: 1 }
  ];

  return (
    <div className="flex-1 bg-black text-white flex flex-col">
      <Header 
        userType={userType}
        title="Notifications"
        subtitle="Stay updated with your activity"
      />

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Filter size={20} className="text-cyan-400" />
            <div className="flex gap-2 flex-wrap">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    selectedFilter === filter.id
                      ? 'bg-cyan-500 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>
            <button className="ml-auto text-cyan-400 hover:text-cyan-300 text-sm font-semibold">
              Mark all as read
            </button>
          </div>

          <div className="space-y-4">
            {notifications.map((notif) => {
              const Icon = notif.icon;
              return (
                <div
                  key={notif.id}
                  className={`bg-dark-light rounded-2xl p-6 transition-all ${
                    notif.read ? 'border border-gray-800' : 'border-2 border-cyan-500 glow-cyan'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${notif.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <Icon size={24} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-white font-bold mb-1">{notif.title}</h3>
                          <p className="text-gray-300">{notif.message}</p>
                        </div>
                        <button className="text-gray-400 hover:text-white">
                          <X size={20} />
                        </button>
                      </div>
                      <div className="flex items-center gap-4 mt-3">
                        <span className="text-gray-500 text-sm">{notif.time}</span>
                        {!notif.read && (
                          <>
                            <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                            <button className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold">
                              Mark as read
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
