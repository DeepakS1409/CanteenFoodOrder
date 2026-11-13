import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Clock, Plus, Minus, ShoppingBag, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function FoodItem({ item }) {
  const [quantity, setQuantity] = useState(1);
  const [isAddedFeedback, setIsAddedFeedback] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    if (!item.available) return;
    addToCart(item, quantity, e);
    setIsAddedFeedback(true);
    setTimeout(() => setIsAddedFeedback(false), 1200);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className={`group relative rounded-2xl bg-[#1B1B1B] border transition-all duration-300 flex flex-col justify-between overflow-hidden ${
        item.available 
          ? 'border-white/10 hover:border-[#F59E0B]/40 hover:shadow-glow-card' 
          : 'border-red-500/20 opacity-70'
      }`}
    >
      {/* Top Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/40">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108 group-hover:rotate-1"
          loading="lazy"
        />

        {/* Veg / Non-Veg Indicator */}
        <div className="absolute top-3 left-3 z-10">
          <div className={`w-5 h-5 rounded-md border flex items-center justify-center backdrop-blur-md ${
            item.isVeg ? 'border-green-500 bg-green-950/60' : 'border-red-500 bg-red-950/60'
          }`}>
            <div className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
          </div>
        </div>

        {/* Badge or Sold Out Notice */}
        <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-1.5">
          {item.badge && item.available && (
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#F59E0B] text-black shadow-md">
              {item.badge}
            </span>
          )}
          {!item.available && (
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-red-500/90 text-white shadow-md">
              Sold Out
            </span>
          )}
        </div>

        {/* Quick Time & Calorie Ribbon */}
        <div className="absolute bottom-2 inset-x-2 z-10 flex items-center justify-between px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[11px] text-[#A1A1AA] border border-white/5">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#F59E0B]" />
            {item.prepTime}
          </span>
          <span className="flex items-center gap-1">
            <Flame className="w-3 h-3 text-[#FF6B35]" />
            {item.calories}
          </span>
        </div>
      </div>

      {/* Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-white text-base sm:text-lg group-hover:text-[#F59E0B] transition-colors leading-snug">
              {item.name}
            </h3>
          </div>

          <p className="text-xs text-[#A1A1AA] line-clamp-2 mt-1 leading-relaxed">
            {item.description}
          </p>

          {/* Stock remaining notification */}
          <div className="mt-2.5 flex items-center gap-1.5 text-[11px]">
            <span className={`w-1.5 h-1.5 rounded-full ${item.available ? (item.stock > 10 ? 'bg-[#22C55E]' : 'bg-amber-400 animate-ping') : 'bg-red-500'}`} />
            <span className={item.available ? (item.stock > 10 ? 'text-zinc-400' : 'text-amber-400 font-medium') : 'text-red-400 font-medium'}>
              {item.available ? (item.stock > 10 ? `${item.stock} left today` : `Only ${item.stock} left in kitchen!`) : 'Out of stock'}
            </span>
          </div>
        </div>

        {/* Pricing & Add to Cart Controls */}
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-white">₹{item.price}</span>
              {item.originalPrice && (
                <span className="text-xs text-zinc-500 line-through">₹{item.originalPrice}</span>
              )}
            </div>
          </div>

          {/* Quantity and Add Button */}
          {item.available ? (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center bg-[#141414] rounded-lg border border-white/10 p-0.5">
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-6 h-6 rounded flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-5 text-center text-xs font-bold text-white">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-6 h-6 rounded flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                  isAddedFeedback
                    ? 'bg-[#22C55E] text-black shadow-glow-primary'
                    : 'bg-[#F59E0B] text-black hover:bg-[#FF6B35] active:scale-95'
                }`}
              >
                {isAddedFeedback ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Added</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <button
              disabled
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 text-zinc-500 cursor-not-allowed"
            >
              Unavailable
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

