import React from 'react';
import FoodCategories from '../components/FoodCategories';
import { useOrders } from '../context/OrderContext';
import { Sparkles, Calendar } from 'lucide-react';

export default function Menu() {
  const { effectiveMenu } = useOrders();
  const todayDishes = effectiveMenu?.dishes || [];

  return (
    <div className="w-full bg-[#090909] text-white min-h-screen py-8">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
        <div className="glass-panel p-8 rounded-3xl border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#F59E0B]/10 blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F59E0B]/20 text-[#F59E0B] text-xs font-bold uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5" />
                <span>{effectiveMenu.formattedDate}</span>
              </div>

              {effectiveMenu.isSpecialOverride && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF6B35]/20 text-[#FF6B35] text-xs font-black uppercase tracking-wider border border-[#FF6B35]/40 animate-pulse">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{effectiveMenu.specialInfo?.badge || 'Special Fest Menu'}</span>
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Today's Scheduled Canteen Menu
            </h1>
            <p className="text-sm sm:text-base text-[#A1A1AA] mt-2 leading-relaxed">
              {effectiveMenu.isSpecialOverride
                ? `${effectiveMenu.specialInfo?.title}. Specially scheduled for today's college event.`
                : `Automatically displaying the weekly scheduled dishes for ${effectiveMenu.dayName}. Fresh on-order prep.`}
            </p>
          </div>
        </div>
      </div>

      {/* Main Categories & Catalog */}
      <FoodCategories items={todayDishes} />
    </div>
  );
}

