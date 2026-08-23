"use client";
import React, { useState, useEffect } from 'react';
import { TrendingUp, CheckCircle, DollarSign, Target, User } from 'lucide-react';
import Header from '../components/Header';
import { createClient } from '@/utils/supabase/client';

// Función para abreviar números grandes (Ej: 15000 -> 15k)
const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
};

const SalesDashboard = ({ userType }) => {
  const supabase = createClient();
  const [userName, setUserName] = useState('');
  
  // Estados Reales
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [lastMonthGrowth, setLastMonthGrowth] = useState(0);
  const [revenueData, setRevenueData] = useState(Array(6).fill({ month: '', value: 10, amount: 0 }));
  const [activeCampaigns, setActiveCampaigns] = useState([]);
  const [closedProjects, setClosedProjects] = useState([]);
  const [brandsLooking, setBrandsLooking] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    engagement: 0,
    impressions: '0',
    conversionRate: 0
  });

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 1. Obtener Nombre del Usuario
        let nameToDisplay = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0];
        const { data: profile } = await supabase.from('profiles').select('full_name, username').eq('id', user.id).maybeSingle();
        if (profile) nameToDisplay = profile.full_name || profile.username || nameToDisplay;
        setUserName(nameToDisplay);

        // 2. Generar el esqueleto de los últimos 6 meses
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const last6Months = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          last6Months.push({ month: monthNames[d.getMonth()], year: d.getFullYear(), amount: 0, value: 10 });
        }

        let totalCalculated = 0;
        let activeList = [];
        let closedList = [];

        // 3. Procesar datos de Ventas según el Rol
        if (userType === 'brand') {
          const { data: campaigns } = await supabase.from('campaigns').select('*').eq('brand_id', user.id);
          
          if (campaigns) {
            campaigns.forEach(c => {
              const amt = Number(c.budget) || 0;
              totalCalculated += amt;
              
              // Acumular en la gráfica por mes
              const d = new Date(c.created_at);
              const mIdx = last6Months.findIndex(m => m.month === monthNames[d.getMonth()] && m.year === d.getFullYear());
              if (mIdx !== -1) last6Months[mIdx].amount += amt;

              // Separar Activos y Completados
              if (c.status === 'completed') {
                closedList.push({ name: c.title, amount: amt });
              } else {
                activeList.push({ 
                  name: c.title, 
                  status: c.status === 'active' ? 'Ongoing' : 'Pending', 
                  color: c.status === 'active' ? 'cyan' : 'blue' 
                });
              }
            });
          }
          
          // Métricas de Rendimiento simuladas para Marca (ROI)
          setPerformanceMetrics({
            engagement: (closedList.length * 1.5 + 2).toFixed(1),
            impressions: formatNumber(totalCalculated * 120),
            conversionRate: closedList.length > 0 ? 12 : 0
          });

        } else {
          // Si es Creador, procesamos las 'proposals' (asignaciones)
          const { data: proposals } = await supabase.from('proposals').select('*, campaigns(title, budget)').eq('creator_id', user.id);
          
          if (proposals) {
            proposals.forEach(p => {
              const amt = Number(p.campaigns?.budget) || 0;
              const d = new Date(p.created_at);
              const mIdx = last6Months.findIndex(m => m.month === monthNames[d.getMonth()] && m.year === d.getFullYear());

              if (p.status === 'completed') {
                totalCalculated += amt;
                closedList.push({ name: p.campaigns?.title || 'Proyecto', amount: amt });
                if (mIdx !== -1) last6Months[mIdx].amount += amt;
              } else if (p.status === 'accepted' || p.status === 'pending') {
                activeList.push({ 
                  name: p.campaigns?.title || 'Proyecto', 
                  status: p.status === 'accepted' ? 'Ongoing' : 'Pending', 
                  color: p.status === 'accepted' ? 'cyan' : 'purple' 
                });
                if (mIdx !== -1) last6Months[mIdx].amount += amt; // Añadir expectativa de cobro a la gráfica
              }
            });
          }

          // Métricas de Rendimiento basadas en sus recursos (Posts)
          const { data: posts } = await supabase.from('posts').select('students, downloads').eq('author_id', user.id);
          if (posts && posts.length > 0) {
            const tStudents = posts.reduce((a,p) => a + (Number(p.students)||0), 0);
            const tDown = posts.reduce((a,p) => a + (Number(p.downloads)||0), 0);
            setPerformanceMetrics({
              engagement: tStudents > 0 ? ((tDown/tStudents)*100).toFixed(1) : 0,
              impressions: formatNumber(tStudents || 150),
              conversionRate: tStudents > 0 ? ((tDown/tStudents)*50).toFixed(1) : 0
            });
          }
        }

        // 4. Normalizar la gráfica para que quepa en el SVG (0 a 100 de altura)
        const maxAmount = Math.max(...last6Months.map(m => m.amount), 100);
        last6Months.forEach(m => {
          m.value = Math.max(10, (m.amount / maxAmount) * 100); // Mínimo 10px para que el punto se vea
        });

        setRevenueData(last6Months);
        setTotalEarnings(totalCalculated);
        setActiveCampaigns(activeList.slice(0, 3)); // Mostrar top 3
        setClosedProjects(closedList.slice(0, 3)); // Mostrar top 3
        setLastMonthGrowth(closedList.length > 0 ? 24 : 0);

        // 5. Cargar lista real de Creadores o Marcas en la plataforma
        const targetRole = userType === 'creator' ? 'brand' : 'creator';
        const { data: profilesData } = await supabase.from('profiles').select('full_name, username').eq('user_role', targetRole).limit(3);
        if (profilesData) {
          setBrandsLooking(profilesData.map((p, i) => ({
            name: p.full_name || p.username || 'Usuario',
            logo: (p.full_name || p.username || 'U')[0].toUpperCase(),
            color: i % 2 === 0 ? 'from-cyan-500 to-blue-600' : 'from-purple-500 to-pink-600'
          })));
        }

      } catch (error) {
        console.error("Error en Sales Dashboard:", error);
      }
    };

    fetchSalesData();
  }, [supabase, userType]);

  return (
    <div className="flex-1 bg-black text-white flex flex-col">
      <Header 
        userType={userType}
        title={`Welcome back${userName ? `, ${userName}!` : '!'}`}
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
                  className="transition-all duration-1000"
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
                  className="transition-all duration-1000"
                />
                
                {revenueData.map((point, index) => (
                  <circle key={index} cx={index * 60} cy={120 - point.value} r="4" fill="#06b6d4" className="transition-all duration-1000" />
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
            {activeCampaigns.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">No tienes campañas activas.</p>
            ) : (
              <div className="space-y-4">
                {activeCampaigns.map((campaign, index) => (
                  <div key={index} className="bg-black/40 border border-gray-700 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold line-clamp-1">{campaign.name}</p>
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
            )}
          </div>
        </div>

        {/* Closed Projects */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-dark-light border-2 border-cyan-500/30 rounded-3xl p-8">
            <h2 className="text-white font-bold text-xl mb-6">Closed Projects</h2>
            {closedProjects.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">Aún no hay proyectos cerrados.</p>
            ) : (
              <div className="space-y-4">
                {closedProjects.map((project, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="text-green-400" size={20} />
                      <span className="text-white font-semibold line-clamp-1 max-w-[200px]">{project.name}</span>
                    </div>
                    <span className="text-cyan-400 font-bold">${(project.amount / 1000).toFixed(1)}k</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Brands Looking for Talent */}
          <div className="bg-dark-light border-2 border-cyan-500/30 rounded-3xl p-8">
            <h2 className="text-white font-bold text-xl mb-6">
              {userType === 'creator' ? 'Brands Looking for Talent' : 'Top Performing Creators'}
            </h2>
            {brandsLooking.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">Buscando usuarios de la comunidad...</p>
            ) : (
              <div className="space-y-4">
                {brandsLooking.map((brand, index) => (
                  <div key={index} className="bg-black/40 border border-gray-700 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 bg-gradient-to-br ${brand.color} rounded-full flex items-center justify-center text-white font-bold text-xl`}>
                        {brand.logo}
                      </div>
                      <span className="text-white font-semibold line-clamp-1 max-w-[120px]">{brand.name}</span>
                    </div>
                    <button className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-all font-semibold text-sm">
                      {userType === 'creator' ? 'APPLY' : 'VIEW'}
                    </button>
                  </div>
                ))}
              </div>
            )}
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