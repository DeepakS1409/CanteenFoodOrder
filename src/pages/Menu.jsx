import React from 'react';
import FoodCategories from '../components/FoodCategories';
import { useOrders } from '../context/OrderContext';
import { Sparkles, Utensils } from 'lucide-react';

export default function Menu() {
  const { menuItems } = useOrders();

  return (
    <div className="w-full bg-[#090909] text-white min-h-screen py-8">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
        <div className="glass-panel p-8 rounded-3xl border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#F59E0B]/10 blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F59E0B]/20 text-[#F59E0B] text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Full Canteen Catalog</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Fresh Daily Menu
            </h1>
            <p className="text-sm sm:text-base text-[#A1A1AA] mt-2 leading-relaxed">
              Every dish is freshly prepped upon receiving your order token. Filter by dietary preference, meal slot, or snack cravings.
            </p>
          </div>
        </div>
      </div>

      {/* Main Categories & Catalog */}
      <FoodCategories items={menuItems} />
    </div>
  );
}

