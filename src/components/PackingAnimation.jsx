import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, CheckCircle, Sparkles, ArrowRight, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function PackingAnimation() {
  const { isPackingAnimationActive, finishPackingAnimation, cartItems } = useCart();
  const [phase, setPhase] = useState('entering'); // 'entering' -> 'packing' -> 'sealed' -> 'done'

  useEffect(() => {
    if (!isPackingAnimationActive) {
      setPhase('entering');
      return;
    }

    // Sequence of animations:
    // 0s: Bag opens & backdrop dims
    // 0.4s - 1.5s: Food items drop into bag
    // 1.8s: Bag zips / seals
    // 2.4s: Done -> navigate to checkout
    const timer1 = setTimeout(() => setPhase('packing'), 400);
    const timer2 = setTimeout(() => setPhase('sealed'), 1800);
    const timer3 = setTimeout(() => {
      finishPackingAnimation();
    }, 2800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isPackingAnimationActive]);

  if (!isPackingAnimationActive) return null;

  return (
    <div className="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 select-none">
      {/* Background Ambience */}
      <div className="absolute inset-0 radial-glow-center opacity-40 pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

      {/* Skip button for maximum usability */}
      <button
        onClick={finishPackingAnimation}
        className="absolute top-6 right-6 text-xs text-zinc-400 hover:text-white glass-pill px-4 py-2 rounded-full flex items-center gap-1.5 transition-all z-20"
      >
        <span>Skip to Checkout</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>

      <div className="relative max-w-lg w-full flex flex-col items-center text-center">
        {/* Phase Header */}
        <motion.div
          key={phase}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F59E0B]/20 border border-[#F59E0B]/30 text-xs font-bold text-[#F59E0B] uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
            <span>CampusBite Kitchen Flow</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            {phase === 'sealed' ? 'Order Packed & Sealed!' : 'Packing Your Campus Order...'}
          </h2>
          <p className="text-xs sm:text-sm text-[#A1A1AA] mt-1">
            {phase === 'sealed' 
              ? 'Ready for pickup prep slot assignment' 
              : 'Gathering fresh items into your eco-friendly canteen bag'}
          </p>
        </motion.div>

        {/* Central Takeaway Bag Stage */}
        <div className="relative w-64 h-72 sm:w-72 sm:h-80 flex items-center justify-center my-4">
          
          {/* Animated Falling Food Items */}
          <div className="absolute -top-12 inset-x-0 flex justify-center items-center pointer-events-none z-30">
            {cartItems.slice(0, 3).map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ 
                  y: -120 - (index * 40), 
                  scale: 0.9, 
                  opacity: 0,
                  rotate: (index % 2 === 0 ? -12 : 12)
                }}
                animate={phase === 'packing' || phase === 'sealed' ? {
                  y: 40,
                  scale: [0.9, 1, 0.4],
                  opacity: [0, 1, 0],
                  rotate: [0, -10, 0]
                } : {}}
                transition={{
                  duration: 0.8,
                  delay: index * 0.25,
                  ease: "easeInOut"
                }}
                className="absolute w-16 h-16 rounded-2xl overflow-hidden shadow-2xl border-2 border-[#F59E0B]/80 bg-[#1B1B1B]"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            ))}
          </div>

          {/* Premium Canteen Takeaway Bag Graphic */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{ 
              scale: phase === 'sealed' ? [1, 1.05, 1] : 1, 
              opacity: 1, 
              y: 0 
            }}
            transition={{ duration: 0.6 }}
            className="relative w-52 h-64 sm:w-60 sm:h-72 bg-gradient-to-b from-[#2A2318] to-[#1A1610] rounded-2xl border-2 border-[#F59E0B]/30 shadow-glow-primary p-4 flex flex-col justify-between overflow-hidden"
          >
            {/* Bag Handles */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-24 h-12 rounded-t-full border-4 border-[#F59E0B]/60 border-b-0" />

            {/* Bag Texture & Fold */}
            <div className="flex items-center justify-between border-b border-[#F59E0B]/20 pb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#F59E0B]">CampusBite</span>
              <span className="text-[10px] font-bold text-zinc-400">{cartItems.length} ITEMS</span>
            </div>

            {/* Center Brand Crest */}
            <div className="flex flex-col items-center justify-center my-auto">
              <div className="w-16 h-16 rounded-2xl bg-black/50 border border-[#F59E0B]/40 flex items-center justify-center text-[#F59E0B] shadow-inner mb-2">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <p className="text-xs font-bold text-white tracking-wide">CANTEEN EXPRESS</p>
              <p className="text-[10px] text-zinc-400">Fresh • Zero Delay</p>
            </div>

            {/* Bag Seal / Stamp Badge */}
            {phase === 'sealed' && (
              <motion.div
                initial={{ scale: 2, opacity: 0, rotate: -20 }}
                animate={{ scale: 1, opacity: 1, rotate: -5 }}
                transition={{ type: "spring", damping: 12, stiffness: 200 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center"
              >
                <div className="px-4 py-2 rounded-xl bg-[#22C55E] text-black font-black text-xs uppercase tracking-wider shadow-2xl flex items-center gap-1.5 border-2 border-white">
                  <CheckCircle className="w-4 h-4 stroke-[3]" />
                  <span>QC Verified & Packed</span>
                </div>
              </motion.div>
            )}

            {/* Bottom details */}
            <div className="text-[10px] text-zinc-500 text-center border-t border-white/5 pt-1">
              Biodegradable Canteen Packaging
            </div>
          </motion.div>
        </div>

        {/* Selected Items summary pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-sm mt-2">
          {cartItems.map(item => (
            <span key={item.id} className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300">
              {item.quantity}x {item.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

