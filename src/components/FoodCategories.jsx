import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Sparkles, Coffee, Utensils, Flame, CupSoda, Zap, CheckCircle2, Calendar } from 'lucide-react';
import FoodItem from './FoodItem';
import { foodCategories } from '../data/sampleMenu';
import { useOrders } from '../context/OrderContext';

const categoryIcons = {
  Sparkles: Sparkles,
  Coffee: Coffee,
  Utensils: Utensils,
  Flame: Flame,
  CupSoda: CupSoda,
  Zap: Zap
};

export default function FoodCategories({ items = [] }) {
  const { effectiveMenu } = useOrders();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [vegOnly, setVegOnly] = useState(false);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [sortBy, setSortBy] = useState("popular"); // popular | price-asc | price-desc

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVeg = vegOnly ? item.isVeg : true;
    const matchesAvailability = onlyAvailable ? item.available : true;
    return matchesCategory && matchesSearch && matchesVeg && matchesAvailability;
  }).sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    return (b.reviewsCount || 0) - (a.reviewsCount || 0); // popular
  });

  return (
    <section id="explore-menu" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Section Header with Day-wise Schedule Information */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-xs font-bold text-[#F59E0B] uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5" />
              <span>{effectiveMenu.formattedDate}</span>
            </div>

            {effectiveMenu.isSpecialOverride && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF6B35]/20 border border-[#FF6B35]/40 text-xs font-black text-[#FF6B35] uppercase tracking-wider shadow-glow-secondary animate-pulse">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{effectiveMenu.specialInfo?.badge || 'Special Menu Override'}</span>
              </span>
            )}
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Today's Scheduled Menu
          </h2>
          <p className="text-sm text-[#A1A1AA] mt-1 max-w-xl">
            {effectiveMenu.isSpecialOverride 
              ? `${effectiveMenu.specialInfo?.title} • Active priority menu for today.`
              : `Automatically serving dishes scheduled for ${effectiveMenu.dayName}. Fresh on-order prep.`}
          </p>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-3">
          <div className="glass-panel px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs text-[#A1A1AA]">
            <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
            <span>
              <strong>{items.length} dishes</strong> scheduled for today
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="glass-card p-4 rounded-2xl mb-8 border border-white/10 space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Bar */}
          <div className="relative w-full md:flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search burgers, fried rice, masala dosa, coolers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#141414] border border-white/10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#F59E0B] transition-colors"
            />
          </div>

          {/* Quick Toggles */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Veg Only Toggle */}
            <button
              onClick={() => setVegOnly(!vegOnly)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                vegOnly
                  ? 'bg-green-500/20 text-green-400 border-green-500/50 shadow-sm'
                  : 'bg-[#141414] text-zinc-400 border-white/10 hover:text-white'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${vegOnly ? 'bg-green-400' : 'bg-zinc-500'}`} />
              <span>Veg Only</span>
            </button>

            {/* In-Stock Only */}
            <button
              onClick={() => setOnlyAvailable(!onlyAvailable)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                onlyAvailable
                  ? 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/50'
                  : 'bg-[#141414] text-zinc-400 border-white/10 hover:text-white'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${onlyAvailable ? 'bg-[#F59E0B]' : 'bg-zinc-500'}`} />
              <span>Available Now</span>
            </button>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-[#141414] border border-white/10 text-xs font-medium text-white focus:outline-none focus:border-[#F59E0B] cursor-pointer"
            >
              <option value="popular">Most Popular</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Category Pills Slider */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none pt-2 border-t border-white/5">
          {foodCategories.map((cat) => {
            const Icon = categoryIcons[cat.icon] || Sparkles;
            const isSelected = selectedCategory === cat.name || (cat.id === "all" && selectedCategory === "all");
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id === "all" ? "all" : cat.name)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all duration-200 ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#F59E0B] to-[#FF6B35] text-black shadow-glow-primary scale-102 font-extrabold'
                    : 'bg-[#141414] text-[#A1A1AA] hover:text-white hover:bg-white/5 border border-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-black' : 'text-[#F59E0B]'}`} />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Menu Grid or Empty States */}
      {items.length === 0 ? (
        <div className="glass-panel rounded-3xl p-14 text-center max-w-lg mx-auto my-8 border border-white/10 space-y-3">
          <Calendar className="w-14 h-14 text-zinc-600 mx-auto mb-2" />
          <h3 className="text-xl font-bold text-white">No dishes scheduled today</h3>
          <p className="text-xs text-[#A1A1AA] leading-relaxed max-w-sm mx-auto">
            The canteen kitchen does not have any items on the active schedule for {effectiveMenu.dayName}. Please check back on the next operating weekday.
          </p>
        </div>
      ) : filteredItems.length > 0 ? (
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filteredItems.map(item => (
            <FoodItem key={item.id} item={item} />
          ))}
        </motion.div>
      ) : (
        <div className="glass-panel rounded-2xl p-12 text-center max-w-md mx-auto my-8 border border-white/10">
          <Filter className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No items match your filters</h3>
          <p className="text-xs text-[#A1A1AA] mt-1">
            Try adjusting your search terms or clearing your category filters to view today's available meals.
          </p>
          <button
            onClick={() => {
              setSelectedCategory("all");
              setSearchQuery("");
              setVegOnly(false);
              setOnlyAvailable(false);
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all"
          >
            Reset Filters
          </button>
        </div>
      )}
    </section>
  );
}

