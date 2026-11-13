import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Sparkles, 
  QrCode, 
  Clock, 
  ShieldCheck, 
  Flame, 
  TrendingUp, 
  ShoppingBag, 
  CheckCircle2, 
  BellRing,
  Award
} from 'lucide-react';
import FoodShowcase from '../components/FoodShowcase';
import FoodCategories from '../components/FoodCategories';
import { useOrders } from '../context/OrderContext';
import { useCart } from '../context/CartContext';

export default function Home({ onRouteChange }) {
  const { menuItems } = useOrders();
  const { addToCart } = useCart();

  const heroFeaturedItem = menuItems[0]; // The Quad Smash Burger

  return (
    <div className="w-full bg-[#090909] text-white">
      {/* 1. Announcements & Today's Canteen Specials Ticker */}
      <div className="bg-gradient-to-r from-[#F59E0B]/15 via-[#FF6B35]/20 to-[#F59E0B]/15 border-b border-[#F59E0B]/20 py-2.5 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 overflow-hidden text-xs">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F59E0B] text-black font-extrabold uppercase text-[10px] tracking-wider shrink-0 shadow-sm">
              <BellRing className="w-3 h-3" />
              <span>Today's Specials</span>
            </span>
            <div className="text-zinc-200 truncate flex items-center gap-4">
              <span>🔥 Chef's Smash Burger with Smoked Cheddar (Fresh Batch Ready)</span>
              <span className="text-[#F59E0B]">•</span>
              <span>⚡ Pre-order now to skip the 12:45 PM Break Rush!</span>
              <span className="text-[#F59E0B]">•</span>
              <span>🎉 10% Student Discount automatically applied on orders above ₹300!</span>
            </div>
          </div>

          <button 
            onClick={() => onRouteChange('menu')}
            className="hidden sm:flex items-center gap-1 text-xs text-[#F59E0B] font-bold hover:underline shrink-0"
          >
            <span>View All Specials</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden py-12 lg:py-20">
        {/* Ambient Backdrops */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#F59E0B]/12 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] rounded-full bg-[#FF6B35]/10 blur-[130px] pointer-events-none" />
        <div className="absolute inset-0 bg-grid-pattern opacity-15 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Pill Badge */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-[#F59E0B]/30 text-xs font-bold text-[#F59E0B] tracking-wide shadow-glow-primary"
              >
                <Sparkles className="w-4 h-4 text-[#F59E0B] animate-spin-slow" />
                <span>Next-Gen College Dining • Skip 30-Min Canteen Queues</span>
              </motion.div>

              {/* Big Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] text-white"
              >
                Your Cravings. <br />
                <span className="text-gradient-fire">Your Campus.</span> <br />
                Your Time.
              </motion.h1>

              {/* Supporting Text */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-base sm:text-lg text-[#A1A1AA] max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal"
              >
                Browse the live college canteen kitchen in immersive 3D, pre-order between lectures, pay instantly, and pick up your hot meal with your digital token or QR code.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2"
              >
                <button
                  onClick={() => {
                    const el = document.getElementById('food-showcase-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                    else onRouteChange('menu');
                  }}
                  className="w-full sm:w-auto h-13 px-8 rounded-2xl bg-gradient-to-r from-[#F59E0B] to-[#FF6B35] text-black font-extrabold text-base flex items-center justify-center gap-3 hover:opacity-95 shadow-glow-primary transition-all hover:scale-102 active:scale-98"
                >
                  <span>Explore 3D Menu</span>
                  <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                </button>

                <button
                  onClick={() => onRouteChange('my-orders')}
                  className="w-full sm:w-auto h-13 px-7 rounded-2xl glass-panel hover:bg-white/10 text-white font-bold text-sm flex items-center justify-center gap-2.5 border border-white/10 transition-all hover:border-white/20"
                >
                  <Clock className="w-4 h-4 text-[#F59E0B]" />
                  <span>Track Live Order</span>
                </button>
              </motion.div>

              {/* Social Proof / Stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="pt-6 border-t border-white/10 grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0"
              >
                <div>
                  <div className="text-2xl font-black text-white">4.9★</div>
                  <div className="text-xs text-[#A1A1AA]">Student Rating</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-[#F59E0B]">~6 min</div>
                  <div className="text-xs text-[#A1A1AA]">Average Prep</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-[#22C55E]">0 Queues</div>
                  <div className="text-xs text-[#A1A1AA]">Instant Token</div>
                </div>
              </motion.div>
            </div>

            {/* Right 3D Visual Showcase Hero Item */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full max-w-md aspect-square flex items-center justify-center"
              >
                {/* Glowing Ambient Rings */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#F59E0B]/20 to-[#FF6B35]/20 blur-2xl animate-pulse-glow" />
                <div className="absolute w-[80%] h-[80%] rounded-full border border-[#F59E0B]/20 animate-spin-slow pointer-events-none" />

                {/* Hero Burger Image with Floating Parallax */}
                <motion.div
                  animate={{ 
                    y: [-12, 12, -12],
                    rotate: [-1, 2, -1]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 6, 
                    ease: "easeInOut" 
                  }}
                  className="relative z-10 w-full h-full flex items-center justify-center"
                >
                  <img
                    src={heroFeaturedItem.image}
                    alt="Featured Campus Burger"
                    className="w-[90%] h-[90%] object-cover rounded-3xl shadow-2xl border-2 border-white/15 drop-shadow-[0_25px_35px_rgba(0,0,0,0.9)]"
                  />

                  {/* Floating Highlight Badge 1 */}
                  <motion.div
                    animate={{ y: [6, -6, 6] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="absolute -top-4 -left-4 glass-panel px-4 py-3 rounded-2xl border border-white/10 shadow-glow-primary flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/20 flex items-center justify-center text-[#F59E0B]">
                      <Flame className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#A1A1AA] block">Campus Favorite</span>
                      <span className="text-sm font-extrabold text-white block">Quad Smash Patty</span>
                    </div>
                  </motion.div>

                  {/* Floating Highlight Badge 2: Quick Add */}
                  <motion.div
                    animate={{ y: [-6, 6, -6] }}
                    transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
                    className="absolute -bottom-4 -right-4 glass-panel p-3 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-3"
                  >
                    <div>
                      <div className="text-[10px] text-zinc-400 font-bold uppercase">Pre-order Price</div>
                      <div className="text-base font-black text-white">₹{heroFeaturedItem.price}</div>
                    </div>
                    <button
                      onClick={(e) => addToCart(heroFeaturedItem, 1, e)}
                      className="px-3 py-1.5 rounded-xl bg-[#F59E0B] text-black font-black text-xs hover:bg-[#FF6B35] transition-all flex items-center gap-1 shadow-sm"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </motion.div>
                </motion.div>

              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Immersive 3D Food Showcase Section (Anchor link target) */}
      <div id="food-showcase-section">
        <FoodShowcase items={menuItems} />
      </div>

      {/* 4. How CampusBite Works in 3 Quick Steps */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-[#F59E0B] uppercase tracking-wider px-3 py-1 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/20">
            Smart Dining Experience
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mt-3">
            How Pre-Ordering Works
          </h2>
          <p className="text-sm text-[#A1A1AA] mt-2">
            No more waiting in 50-person lines during lunch break. Get hot meals on your exact schedule.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="glass-card p-6 rounded-2xl border border-white/5 relative group hover:border-[#F59E0B]/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B] font-black text-lg mb-4 group-hover:scale-110 transition-transform">
              01
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Explore & Pre-Order</h3>
            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              Browse 3D visuals of today's menu, check live kitchen availability, customize quantity, and choose your pickup break slot.
            </p>
          </div>

          {/* Step 2 */}
          <div className="glass-card p-6 rounded-2xl border border-white/5 relative group hover:border-[#F59E0B]/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#FF6B35]/10 border border-[#FF6B35]/30 flex items-center justify-center text-[#FF6B35] font-black text-lg mb-4 group-hover:scale-110 transition-transform">
              02
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Get Instant Token & QR</h3>
            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              Confirm your demo payment via UPI or Campus ID Card. A unique pickup token and dynamic QR code are generated automatically.
            </p>
          </div>

          {/* Step 3 */}
          <div className="glass-card p-6 rounded-2xl border border-white/5 relative group hover:border-[#F59E0B]/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/30 flex items-center justify-center text-[#22C55E] font-black text-lg mb-4 group-hover:scale-110 transition-transform">
              03
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Grab & Go at Counter</h3>
            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              Receive a live notification when canteen staff marks your order "Ready for Pickup". Flash your QR code and collect hot food in seconds!
            </p>
          </div>
        </div>
      </section>

      {/* 5. Food Categories Section */}
      <FoodCategories items={menuItems} />
    </div>
  );
}

