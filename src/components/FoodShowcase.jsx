import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Clock, Plus, Minus, ShoppingBag, ChevronRight, ChevronLeft, Sparkles, Check, Info } from 'lucide-react';
import FoodCanvas3D from './3d/FoodCanvas3D';
import { useCart } from '../context/CartContext';

export default function FoodShowcase({ items = [] }) {
  // Filter for the 6 showcase highlight items or use first 6
  const showcaseItems = items.slice(0, 6);
  const [activeIndex, setActiveIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddedFeedback, setIsAddedFeedback] = useState(false);
  const { addToCart, triggerPlasticPacking } = useCart();
  const containerRef = useRef(null);

  const currentItem = showcaseItems[activeIndex] || showcaseItems[0];

  // Reset quantity when active item changes
  useEffect(() => {
    setQuantity(1);
    setIsAddedFeedback(false);
  }, [activeIndex]);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % showcaseItems.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + showcaseItems.length) % showcaseItems.length);
  };

  // Wheel scroll interaction for seamless desktop browsing
  const lastWheelTime = useRef(0);
  const handleWheel = (e) => {
    const now = Date.now();
    if (now - lastWheelTime.current < 650) return; // debounce
    if (Math.abs(e.deltaY) > 30) {
      if (e.deltaY > 0) {
        if (activeIndex < showcaseItems.length - 1) {
          lastWheelTime.current = now;
          setActiveIndex(prev => prev + 1);
        }
      } else {
        if (activeIndex > 0) {
          lastWheelTime.current = now;
          setActiveIndex(prev => prev - 1);
        }
      }
    }
  };

  const handleAddToCart = (e) => {
    if (!currentItem || !currentItem.available) return;
    // Signature Realistic 3D Plastic Carry Bag Packing Interaction
    triggerPlasticPacking(currentItem, quantity, e);
    setIsAddedFeedback(true);
    setTimeout(() => setIsAddedFeedback(false), 1400);
  };

  return (
    <section 
      ref={containerRef}
      onWheel={handleWheel}
      className="relative min-h-[92vh] w-full bg-[#090909] text-white flex flex-col justify-center overflow-hidden border-y border-white/5 select-none"
    >
      {/* Dynamic 3D Three.js Ambient Particle & Lighting Field */}
      <FoodCanvas3D 
        themeColor={currentItem?.themeColor || "#F59E0B"} 
        activeIndex={activeIndex} 
      />

      {/* Background Decorative Radial Glows */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[140px] pointer-events-none transition-colors duration-1000 opacity-20"
        style={{ backgroundColor: currentItem?.themeColor || "#F59E0B" }}
      />
      <div className="absolute inset-0 bg-grid-pattern opacity-15 pointer-events-none" />

      {/* Top Banner Tag */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-8 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#F59E0B] tracking-wider uppercase backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
            <span>Interactive 3D Food Showcase • Item {activeIndex + 1} of {showcaseItems.length}</span>
          </div>
          
          {/* Quick Item Pills */}
          <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
            {showcaseItems.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => setActiveIndex(idx)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap ${
                  idx === activeIndex
                    ? 'bg-[#F59E0B] text-black font-bold shadow-glow-primary scale-105'
                    : 'bg-white/5 text-[#A1A1AA] hover:text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                <span>{item.shortName || item.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Central 3D Showcase Stage */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex items-center py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
          
          {/* LEFT COLUMN: Food Metadata, Description & Order Controls */}
          <div className="lg:col-span-5 order-2 lg:order-1 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentItem.id}
                initial={{ opacity: 0, x: -40, filter: 'blur(8px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, x: 30, filter: 'blur(8px)' }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-5"
              >
                {/* Badges & Category */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40">
                    {currentItem.badge}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                    currentItem.isVeg ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${currentItem.isVeg ? 'bg-green-400' : 'bg-red-400'}`} />
                    {currentItem.isVeg ? 'Pure Veg' : 'Non-Veg'}
                  </span>
                  <span className="text-xs text-[#A1A1AA] flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                    <Clock className="w-3 h-3 text-[#F59E0B]" />
                    {currentItem.prepTime}
                  </span>
                  <span className="text-xs text-[#A1A1AA] flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                    <Flame className="w-3 h-3 text-[#FF6B35]" />
                    {currentItem.calories}
                  </span>
                </div>

                {/* Big Title */}
                <div>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                    {currentItem.name}
                  </h2>
                  <p className="text-sm sm:text-base text-[#F59E0B] font-medium mt-1">
                    {currentItem.tagline}
                  </p>
                </div>

                {/* Description */}
                <p className="text-sm sm:text-base text-[#A1A1AA] leading-relaxed">
                  {currentItem.description}
                </p>

                {/* Ingredients Pills */}
                <div>
                  <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">Key Ingredients</p>
                  <div className="flex flex-wrap gap-1.5">
                    {currentItem.ingredients?.map((ing, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 rounded-md bg-[#1B1B1B] text-zinc-300 border border-white/5">
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Price & Quantity & Active Order Button */}
                <div className="pt-2">
                  <div className="flex items-baseline gap-3 mb-4">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white">
                      ₹{currentItem.price}
                    </span>
                    {currentItem.originalPrice && (
                      <span className="text-lg text-zinc-500 line-through">
                        ₹{currentItem.originalPrice}
                      </span>
                    )}
                    <span className="text-xs font-bold text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 rounded border border-[#22C55E]/20">
                      Save ₹{currentItem.originalPrice - currentItem.price}
                    </span>
                  </div>

                  {/* Order Controls */}
                  <div className="flex flex-wrap items-center gap-4">
                    {/* Quantity Picker */}
                    <div className="flex items-center bg-[#1B1B1B] border border-white/10 rounded-xl p-1 shadow-inner">
                      <button
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        disabled={quantity <= 1 || !currentItem.available}
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-white/80 hover:bg-white/10 active:scale-95 transition-all disabled:opacity-40"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center font-bold text-white text-base">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(q => q + 1)}
                        disabled={!currentItem.available}
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-white/80 hover:bg-white/10 active:scale-95 transition-all disabled:opacity-40"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Order Now / Add to Cart Active Button */}
                    <button
                      onClick={handleAddToCart}
                      disabled={!currentItem.available}
                      className={`flex-1 min-w-[200px] h-12 px-6 rounded-xl font-bold flex items-center justify-center gap-2.5 transition-all duration-300 shadow-lg ${
                        isAddedFeedback
                          ? 'bg-[#22C55E] text-black shadow-glow-primary scale-95'
                          : currentItem.available
                            ? 'bg-gradient-to-r from-[#F59E0B] to-[#FF6B35] text-black hover:opacity-95 hover:shadow-glow-primary active:scale-[0.98]'
                            : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                      }`}
                    >
                      {isAddedFeedback ? (
                        <>
                          <Check className="w-5 h-5 stroke-[3]" />
                          <span>Added to Cart!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-5 h-5" />
                          <span>{currentItem.available ? `Order Now • ₹${currentItem.price * quantity}` : 'Sold Out for Today'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Live Kitchen Stock Alert */}
                  <div className="mt-3 flex items-center gap-2 text-xs text-[#A1A1AA]">
                    <div className={`w-2 h-2 rounded-full ${currentItem.stock > 10 ? 'bg-[#22C55E] animate-pulse' : 'bg-red-500'}`} />
                    <span>
                      {currentItem.available 
                        ? `${currentItem.stock} portions remaining in canteen kitchen today`
                        : "Out of stock - Check back at next canteen restock"}
                    </span>
                  </div>
                </div>

              </motion.div>
            </AnimatePresence>
          </div>

          {/* RIGHT COLUMN: Interactive 3D Food Presentation with Scale, Depth & Parallax */}
          <div className="lg:col-span-7 order-1 lg:order-2 relative flex items-center justify-center min-h-[380px] sm:min-h-[460px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentItem.id}
                initial={{ 
                  opacity: 0, 
                  scale: 0.65, 
                  rotateY: -35,
                  rotateZ: -8,
                  z: -100,
                  filter: 'blur(10px)'
                }}
                animate={{ 
                  opacity: 1, 
                  scale: 1, 
                  rotateY: 0,
                  rotateZ: 0,
                  z: 0,
                  filter: 'blur(0px)'
                }}
                exit={{ 
                  opacity: 0, 
                  scale: 1.25, 
                  rotateY: 35,
                  rotateZ: 8,
                  z: 100,
                  filter: 'blur(12px)'
                }}
                transition={{ 
                  duration: 0.7, 
                  ease: [0.19, 1, 0.22, 1] 
                }}
                className="relative z-10 w-full max-w-[480px] aspect-square flex items-center justify-center perspective-[1200px]"
              >
                {/* Glowing Base Shadow Plate */}
                <div 
                  className="absolute bottom-6 w-4/5 h-16 rounded-[100%] blur-xl opacity-60 transition-colors duration-700 -z-10"
                  style={{ backgroundColor: currentItem.themeColor || "#F59E0B" }}
                />

                {/* Main 3D Food Visual */}
                <motion.div
                  animate={{ 
                    y: [-8, 8, -8],
                    rotate: [-1.5, 1.5, -1.5]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 5, 
                    ease: "easeInOut" 
                  }}
                  className="relative group cursor-grab active:cursor-grabbing w-full h-full flex items-center justify-center"
                >
                  <img
                    src={currentItem.image}
                    alt={currentItem.name}
                    className="w-full h-full object-cover rounded-3xl shadow-2xl border border-white/10 transform transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Glassmorphism Floating Price Tag */}
                  <motion.div 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="absolute -top-3 -right-3 glass-panel px-4 py-2.5 rounded-2xl border border-[#F59E0B]/40 shadow-glow-primary flex items-center gap-2"
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] animate-ping" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#A1A1AA] block leading-none">Canteen Price</span>
                      <span className="text-lg font-black text-white leading-none">₹{currentItem.price}</span>
                    </div>
                  </motion.div>

                  {/* Floating Freshness Badge */}
                  <motion.div 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="absolute -bottom-3 -left-3 glass-panel px-3.5 py-2 rounded-2xl border border-white/10 shadow-lg flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-[#F59E0B]" />
                    <span className="text-xs font-semibold text-white">Made Fresh On-Order</span>
                  </motion.div>
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {/* Showcase Next / Prev Navigation Controls */}
            <div className="absolute inset-x-0 bottom-2 lg:-bottom-6 flex items-center justify-between px-2 sm:px-8 pointer-events-none z-20">
              <button
                onClick={handlePrev}
                aria-label="Previous Food Item"
                className="w-12 h-12 rounded-full glass-panel hover:bg-white/10 border border-white/10 flex items-center justify-center text-white pointer-events-auto transition-all hover:scale-110 active:scale-95 shadow-lg group"
              >
                <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform text-[#F59E0B]" />
              </button>

              <div className="flex items-center gap-2 pointer-events-auto bg-[#141414]/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                {showcaseItems.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveIndex(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === activeIndex
                        ? 'w-7 bg-[#F59E0B]'
                        : 'w-2 bg-white/20 hover:bg-white/40'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                aria-label="Next Food Item"
                className="w-12 h-12 rounded-full glass-panel hover:bg-white/10 border border-white/10 flex items-center justify-center text-white pointer-events-auto transition-all hover:scale-110 active:scale-95 shadow-lg group"
              >
                <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform text-[#F59E0B]" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Hint */}
      <div className="relative z-10 text-center pb-4 text-xs text-[#A1A1AA]/60 flex items-center justify-center gap-2">
        <span>Scroll or swipe to rotate 3D showcase items</span>
        <span>•</span>
        <span>Instant canteen token on pre-order</span>
      </div>
    </section>
  );
}

