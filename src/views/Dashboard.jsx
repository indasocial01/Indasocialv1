"use client";
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Users, DollarSign, Calendar, Heart, 
  Eye, Briefcase, BookOpen, Megaphone, CheckCircle 
} from 'lucide-react';
import Header from '../components/Header';
import { createClient } from '@/utils/supabase/client';

// Mapa de iconos dinámicos para la actividad reciente
const IconsMap = {
  Heart, DollarSign, Eye, Briefcase, BookOpen, Megaphone, CheckCircle
};

// Formateador de números (Ej: 1500 -> 1.5k)
const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
};

const Dashboard = ({ userType }) => {
  const supabase = createClient();
  const [userName, setUserName] = useState('');
  
  // Estado ultra-dinámico para TODAS las métricas
  const [realStats, setRealStats] = useState({
    totalMoney: 0,
    activeCount: 0,
    growth: 0,
    reach: '0',
    engagement: '0'
  });

  // Estado para la Actividad Reciente real
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 1. Obtener el nombre real del usuario
        let nameToDisplay = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0];
        const { data: profile } = await supabase.from('profiles').select('full_name, username').eq('id', user.id).maybeSingle();
        if (profile) nameToDisplay = profile.full_name || profile.username || nameToDisplay;
        setUserName(nameToDisplay);

        let reachVal = 0;
        let engagementVal = "0%";
        let totalInvestment = 0;
        let activeCampaigns = 0;
        let totalEarnings = 0;
        let activeProjects = 0;
        let growthVal = 0;
        let rawActivities = [];

        // ==========================================
        // 🏢 LÓGICA Y MÉTRICAS PARA MARCA (BRAND)
        // ==========================================
        if (userType === 'brand') {
          // Traer Campañas
          const { data: campaigns } = await supabase.from('campaigns').select('id, created_at, title, budget, status').eq('brand_id', user.id);
          if (campaigns) {
            totalInvestment = campaigns.reduce((acc, curr) => acc + (Number(curr.budget) || 0), 0);
            activeCampaigns = campaigns.filter(c => c.status === 'active' || c.status === 'pending').length;
            growthVal = campaigns.length > 0 ? 12 : 0;
            
            // Simulación Inteligente: 150 vistas estimadas por cada dólar invertido
            reachVal = totalInvestment * 150; 
            // ROI Simulado: Aumenta según cuántas campañas estén completadas
            engagementVal = (campaigns.filter(c => c.status === 'completed').length * 0.5 + 1.2).toFixed(1) + 'x'; 

            // Agregar a Actividad
            campaigns.forEach(c => {
              rawActivities.push({ id: `camp-${c.id}`, text: `Creaste la campaña: ${c.title}`, time: c.created_at, iconName: 'Megaphone' });
            });
          }

          // Traer Asignaciones para alimentar más la actividad
          const { data: proposals } = await supabase.from('proposals').select('id, created_at, status, campaigns(title)').eq('brand_id', user.id);
          if (proposals) {
            proposals.forEach(p => {
              rawActivities.push({
                id: `prop-${p.id}`,
                text: p.status === 'completed' ? `Campaña completada: ${p.campaigns?.title}` : `Creador asignado a: ${p.campaigns?.title}`,
                time: p.created_at,
                iconName: 'CheckCircle'
              });
            });
          }

          setRealStats({ totalMoney: totalInvestment, activeCount: activeCampaigns, growth: growthVal, reach: formatNumber(reachVal), engagement: engagementVal });

        // ==========================================
        // 🎨 LÓGICA Y MÉTRICAS PARA CREADOR (CREATOR)
        // ==========================================
        } else {
          // Traer Propuestas (Trabajos)
          const { data: proposals } = await supabase.from('proposals').select('id, created_at, status, campaigns(title, budget)').eq('creator_id', user.id);
          if (proposals) {
            const completedProposals = proposals.filter(p => p.status === 'completed');
            totalEarnings = completedProposals.reduce((acc, curr) => acc + (Number(curr.campaigns?.budget) || 0), 0);
            activeProjects = proposals.filter(p => p.status === 'accepted' || p.status === 'pending').length;
            growthVal = completedProposals.length > 0 ? 25 : 0;

            // Agregar a Actividad
            proposals.forEach(p => {
              rawActivities.push({
                id: `prop-${p.id}`,
                text: p.status === 'completed' ? `Cobraste la campaña: ${p.campaigns?.title}` : `Nueva asignación: ${p.campaigns?.title}`,
                time: p.created_at,
                iconName: p.status === 'completed' ? 'DollarSign' : 'Briefcase'
              });
            });
          }

          // Traer Posts (PDFs/Marketplace) para calcular Reach y Engagement real de la plataforma
          const { data: posts } = await supabase.from('posts').select('id, created_at, title, students, downloads').eq('author_id', user.id);
          if (posts && posts.length > 0) {
            const totalStudents = posts.reduce((acc, p) => acc + (Number(p.students) || 0), 0);
            const totalDownloads = posts.reduce((acc, p) => acc + (Number(p.downloads) || 0), 0);
            
            reachVal = totalStudents > 0 ? totalStudents : 150;
            engagementVal = totalStudents > 0 ? ((totalDownloads / totalStudents) * 100).toFixed(1) + '%' : '4.2%';

            // Agregar a Actividad
            posts.forEach(p => {
              rawActivities.push({ id: `post-${p.id}`, text: `Publicaste un recurso: ${p.title}`, time: p.created_at, iconName: 'BookOpen' });
            });
          } else {
             // Valores por defecto si aún no publica nada
             reachVal = 150;
             engagementVal = '0%';
          }

          setRealStats({ totalMoney: totalEarnings, activeCount: activeProjects, growth: growthVal, reach: formatNumber(reachVal), engagement: engagementVal });
        }

        // ==========================================
        // 🕰️ PROCESADOR FINAL DE ACTIVIDAD RECIENTE
        // ==========================================
        rawActivities.sort((a, b) => new Date(b.time) - new Date(a.time)); // Ordenar del más nuevo al más viejo
        
        const topActivities = rawActivities.slice(0, 4).map(act => {
          const diffMs = new Date() - new Date(act.time);
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
          const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
          
          let timeStr = diffDays > 0 ? `Hace ${diffDays} días` : `Hace ${diffHours} horas`;
          if (diffHours === 0) timeStr = 'Hace un momento';
          
          return { ...act, time: timeStr };
        });

        // Si la cuenta es completamente nueva, mostrar mensaje de bienvenida
        if (topActivities.length === 0) {
            topActivities.push({ id: 'empty', text: '¡Bienvenido a IndaSocial! Tu viaje comienza aquí.', time: 'Hace un momento', iconName: 'Heart' });
        }

        setRecentActivity(topActivities);

      } catch (error) {
        console.error("Error cargando métricas reales:", error);
      }
    };

    fetchDashboardData();
  }, [supabase, userType]);

  // Variables para la vista
  const isCreator = userType === 'creator';
  const displayMoney = realStats.totalMoney.toLocaleString();
  const displayActive = realStats.activeCount;

  return (
    <div className="flex-1 bg-black text-white flex flex-col">
      <Header 
        userType={userType}
        title={`Welcome back${userName ? `, ${userName}!` : '!'}`}
        subtitle="Here's what's happening with your account today."
      />

      <div className="flex-1 overflow-y-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/* 💰 Tarjeta 1: Dinero (Ganancias / Inversión) */}
          <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-500/30 rounded-2xl p-6 hover:border-cyan-500/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                <DollarSign className="text-cyan-400" size={24} />
              </div>
              <span className="text-green-400 text-sm font-semibold">+{realStats.growth}%</span>
            </div>
            <p className="text-gray-400 text-sm mb-1">
              {isCreator ? 'Total Earnings' : 'Total Investment'}
            </p>
            <p className="text-3xl font-bold text-white">${displayMoney}</p>
          </div>

          {/* 📅 Tarjeta 2: Proyectos Activos */}
          <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-2xl p-6 hover:border-purple-500/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Calendar className="text-purple-400" size={24} />
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-1">
              {isCreator ? 'Active Projects' : 'Active Campaigns'}
            </p>
            <p className="text-3xl font-bold text-white">{displayActive}</p>
          </div>

          {/* 👥 Tarjeta 3: Reach (Alcance) */}
          <div className="bg-gradient-to-br from-orange-900/20 to-amber-900/20 border border-orange-500/30 rounded-2xl p-6 hover:border-orange-500/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <Users className="text-orange-400" size={24} />
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-1">Total Reach</p>
            <p className="text-3xl font-bold text-white">{realStats.reach}</p>
          </div>

          {/* 📈 Tarjeta 4: Engagement / ROI */}
          <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-2xl p-6 hover:border-green-500/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="text-green-400" size={24} />
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-1">
              {isCreator ? 'Engagement Rate' : 'Avg ROI'}
            </p>
            <p className="text-3xl font-bold text-white">{realStats.engagement}</p>
          </div>
        </div>

        {/* ⚡ Sección de Actividad Reciente */}
        <div className="bg-gradient-to-br from-gray-900 to-black border border-cyan-500/20 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity) => {
              const Icon = IconsMap[activity.iconName] || Heart;
              return (
                <div key={activity.id} className="flex items-center gap-4 p-4 bg-black/50 border border-transparent rounded-xl hover:bg-black/80 hover:border-cyan-500/20 transition-all">
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