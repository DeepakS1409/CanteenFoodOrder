import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Flame, 
  UtensilsCrossed, 
  BarChart3, 
  Settings, 
  LogOut, 
  ChefHat, 
  Sparkles,
  Calendar,
  Bell,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import DevDateSimulator from './DevDateSimulator';

export default function AdminLayout({ activeTab, onTabChange, onExitAdmin, children }) {
  const { adminProfile, switchRole, logout } = useAuth();
  const { orders } = useOrders();

  const pendingCount = orders.filter(o => o.status === 'Pending').length;
  const cookingCount = orders.filter(o => o.status === 'Cooking').length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'schedule', label: 'Weekly Menu Planner', icon: Calendar, highlight: true },
    { id: 'special-dates', label: 'Special Date Menu', icon: Sparkles },
    { id: 'orders', label: 'Incoming Orders', icon: ShoppingBag, badge: pendingCount > 0 ? pendingCount : null },
    { id: 'cooking', label: 'Cooking Summary', icon: Flame },
    { id: 'menu', label: 'Food Catalog', icon: UtensilsCrossed },
    { id: 'analytics', label: 'Analytics & Trends', icon: BarChart3 },
    { id: 'settings', label: 'Kitchen Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#090909] text-white flex flex-col md:flex-row">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#141414] border-r border-white/10 flex flex-col justify-between p-4 shrink-0">
        <div>
          {/* Admin Header & Logo */}
          <div className="flex items-center gap-3 px-2 py-3 mb-6 border-b border-white/5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF6B35] to-[#F59E0B] flex items-center justify-center text-black font-black">
              <ChefHat className="w-6 h-6 text-black" />
            </div>
            <div>
              <span className="text-base font-black text-white block leading-tight">Canteen Admin</span>
              <span className="text-[10px] text-[#F59E0B] font-bold block uppercase tracking-wider">Kitchen Control 2.0</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#FF6B35] to-[#F59E0B] text-black shadow-glow-secondary font-extrabold'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-black animate-pulse">
                      {item.badge}
                    </span>
                  )}

                  {item.highlight && !item.badge && (
                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#F59E0B]/20 text-[#F59E0B] font-black">
                      KDS
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Staff Info & Exit Button */}
        <div className="pt-4 border-t border-white/5 space-y-3">
          <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl bg-white/5">
            <img
              src={adminProfile.avatar}
              alt={adminProfile.name}
              className="w-8 h-8 rounded-lg object-cover border border-[#FF6B35]"
            />
            <div className="text-left overflow-hidden">
              <span className="text-xs font-bold text-white block truncate">{adminProfile.name}</span>
              <span className="text-[10px] text-zinc-400 block truncate">{adminProfile.badgeTitle}</span>
            </div>
          </div>

          <button
            onClick={() => {
              switchRole('student');
              onExitAdmin();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-zinc-300 hover:text-white border border-white/10 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Switch to Student App</span>
          </button>

          <button
            onClick={async () => {
              await logout();
              onExitAdmin();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-xs font-semibold text-red-400 hover:text-red-300 border border-red-500/20 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Staff Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Control Bar */}
        <header className="sticky top-0 z-30 bg-[#090909]/80 backdrop-blur-md border-b border-white/10 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E] animate-ping" />
            <span className="text-xs font-bold text-white tracking-wide">
              Central Canteen Kitchen Live Feed
            </span>
          </div>

          {/* Development-Only Date Simulation Control */}
          <div className="flex items-center gap-3">
            <DevDateSimulator />

            <div className="hidden lg:flex items-center gap-4 text-xs">
              <div className="h-4 w-px bg-white/10" />
              <span className="text-zinc-400">
                Cooking: <strong className="text-[#F59E0B] font-bold">{cookingCount}</strong>
              </span>
              <div className="h-4 w-px bg-white/10" />
              <span className="text-zinc-400">
                Pending: <strong className="text-red-400 font-bold">{pendingCount}</strong>
              </span>
            </div>
          </div>
        </header>

        {/* Tab Content Body */}
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

    </div>
  );
}

