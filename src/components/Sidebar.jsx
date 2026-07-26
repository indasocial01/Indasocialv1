"use client";
import React from 'react';
import Link from 'next/link';
import { 
  Home, DollarSign, Users, MessageCircle, Calendar, 
  BookOpen, Bell, Settings, LogOut, Target, GraduationCap 
} from 'lucide-react';

const Sidebar = ({ currentPage, userType, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', href: '/dashboard', label: 'Dashboard', icon: Home },
    { 
      id: 'sales', 
      href: '/sales',
      label: userType === 'creator' ? 'Sales' : 'Campaigns', 
      icon: userType === 'creator' ? DollarSign : Target 
    },
    { 
      id: 'connect', 
      href: '/connect',
      label: userType === 'creator' ? 'Conecta con Marcas' : 'Conecta con Creadores', 
      icon: Users 
    },
    { id: 'learnearn', href: '/learnearn', label: 'Learn & Earn', icon: GraduationCap },
    { id: 'chat', href: '/chat', label: 'MatchChat', icon: MessageCircle },
    { id: 'community', href: '/community', label: 'Community', icon: Users },
    { id: 'events', href: '/events', label: 'Eventos', icon: Calendar },
    { id: 'internal-blog', href: '/internal-blog', label: 'Blog', icon: BookOpen },
    { id: 'notifications', href: '/notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', href: '/settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="w-64 bg-gradient-to-b from-gray-900 to-black border-r border-cyan-500/20 p-6 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
          </svg>
        </div>
        <span className="text-cyan-400 font-bold text-lg">IndaSocial</span>
      </Link>

      {/* Navigation */}
      <nav className="space-y-2 flex-1 overflow-y-auto pr-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-cyan-500/20 border-2 border-cyan-500 text-cyan-400 glow-cyan'
                  : 'text-gray-400 hover:bg-cyan-500/10 hover:text-cyan-400'
              }`}
            >
              <Icon size={20} />
              <span className="text-sm font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <button 
        onClick={onLogout}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all mt-4"
      >
        <LogOut size={20} />
        <span className="text-sm font-semibold">Logout</span>
      </button>
    </div>
  );
};

export default Sidebar;
