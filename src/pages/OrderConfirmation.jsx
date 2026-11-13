import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, QrCode, Clock, ArrowRight, Share2, Printer, MapPin, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useOrders } from '../context/OrderContext';

export default function OrderConfirmation({ orderId, onGoToOrders, onGoHome }) {
  const { orders } = useOrders();
  const order = orders.find(o => o.id === orderId) || orders[0];

  useEffect(() => {
    // Fire festive celebration confetti!
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#FF6B35', '#22C55E', '#FFFFFF']
      });
    } catch (e) {
      // fallback safe
    }
  }, []);

  if (!order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center text-white">
        <h2 className="text-xl font-bold">No Order Selected</h2>
        <button onClick={onGoHome} className="mt-4 px-4 py-2 rounded-xl bg-[#F59E0B] text-black font-bold">
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#090909] text-white min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        
        {/* Animated Celebration Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="glass-card p-6 sm:p-10 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden"
        >
          {/* Top Radial Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-[#22C55E]/15 blur-[100px] pointer-events-none" />

          {/* Success Check Icon */}
          <div className="text-center space-y-3 relative z-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 10, stiffness: 200, delay: 0.1 }}
              className="w-20 h-20 rounded-full bg-[#22C55E]/20 border-2 border-[#22C55E] flex items-center justify-center mx-auto text-[#22C55E] shadow-[0_0_30px_rgba(34,197,94,0.4)]"
            >
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </motion.div>

            <span className="text-xs font-bold text-[#22C55E] uppercase tracking-wider block">
              Payment & Pre-Order Confirmed
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Order Dispatched to Canteen!
            </h1>
            <p className="text-sm text-[#A1A1AA] max-w-md mx-auto">
              Your meal ticket is in the kitchen queue. Present your token or scan QR at the pickup counter.
            </p>
          </div>

          {/* Big Token & QR Code Section */}
          <div className="my-8 p-6 rounded-2xl bg-[#141414] border border-white/10 relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            
            {/* Left: Pickup Token */}
            <div className="text-center sm:text-left sm:border-r sm:border-white/10 sm:pr-6">
              <span className="text-xs uppercase font-extrabold text-zinc-400 tracking-wider block">
                Pickup Token Number
              </span>
              <div className="text-5xl sm:text-6xl font-black text-[#F59E0B] tracking-tight my-1 drop-shadow-md">
                {order.token}
              </div>
              <div className="text-xs text-zinc-400">
                Order ID: <strong className="text-white font-mono">{order.id}</strong>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-[#22C55E] bg-[#22C55E]/10 px-3 py-1 rounded-full w-fit mx-auto sm:mx-0 border border-[#22C55E]/20">
                <Clock className="w-3.5 h-3.5" />
                <span>Slot: {order.pickupSlot}</span>
              </div>
            </div>

            {/* Right: Realistic SVG Digital QR Code */}
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-36 h-36 p-3 bg-white rounded-2xl shadow-xl flex items-center justify-center">
                {/* SVG QR Code Pattern */}
                <svg viewBox="0 0 100 100" className="w-full h-full text-black">
                  <path fill="currentColor" d="M0,0 h30 v30 h-30 z M6,6 h18 v18 h-18 z M10,10 h10 v10 h-10 z" />
                  <path fill="currentColor" d="M70,0 h30 v30 h-30 z M76,6 h18 v18 h-18 z M80,10 h10 v10 h-10 z" />
                  <path fill="currentColor" d="M0,70 h30 v30 h-30 z M6,76 h18 v18 h-18 z M10,80 h10 v10 h-10 z" />
                  <rect x="36" y="8" width="6" height="6" fill="currentColor" />
                  <rect x="48" y="16" width="10" height="6" fill="currentColor" />
                  <rect x="42" y="32" width="16" height="16" rx="4" fill="#F59E0B" />
                  <rect x="12" y="38" width="8" height="8" fill="currentColor" />
                  <rect x="24" y="44" width="6" height="12" fill="currentColor" />
                  <rect x="66" y="38" width="8" height="14" fill="currentColor" />
                  <rect x="78" y="48" width="16" height="6" fill="currentColor" />
                  <rect x="36" y="66" width="10" height="10" fill="currentColor" />
                  <rect x="52" y="60" width="8" height="18" fill="currentColor" />
                  <rect x="68" y="76" width="14" height="14" fill="currentColor" />
                  <rect x="86" y="70" width="8" height="8" fill="currentColor" />
                  <rect x="42" y="84" width="14" height="8" fill="currentColor" />
                </svg>
              </div>
              <span className="text-[11px] text-zinc-400 mt-2 font-mono">Scan at Canteen Counter</span>
            </div>

          </div>

          {/* Order Details Summary */}
          <div className="space-y-3 relative z-10 border-t border-white/10 pt-4 text-xs">
            <h4 className="font-bold text-white text-sm">Packed Items</h4>
            <div className="space-y-2">
              {order.items.map((it, idx) => (
                <div key={idx} className="flex items-center justify-between py-1 text-zinc-300">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center text-[10px] font-bold text-white">
                      {it.quantity}x
                    </span>
                    <span className="font-medium text-white">{it.name}</span>
                  </div>
                  <span>₹{it.price * it.quantity}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-white/5 flex justify-between text-sm font-black text-white">
              <span>Total Paid</span>
              <span className="text-[#F59E0B]">₹{order.totalAmount}</span>
            </div>

            {/* Counter location */}
            <div className="flex items-center gap-2 text-zinc-400 text-xs bg-white/5 p-3 rounded-xl mt-3">
              <MapPin className="w-4 h-4 text-[#F59E0B] shrink-0" />
              <span>Collect at: <strong>SAC Central Canteen Counter 2 (Online Pre-orders)</strong></span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 relative z-10">
            <button
              onClick={onGoToOrders}
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-[#F59E0B] to-[#FF6B35] text-black font-extrabold text-sm flex items-center justify-center gap-2 hover:opacity-95 shadow-glow-primary transition-all"
            >
              <span>View Order Status Timeline</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onGoHome}
              className="h-12 px-6 rounded-xl glass-panel hover:bg-white/10 text-white font-bold text-xs border border-white/10 transition-all"
            >
              Back to Home
            </button>
          </div>

        </motion.div>

      </div>
    </div>
  );
}

