import React from 'react';
import { TrendingUp, Users, DollarSign, Calendar, Heart, Eye } from 'lucide-react';
import Header from '../components/Header';

const Dashboard = ({ userType }) => {
  const creatorStats = {
    totalEarnings: 45250,
    activeProjects: 8,
    reach: '120k',
    engagement: '4.2%',
    thisMonth: 5200,
    growth: 23
  };

  const brandStats = {
    totalInvestment: 158000,
    activeCampaigns: 5,
    reach: '500k',
    avgROI: '3.2x',
    thisMonth: 18000,
    growth: 18
  };

  const stats = userType === 'creator' ? creatorStats : brandStats;

  const recentActivity = [
    { id: 1, type: 'match', text: 'New match with EcoFashion Co.', time: '2h ago', icon: Heart },
    { id: 2, type: 'payment', text: 'Payment received: $4,250', time: '1 day ago', icon: DollarSign },
    { id: 3, type: 'view', text: 'Your profile was viewed 45 times', time: '2 days ago', icon: Eye }
  ];

  return (
    <div className="flex-1 bg-black text-white flex flex-col">
      <Header 
        userType={userType}
        title={`Welcome back${userType === 'creator' ? ', Sarah!' : ', EcoFashion!'}`}
        subtitle="Here's what's happening with your account today."
      />

      <div className="flex-1 overflow-y-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                <DollarSign className="text-cyan-400" size={24} />
              </div>
              <span className="text-green-400 text-sm font-semibold">+{stats.growth}%</span>
            </div>
            <p className="text-gray-400 text-sm mb-1">
              {userType === 'creator' ? 'Total Earnings' : 'Total Investment'}
            </p>
            <p className="text-3xl font-bold text-white">${(stats.totalEarnings || stats.totalInvestment).toLocaleString()}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Calendar className="text-purple-400" size={24} />
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-1">
              {userType === 'creator' ? 'Active Projects' : 'Active Campaigns'}
            </p>
            <p className="text-3xl font-bold text-white">{stats.activeProjects || stats.activeCampaigns}</p>
          </div>

          <div className="bg-gradient-to-br from-orange-900/20 to-amber-900/20 border border-orange-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <Users className="text-orange-400" size={24} />
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-1">Total Reach</p>
            <p className="text-3xl font-bold text-white">{stats.reach}</p>
          </div>

          <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="text-green-400" size={24} />
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-1">
              {userType === 'creator' ? 'Engagement Rate' : 'Avg ROI'}
            </p>
            <p className="text-3xl font-bold text-white">{stats.engagement || stats.avgROI}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-black border border-cyan-500/20 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-center gap-4 p-4 bg-black/50 rounded-xl">
                  <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center">
                    <Icon size={20} className="text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold">{activity.text}</p>
                    <p className="text-gray-500 text-sm">{activity.time}</p>
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

export default Dashboard;
