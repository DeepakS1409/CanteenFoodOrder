import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';

export default function FlyToCartOverlay() {
  const { flyingItem } = useCart();

  if (!flyingItem) return null;

  // Approximate target position of the Cart icon in top-right navbar
  const targetX = typeof window !== 'undefined' ? window.innerWidth - 60 : 1000;
  const targetY = 32;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      <AnimatePresence>
        <motion.div
          key={flyingItem.id}
          initial={{
            left: flyingItem.startX,
            top: flyingItem.startY,
            scale: 1,
            opacity: 1,
            rotate: 0
          }}
          animate={{
            left: [flyingItem.startX, (flyingItem.startX + targetX) / 2 - 40, targetX],
            top: [flyingItem.startY, Math.min(flyingItem.startY, targetY) - 80, targetY],
            scale: [1, 1.2, 0.25],
            opacity: [1, 1, 0.4],
            rotate: [0, 45, 180]
          }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.8,
            ease: [0.25, 1, 0.5, 1]
          }}
          className="absolute -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full p-1 bg-gradient-to-r from-[#F59E0B] to-[#FF6B35] shadow-glow-primary border-2 border-white/50 z-50 flex items-center justify-center overflow-hidden"
        >
          <img
            src={flyingItem.image}
            alt="Flying food"
            className="w-full h-full object-cover rounded-full"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

