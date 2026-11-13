import React, { useState } from 'react';
import { 
  ShoppingBag, 
  User, 
  UtensilsCrossed, 
  Clock, 
  ShieldCheck, 
  Flame, 
  Menu as MenuIcon, 
  X,
  Sparkles,
  ChevronDown,
  ArrowRight
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';

export default function Navbar({ currentRoute, onRouteChange }) {
  const { totalItemsCount, setIsCartOpen } = useCart();
  const { role, switchRole, currentUser } = useAuth();
  const { orders } = useOrders();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Count active student orders
  const activeOrdersCount = orders.filter(o => 
    ['Pending', 'Accepted', 'Cooking', 'Ready for Pickup'].includes(o.status)
  ).length;

  const handleNav = (route) => {
    onRouteChange(route);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Top Demo Role Switcher Bar */}
      <div className="bg-[#141414] border-b border-white/5 py-1.5 px-4 text-xs select-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-ping" />
            <span className="hidden sm:inline">College Central Canteen System • Live Sync Mode</span>
            <span className="sm:hidden font-medium text-white">CampusBite Live</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-zinc-500 hidden md:inline">Viewing as:</span>
            <div className="flex items-center bg-[#090909] p-0.5 rounded-lg border border-white/10">
              <button
                onClick={() => { switchRole('student'); onRouteChange('home'); }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 ${
                  role === 'student'
                    ? 'bg-[#F59E0B] text-black shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <User className="w-3 h-3" />
                <span>Student</span>
              </button>
              <button
                onClick={() => { switchRole('admin'); onRouteChange('admin-dashboard'); }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 ${
                  role === 'admin'
                    ? 'bg-[#FF6B35] text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3 h-3" />
                <span>Canteen Admin</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Glassmorphic Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#090909]/85 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            
            {/* Brand Logo */}
            <div 
              onClick={() => handleNav(role === 'admin' ? 'admin-dashboard' : 'home')}
              className="flex items-center gap-3 cursor-pointer group select-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF6B35] to-[#F59E0B] p-0.5 shadow-glow-primary transition-transform group-hover:scale-105">
                <div className="w-full h-full bg-[#090909] rounded-[10px] flex items-center justify-center">
                  <Flame className="w-5 h-5 text-[#F59E0B] group-hover:scale-110 transition-transform" />
                </div>
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-white flex items-center">
                  Campus<span className="text-[#F59E0B]">Bite</span>
                </span>
                <span className="text-[10px] font-medium text-zinc-400 block -mt-1 tracking-wider uppercase">
                  {role === 'admin' ? 'Staff Portal' : '3D Food Ordering'}
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {role === 'student' ? (
                <>
                  <button
                    onClick={() => handleNav('home')}
                    className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                      currentRoute === 'home'
                        ? 'text-[#F59E0B] bg-white/5'
                        : 'text-zinc-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Home
                  </button>
                  <button
                    onClick={() => handleNav('menu')}
                    className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                      currentRoute === 'menu'
                        ? 'text-[#F59E0B] bg-white/5'
                        : 'text-zinc-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Explore Menu
                  </button>
                  <button
                    onClick={() => handleNav('my-orders')}
                    className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                      currentRoute === 'my-orders'
                        ? 'text-[#F59E0B] bg-white/5'
                        : 'text-zinc-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>My Orders</span>
                    {activeOrdersCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-[#22C55E] text-black animate-pulse">
                        {activeOrdersCount}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => handleNav('profile')}
                    className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                      currentRoute === 'profile'
                        ? 'text-[#F59E0B] bg-white/5'
                        : 'text-zinc-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </button>
                </>
              ) : (
                /* Admin Nav Links */
                <>
                  <button
                    onClick={() => handleNav('admin-dashboard')}
                    className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                      currentRoute === 'admin-dashboard'
                        ? 'text-[#FF6B35] bg-white/5 font-bold'
                        : 'text-zinc-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => handleNav('admin-schedule')}
                    className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                      currentRoute === 'admin-schedule'
                        ? 'text-[#F59E0B] bg-white/5 font-bold'
                        : 'text-zinc-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>Menu Planner</span>
                  </button>
                  <button
                    onClick={() => handleNav('admin-orders')}
                    className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                      currentRoute === 'admin-orders'
                        ? 'text-[#FF6B35] bg-white/5 font-bold'
                        : 'text-zinc-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>Incoming Orders</span>
                    {orders.filter(o => o.status === 'Pending').length > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-red-500 text-white">
                        {orders.filter(o => o.status === 'Pending').length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => handleNav('admin-cooking')}
                    className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                      currentRoute === 'admin-cooking'
                        ? 'text-[#FF6B35] bg-white/5 font-bold'
                        : 'text-zinc-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Cooking Summary
                  </button>
                  <button
                    onClick={() => handleNav('admin-menu')}
                    className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                      currentRoute === 'admin-menu'
                        ? 'text-[#FF6B35] bg-white/5 font-bold'
                        : 'text-zinc-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Catalog
                  </button>
                </>
              )}
            </nav>

            {/* Right Action Icons: Cart & Profile */}
            <div className="flex items-center gap-3">
              {role === 'student' && (
                <button
                  onClick={() => setIsCartOpen(true)}
                  aria-label="View Cart"
                  className="relative p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all hover:scale-105 active:scale-95 group"
                >
                  <ShoppingBag className="w-5 h-5 text-[#F59E0B] group-hover:scale-110 transition-transform" />
                  {totalItemsCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-gradient-to-r from-[#F59E0B] to-[#FF6B35] text-black font-black text-xs flex items-center justify-center shadow-glow-primary">
                      {totalItemsCount}
                    </span>
                  )}
                </button>
              )}

              {/* User Avatar Capsule */}
              <div 
                onClick={() => handleNav(role === 'student' ? 'profile' : 'admin-dashboard')}
                className="hidden sm:flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer transition-all"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-lg object-cover border border-[#F59E0B]/40"
                />
                <div className="text-left">
                  <span className="text-xs font-bold text-white block leading-tight">{currentUser.name}</span>
                  <span className="text-[10px] text-zinc-400 block leading-none">
                    {role === 'student' ? `Balance: ₹${currentUser.campusCardBalance}` : 'Kitchen Master'}
                  </span>
                </div>
              </div>

              {/* Mobile hamburger menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2.5 rounded-xl bg-white/5 text-zinc-300 hover:text-white border border-white/10"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#141414] border-b border-white/10 px-4 pt-2 pb-6 space-y-2">
            {role === 'student' ? (
              <>
                <button
                  onClick={() => handleNav('home')}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:bg-white/5"
                >
                  Home
                </button>
                <button
                  onClick={() => handleNav('menu')}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:bg-white/5"
                >
                  Explore Menu
                </button>
                <button
                  onClick={() => handleNav('my-orders')}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:bg-white/5 flex items-center justify-between"
                >
                  <span>My Orders</span>
                  {activeOrdersCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#22C55E] text-black">
                      {activeOrdersCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => handleNav('profile')}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:bg-white/5"
                >
                  Student Profile
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleNav('admin-dashboard')}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:bg-white/5"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => handleNav('admin-schedule')}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-[#F59E0B] hover:bg-white/5"
                >
                  Weekly Menu Planner
                </button>
                <button
                  onClick={() => handleNav('admin-orders')}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:bg-white/5"
                >
                  Incoming Orders
                </button>
                <button
                  onClick={() => handleNav('admin-cooking')}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:bg-white/5"
                >
                  Cooking Summary
                </button>
                <button
                  onClick={() => handleNav('admin-menu')}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-white hover:bg-white/5"
                >
                  Food Catalog
                </button>
              </>
            )}

            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-zinc-400">Switch Demo Role:</span>
              <button
                onClick={() => {
                  switchRole(role === 'student' ? 'admin' : 'student');
                  onRouteChange(role === 'student' ? 'admin-dashboard' : 'home');
                  setMobileMenuOpen(false);
                }}
                className="text-xs font-bold text-[#F59E0B] px-3 py-1.5 rounded-lg bg-white/5"
              >
                Switch to {role === 'student' ? 'Canteen Admin' : 'Student'}
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

