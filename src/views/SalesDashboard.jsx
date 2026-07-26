import React from 'react';
import { TrendingUp, CheckCircle, DollarSign, Target, User } from 'lucide-react';
import Header from '../components/Header';

const SalesDashboard = ({ userType }) => {
  const revenueData = [
    { month: 'Jan', value: 15, amount: 12500 },
    { month: 'Feb', value: 25, amount: 15000 },
    { month: 'Mar', value: 35, amount: 18000 },
    { month: 'Apr', value: 50, amount: 22000 },
    { month: 'May', value: 70, amount: 28000 },
    { month: 'Jun', value: 85, amount: 35000 }
  ];

  const activeCampaigns = [
    { name: 'Osvi.Tech', status: 'Ongoing', color: 'cyan' },
    { name: 'Code Nexus', status: 'Completed', color: 'purple' },
    { name: 'Vila World', status: 'Pending', color: 'blue' }
  ];

  const closedProjects = [
    { name: 'Fiira', amount: 18500 },
    { name: 'Niop.', amount: 14200 },
    { name: 'Dloom', amount: 11800 }
  ];

  const brandsLooking = [
    { name: 'Xyra', logo: 'X', color: 'from-cyan-500 to-blue-600' },
    { name: 'Yini', logo: 'Y', color: 'from-purple-500 to-pink-600' }
  ];

  const performanceMetrics = {
    engagement: 24,
    impressions: '191k',
    conversionRate: 13
  };

  const totalEarnings = revenueData.reduce((sum, item) => sum + item.amount, 0);
  const lastMonthGrowth = 24;

  return (
    <div className="flex-1 bg-black text-white flex flex-col">
      <Header 
        userType={userType}
        title={userType === 'creator' ? 'Sales Dashboard' : 'Campaigns Dashboard'}
        subtitle="Track your revenue and growth"
      />

      <div className="flex-1 overflow-y-auto p-8">
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Month Revenue Tracker */}
          <div className="bg-gradient-to-br from-black via-gray-900 to-black border-2 border-cyan-500/50 rounded-3xl p-8 glow-cyan">
            <h2 className="text-cyan-400 font-bold text-xl mb-6">Month Revenue Tracker</h2>
            
            <div className="relative h-48 mb-4">
              <svg className="w-full h-full" viewBox="0 0 300 120" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                  <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                  </linearGradient>
                </defs>
                
                <path
                  d={`M 0 ${120 - revenueData[0].value} 
                      L 60 ${120 - revenueData[1].value} 
                      L 120 ${120 - revenueData[2].value} 
                      L 180 ${120 - revenueData[3].value} 
                      L 240 ${120 - revenueData[4].value} 
                      L 300 ${120 - revenueData[5].value}
                      L 300 120 L 0 120 Z`}
                  fill="url(#areaGradient)"
                />
                
                <path
                  d={`M 0 ${120 - revenueData[0].value} 
                      L 60 ${120 - revenueData[1].value} 
                      L 120 ${120 - revenueData[2].value} 
                      L 180 ${120 - revenueData[3].value} 
                      L 240 ${120 - revenueData[4].value} 
                      L 300 ${120 - revenueData[5].value}`}
                  fill="none"
                  stroke="url(#revenueGradient)"
                  strokeWidth="3"
                />
                
                {revenueData.map((point, index) => (
                  <circle key={index} cx={index * 60} cy={120 - point.value} r="4" fill="#06b6d4" />
                ))}
              </svg>
              
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                {revenueData.map((point, index) => (
                  <span key={index}>{point.month}</span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Earnings</p>
                <p className="text-white font-bold text-2xl">${(totalEarnings / 1000).toFixed(1)}k</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Growth</p>
                <p className="text-green-400 font-bold text-2xl flex items-center gap-1">
                  <TrendingUp size={20} />
                  +{lastMonthGrowth}%
                </p>
              </div>
            </div>
          </div>

          {/* Active Campaigns */}
          <div className="bg-dark-light border-2 border-cyan-500/30 rounded-3xl p-8">
            <h2 className="text-white font-bold text-xl mb-6">Active Campaigns</h2>
            <div className="space-y-4">
              {activeCampaigns.map((campaign, index) => (
                <div key={index} className="bg-black/40 border border-gray-700 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold">{campaign.name}</p>
                    <p className="text-gray-400 text-sm">Campaign {index + 1}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    campaign.status === 'Ongoing' ? 'bg-cyan-500/20 text-cyan-400' :
                    campaign.status === 'Completed' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {campaign.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Closed Projects */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-dark-light border-2 border-cyan-500/30 rounded-3xl p-8">
            <h2 className="text-white font-bold text-xl mb-6">Closed Projects</h2>
            <div className="space-y-4">
              {closedProjects.map((project, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-green-400" size={20} />
                    <span className="text-white font-semibold">{project.name}</span>
                  </div>
                  <span className="text-cyan-400 font-bold">${(project.amount / 1000).toFixed(1)}k</span>
                </div>
              ))}
            </div>
          </div>

          {/* Brands Looking for Talent */}
          <div className="bg-dark-light border-2 border-cyan-500/30 rounded-3xl p-8">
            <h2 className="text-white font-bold text-xl mb-6">
              {userType === 'creator' ? 'Brands Looking for Talent' : 'Top Performing Creators'}
            </h2>
            <div className="space-y-4">
              {brandsLooking.map((brand, index) => (
                <div key={index} className="bg-black/40 border border-gray-700 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 bg-gradient-to-br ${brand.color} rounded-full flex items-center justify-center text-white font-bold text-xl`}>
                      {brand.logo}
                    </div>
                    <span className="text-white font-semibold">{brand.name}</span>
                  </div>
                  <button className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-all font-semibold text-sm">
                    {userType === 'creator' ? 'APPLY' : 'VIEW'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-2 border-purple-500/30 rounded-3xl p-8">
          <h2 className="text-white font-bold text-xl mb-6">Creator Performance Insights</h2>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-white mb-2">{performanceMetrics.engagement}%</p>
              <p className="text-gray-400 text-sm">Engagement Rate</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-white mb-2">{performanceMetrics.impressions}</p>
              <p className="text-gray-400 text-sm">Total Impressions</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-white mb-2">{performanceMetrics.conversionRate}%</p>
              <p className="text-gray-400 text-sm">Conversion Rate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;
