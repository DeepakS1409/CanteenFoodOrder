import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { Flame, Clock, Plus, Minus, ShoppingBag, ChevronRight, ChevronLeft, Sparkles, Check, MoveHorizontal } from 'lucide-react';
import FoodCanvas3D from './3d/FoodCanvas3D';
import { useCart } from '../context/CartContext';

export default function FoodShowcase({ items = [] }) {
  const showcaseItems = items.slice(0, 6);
  const [activeIndex, setActiveIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddedFeedback, setIsAddedFeedback] = useState(false);
  const { triggerPlasticPacking } = useCart();

  // Orbit animation state
  // Continuous progress value: 0 to showcaseItems.length - 1
  const [orbitProgress, setOrbitProgress] = useState(0);
  const progressProxy = useRef({ value: 0 });
  const orbitContainerRef = useRef(null);
  const sectionRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartProgressRef = useRef(0);
  const dragLockedDirectionRef = useRef(null); // 'horizontal' | 'vertical' | null
  const tweenRef = useRef(null);

  const currentItem = showcaseItems[activeIndex] || showcaseItems[0];

  // Keep progressProxy in sync when activeIndex is changed externally (e.g. pill click)
  const snapTo = useCallback((targetIndex, duration = 0.6) => {
    const clamped = Math.max(0, Math.min(showcaseItems.length - 1, targetIndex));
    if (tweenRef.current) tweenRef.current.kill();

    tweenRef.current = gsap.to(progressProxy.current, {
      value: clamped,
      duration,
      ease: 'power2.out',
      onUpdate: () => {
        setOrbitProgress(progressProxy.current.value);
      },
      onComplete: () => {
        setActiveIndex(clamped);
      }
    });
  }, [showcaseItems.length]);

  // Reset quantity when active item changes
  useEffect(() => {
    setQuantity(1);
    setIsAddedFeedback(false);
  }, [activeIndex]);

  const handleNext = () => {
    if (activeIndex < showcaseItems.length - 1) {
      snapTo(activeIndex + 1);
    } else {
      snapTo(0);
    }
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      snapTo(activeIndex - 1);
    } else {
      snapTo(showcaseItems.length - 1);
    }
  };

  /**
   * CRITICAL WHEEL HANDLER:
   * Separates vertical scrolling (normal page movement) from horizontal scrolling (food orbit).
   * 1. If user scrolls vertically (deltaY without shiftKey, and abs(deltaY) >= abs(deltaX)):
   *    -> Do NOT preventDefault! Do NOT change orbit! Let the page scroll normally!
   * 2. Only if horizontal intent detected (deltaX significant OR shiftKey with wheel):
   *    -> Prevent horizontal browser navigation and smoothly orbit the 3D dishes!
   */
  useEffect(() => {
    const section = orbitContainerRef.current;
    if (!section) return;

    let wheelTimeout = null;

    const onWheel = (e) => {
      // Determine if horizontal scroll intent:
      // Either direct horizontal delta (trackpad sideways gesture) OR Shift + mouse wheel
      const isShiftWheel = e.shiftKey && Math.abs(e.deltaY) > 0;
      const isHorizontalDelta = Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 4;

      if (!isShiftWheel && !isHorizontalDelta) {
        // PURE VERTICAL SCROLL: Allow browser default page scrolling completely untouched!
        return;
      }

      // HORIZONTAL SCROLL DETECTED: Prevent default browser side-bounce and move food horizontally
      e.preventDefault();

      const delta = isShiftWheel ? e.deltaY : e.deltaX;
      const sensitivity = 0.0022;
      const newProgress = Math.max(
        0,
        Math.min(showcaseItems.length - 1, progressProxy.current.value + delta * sensitivity)
      );

      progressProxy.current.value = newProgress;
      setOrbitProgress(newProgress);

      // Settle smoothly into nearest dish position after horizontal wheel stops
      clearTimeout(wheelTimeout);
      wheelTimeout = setTimeout(() => {
        const nearestIndex = Math.round(progressProxy.current.value);
        snapTo(nearestIndex, 0.45);
      }, 90);
    };

    section.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      section.removeEventListener('wheel', onWheel);
      clearTimeout(wheelTimeout);
    };
  }, [showcaseItems.length, snapTo]);

  /**
   * TOUCH & DRAG HANDLERS:
   * Independent vertical vs horizontal detection.
   * If user swipes vertically: page scrolls naturally.
   * If user swipes horizontally on the food area: orbits the food dishes.
   */
  const handleTouchStart = (e) => {
    const touch = e.touches ? e.touches[0] : e;
    isDraggingRef.current = true;
    dragStartXRef.current = touch.clientX;
    dragStartProgressRef.current = progressProxy.current.value;
    dragLockedDirectionRef.current = null;
    if (tweenRef.current) tweenRef.current.kill();
  };

  const handleTouchMove = (e) => {
    if (!isDraggingRef.current) return;
    const touch = e.touches ? e.touches[0] : e;
    const diffX = touch.clientX - dragStartXRef.current;
    const diffY = touch.clientY - (dragStartXRef.currentY || touch.clientY);

    // Detect direction lock on first movement
    if (!dragLockedDirectionRef.current) {
      if (Math.abs(diffX) > 8 || Math.abs(diffY) > 8) {
        if (Math.abs(diffX) > Math.abs(diffY)) {
          dragLockedDirectionRef.current = 'horizontal';
        } else {
          dragLockedDirectionRef.current = 'vertical';
          isDraggingRef.current = false; // let native vertical scroll take over
          return;
        }
      } else {
        return;
      }
    }

    if (dragLockedDirectionRef.current === 'horizontal') {
      if (e.cancelable && e.preventDefault) e.preventDefault();
      const dragFactor = -diffX / (window.innerWidth < 640 ? 280 : 420);
      const targetProgress = Math.max(
        0,
        Math.min(showcaseItems.length - 1, dragStartProgressRef.current + dragFactor)
      );
      progressProxy.current.value = targetProgress;
      setOrbitProgress(targetProgress);
    }
  };

  const handleTouchEnd = () => {
    if (!isDraggingRef.current && dragLockedDirectionRef.current !== 'horizontal') return;
    isDraggingRef.current = false;
    dragLockedDirectionRef.current = null;
    const nearestIndex = Math.round(progressProxy.current.value);
    snapTo(nearestIndex, 0.45);
  };

  const handleAddToCart = (e) => {
    if (!currentItem || !currentItem.available) return;
    triggerPlasticPacking(currentItem, quantity, e);
    setIsAddedFeedback(true);
    setTimeout(() => setIsAddedFeedback(false), 1400);
  };

  if (showcaseItems.length === 0) {
    return (
      <section className="relative min-h-[35vh] w-full bg-[#090909] text-white flex items-center justify-center p-8 border-y border-white/5 select-none">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-white/10 text-center max-w-md space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#F59E0B]/20 flex items-center justify-center text-[#F59E0B] mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">No 3D Showcase Dishes Today</h3>
          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            There are no dishes scheduled in the weekly menu planner for today.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section 
      ref={sectionRef}
      className="relative min-h-[92vh] w-full bg-[#090909] text-white flex flex-col justify-center overflow-hidden border-y border-white/5 select-none"
    >
      {/* 3D Ambient Stage */}
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

      {/* Top Banner Tag & Category Selector */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-8 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#F59E0B] tracking-wider uppercase backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
            <span>3D Food Orbit • {showcaseItems[activeIndex]?.name} ({activeIndex + 1}/{showcaseItems.length})</span>
          </div>
          
          {/* Quick Item Direct Navigation Pills */}
          <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
            {showcaseItems.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => snapTo(idx)}
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

      {/* Main Showcase Stage Area */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex items-center py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
          
          {/* LEFT COLUMN: Stable Food Metadata, Description & Order Controls */}
          <div className="lg:col-span-5 order-2 lg:order-1 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentItem.id}
                initial={{ opacity: 0, x: -20, filter: 'blur(4px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, x: 20, filter: 'blur(4px)' }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
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

                {/* Big Title & Tagline */}
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

                {/* Pricing, Quantity & Order Now */}
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

                  {/* Quantity & Order Button */}
                  <div className="flex flex-wrap items-center gap-4">
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

                  <div className="mt-3 flex items-center gap-2 text-xs text-[#A1A1AA]">
                    <div className={`w-2 h-2 rounded-full ${currentItem.stock > 10 ? 'bg-[#22C55E] animate-pulse' : 'bg-red-500'}`} />
                    <span>{currentItem.available ? `${currentItem.stock} portions ready in kitchen today` : 'Sold out for today'}</span>
                  </div>
                </div>

              </motion.div>
            </AnimatePresence>
          </div>

          {/* RIGHT COLUMN: 3D HORIZONTAL CIRCULAR ORBIT STAGE */}
          <div 
            ref={orbitContainerRef}
            onMouseDown={handleTouchStart}
            onMouseMove={handleTouchMove}
            onMouseUp={handleTouchEnd}
            onMouseLeave={handleTouchEnd}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="lg:col-span-7 order-1 lg:order-2 relative flex items-center justify-center min-h-[420px] sm:min-h-[500px] overflow-visible cursor-grab active:cursor-grabbing perspective-[1400px]"
          >
            {/* Ambient Radial Ground Glow */}
            <div 
              className="absolute bottom-6 w-3/4 h-20 rounded-[100%] blur-2xl opacity-50 transition-colors duration-700 pointer-events-none -z-10"
              style={{ backgroundColor: currentItem.themeColor || "#F59E0B" }}
            />

            {/* Circular Orbit Dish Presentation Ring */}
            <div className="relative w-full max-w-[560px] h-[400px] sm:h-[460px] flex items-center justify-center transform-style-3d">
              {showcaseItems.map((item, idx) => {
                // Calculate continuous circular arc position
                const offset = idx - orbitProgress;
                
                // Do not render items that are completely behind or far outside view
                if (Math.abs(offset) > 2.5) return null;

                // Orbit arc geometry (cylinder projection)
                const arcAngle = offset * 0.78; // angle in radians along circular orbit
                const radius = 340; // horizontal arc radius in px
                
                // Circular coordinates
                const x = Math.sin(arcAngle) * radius;
                const z = (Math.cos(arcAngle) - 1) * 280; // curves back into depth
                const scale = Math.max(0.5, Math.cos(arcAngle) * 0.52 + 0.48);
                const rotationY = -arcAngle * 35; // turns inward towards center viewer
                const opacity = Math.max(0, Math.cos(arcAngle) * 1.3 - 0.3);
                const isCenter = Math.abs(offset) < 0.35;
                const zIndex = Math.round(100 + z);

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (!isCenter) snapTo(idx);
                    }}
                    style={{
                      transform: `translate3d(${x}px, 0px, ${z}px) rotateY(${rotationY}deg) scale(${scale})`,
                      opacity,
                      zIndex,
                      pointerEvents: isCenter ? 'auto' : 'pointer'
                    }}
                    className={`absolute w-[290px] sm:w-[350px] aspect-square rounded-3xl transition-shadow duration-300 ${
                      isCenter ? 'cursor-default' : 'cursor-pointer hover:opacity-100'
                    }`}
                  >
                    {/* Shadow underneath individual dish */}
                    <div 
                      className="absolute -bottom-8 inset-x-8 h-8 rounded-full blur-xl bg-black/80 pointer-events-none transition-opacity duration-300"
                      style={{ opacity: isCenter ? 0.9 : 0.4 }}
                    />

                    {/* Dish Image Container */}
                    <div className="w-full h-full relative rounded-3xl overflow-hidden border-2 border-white/10 bg-[#141414] shadow-2xl group">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105 pointer-events-none"
                        draggable={false}
                      />

                      {/* Floating Price Tag for Centered Active Dish */}
                      {isCenter && (
                        <motion.div 
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.15 }}
                          className="absolute -top-2 -right-2 glass-panel px-3.5 py-2 rounded-2xl border border-[#F59E0B]/50 shadow-glow-primary flex items-center gap-2 pointer-events-none"
                        >
                          <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] animate-ping" />
                          <div>
                            <span className="text-[9px] uppercase font-bold text-[#A1A1AA] block leading-none">Canteen Price</span>
                            <span className="text-base font-black text-white leading-none">₹{item.price}</span>
                          </div>
                        </motion.div>
                      )}

                      {/* Freshness Badge for Centered Dish */}
                      {isCenter && (
                        <motion.div 
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="absolute bottom-3 left-3 glass-panel px-3 py-1.5 rounded-xl border border-white/10 shadow-lg flex items-center gap-1.5 pointer-events-none"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
                          <span className="text-[11px] font-bold text-white">Active in 3D View</span>
                        </motion.div>
                      )}

                      {/* Title ribbon for non-centered dishes in orbit */}
                      {!isCenter && (
                        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                          <span className="text-xs font-bold text-white block truncate">{item.name}</span>
                          <span className="text-[10px] text-[#F59E0B] font-semibold">Click to bring center</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Orbit Navigation Controls (Left / Right buttons) */}
            <div className="absolute inset-x-0 -bottom-8 flex items-center justify-between px-2 sm:px-6 pointer-events-none z-30">
              <button
                onClick={handlePrev}
                aria-label="Previous Dish in Orbit"
                className="w-11 h-11 rounded-full glass-panel hover:bg-white/15 border border-white/15 flex items-center justify-center text-white pointer-events-auto transition-all hover:scale-110 active:scale-95 shadow-lg group"
              >
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform text-[#F59E0B]" />
              </button>

              {/* Central Orbit Indicator & Gesture Tip */}
              <div className="flex flex-col items-center gap-1 pointer-events-auto">
                <div className="flex items-center gap-2 bg-[#141414]/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 shadow-lg">
                  <MoveHorizontal className="w-3.5 h-3.5 text-[#F59E0B] animate-pulse" />
                  <span className="text-[11px] font-semibold text-zinc-300">
                    Shift + Wheel or Horizontal Drag
                  </span>
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  {showcaseItems.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => snapTo(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === activeIndex ? 'w-6 bg-[#F59E0B]' : 'w-2 bg-white/20 hover:bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={handleNext}
                aria-label="Next Dish in Orbit"
                className="w-11 h-11 rounded-full glass-panel hover:bg-white/15 border border-white/15 flex items-center justify-center text-white pointer-events-auto transition-all hover:scale-110 active:scale-95 shadow-lg group"
              >
                <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform text-[#F59E0B]" />
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* Bottom Hint */}
      <div className="relative z-10 text-center pb-4 pt-4 text-xs text-[#A1A1AA]/60 flex items-center justify-center gap-2">
        <span>Vertical scroll moves page freely</span>
        <span>•</span>
        <span>Horizontal gestures orbit 3D dishes</span>
        <span>•</span>
        <span>Instant canteen token on pre-order</span>
      </div>
    </section>
  );
}
