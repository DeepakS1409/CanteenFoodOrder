import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { CheckCircle2, ShoppingBag, Plus, ArrowRight, X, Sparkles } from 'lucide-react';
import PlasticBag3D from './3d/PlasticBag3D';
import { useCart } from '../context/CartContext';

export default function PlasticPackingModal() {
  const { packingModalState, closePackingModal, setIsCartOpen } = useCart();
  const [phase, setPhase] = useState('open'); // 'open' | 'drop' | 'sealed'
  const [showConfirmation, setShowConfirmation] = useState(false);

  const flyingContainerRef = useRef(null);
  const modalContainerRef = useRef(null);

  const item = packingModalState?.item;
  const quantity = packingModalState?.quantity || 1;
  const startPos = packingModalState?.startPos || { 
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 200, 
    y: typeof window !== 'undefined' ? window.innerHeight - 150 : 400 
  };

  useEffect(() => {
    if (!packingModalState?.isOpen || !item) {
      setPhase('open');
      setShowConfirmation(false);
      return;
    }

    setPhase('open');
    setShowConfirmation(false);

    // Target coordinates: the mouth of the 3D plastic bag in center screen
    const bagTargetX = window.innerWidth / 2;
    const bagTargetY = window.innerHeight * 0.42;

    // Timeline using GSAP
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Fade-in modal backdrop
      tl.fromTo(
        modalContainerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.35, ease: 'power2.out' }
      );

      // Multiple food drops based on quantity (up to 3 items animated)
      const animatedCount = Math.min(quantity, 3);
      const foodElements = flyingContainerRef.current?.querySelectorAll('.flying-food-item');

      if (foodElements && foodElements.length > 0) {
        foodElements.forEach((el, idx) => {
          const delayOffset = idx * 0.18;

          // Initial position at button click coordinates
          gsap.set(el, {
            x: startPos.x,
            y: startPos.y,
            scale: 0.6,
            opacity: 1,
            rotation: (idx % 2 === 0 ? -15 : 15),
            transformOrigin: 'center center'
          });

          // 1. Arc curve towards bag mouth
          tl.to(
            el,
            {
              x: bagTargetX + (idx - 1) * 20,
              y: bagTargetY - 40,
              scale: 1.15,
              rotation: 10 * (idx % 2 === 0 ? 1 : -1),
              duration: 0.65,
              ease: 'power2.out',
            },
            0.25 + delayOffset
          );

          // 2. Drop into bag opening & shrink/disappear inside
          tl.to(
            el,
            {
              y: bagTargetY + 50,
              scale: 0.45,
              opacity: 0,
              rotation: 0,
              duration: 0.4,
              ease: 'power2.in',
              onComplete: () => {
                if (idx === animatedCount - 1) {
                  // Trigger bag drop impact deformation
                  setPhase('drop');
                }
              }
            },
            0.85 + delayOffset
          );
        });
      }

      // 3. Handles move together & bag settles as sealed
      tl.call(() => {
        setPhase('sealed');
      }, null, 1.4 + (animatedCount - 1) * 0.15);

      // 4. Reveal confirmation text & action buttons
      tl.call(() => {
        setShowConfirmation(true);
      }, null, 1.7 + (animatedCount - 1) * 0.15);
    });

    return () => ctx.revert();
  }, [packingModalState?.isOpen, item]);

  if (!packingModalState?.isOpen || !item) return null;

  const handleAddMore = () => {
    closePackingModal();
  };

  const handleViewCart = () => {
    closePackingModal();
    setIsCartOpen(true);
  };

  const animatedItems = Array.from({ length: Math.min(quantity, 3) });

  return (
    <div 
      ref={modalContainerRef}
      className="fixed inset-0 z-[10000] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[160px] pointer-events-none opacity-25"
        style={{ backgroundColor: item.themeColor || '#F59E0B' }}
      />
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

      {/* Top Close Button */}
      <button
        onClick={closePackingModal}
        className="absolute top-5 right-5 sm:top-7 sm:right-7 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-zinc-300 hover:text-white transition-all z-30"
        title="Close & continue"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="relative max-w-lg w-full flex flex-col items-center text-center z-20">
        
        {/* Animated Flying Food Clones Container (Positioned absolutely over screen) */}
        <div ref={flyingContainerRef} className="fixed inset-0 pointer-events-none z-40">
          {animatedItems.map((_, i) => (
            <div
              key={i}
              className="flying-food-item absolute -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-2xl overflow-hidden shadow-2xl border-2 border-[#F59E0B] bg-[#141414] opacity-0"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
              {quantity > 1 && (
                <div className="absolute top-1 right-1 px-2 py-0.5 rounded-md bg-[#F59E0B] text-black font-black text-xs shadow-md">
                  +{quantity}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 3D Realistic Translucent Plastic Bag Stage */}
        <div className="relative w-full max-w-[420px] aspect-[4/4.2] flex items-center justify-center">
          <PlasticBag3D
            phase={phase}
            foodImage={item.image}
            quantity={quantity}
          />

          {/* Floating Live Plastic Tag */}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full glass-panel border border-white/10 text-[11px] font-bold text-zinc-300 flex items-center gap-1.5 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
            <span>CampusBite Translucent Carry Bag</span>
          </div>
        </div>

        {/* Packing Confirmation Details (Revealed after sealing) */}
        <div className={`mt-2 space-y-4 w-full transition-all duration-500 transform ${
          showConfirmation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/40 text-xs font-black uppercase tracking-wider mb-2">
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span>Packed Successfully!</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white">
              {item.name}
            </h3>
            
            <p className="text-xs sm:text-sm text-[#F59E0B] font-bold mt-0.5">
              {quantity} {quantity === 1 ? 'Portion' : 'Portions'} Added • ₹{item.price * quantity}
            </p>

            {/* Note clarifying it's a visual cart interaction */}
            <p className="text-[11px] text-zinc-500 mt-1 max-w-xs mx-auto">
              Visual Cart Packing • Hot meal prepared by canteen kitchen after checkout
            </p>
          </div>

          {/* Action Buttons: Add More Food & View My Cart */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleAddMore}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl glass-panel hover:bg-white/10 text-white font-bold text-xs border border-white/10 flex items-center justify-center gap-2 transition-all hover:scale-102"
            >
              <Plus className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Add More Food</span>
            </button>

            <button
              onClick={handleViewCart}
              className="w-full sm:w-auto px-7 py-2.5 rounded-xl bg-gradient-to-r from-[#F59E0B] to-[#FF6B35] text-black font-extrabold text-xs flex items-center justify-center gap-2 hover:opacity-95 shadow-glow-primary transition-all hover:scale-102"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>View My Cart</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

