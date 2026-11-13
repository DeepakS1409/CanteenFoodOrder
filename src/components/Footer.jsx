import React from 'react';
import { Flame, Clock, MapPin, Heart, Shield, Sparkles } from 'lucide-react';

export default function Footer({ onRouteChange }) {
  return (
    <footer className="bg-[#090909] border-t border-white/10 text-white mt-16 pt-16 pb-12 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF6B35] to-[#F59E0B] p-0.5 shadow-glow-primary">
                <div className="w-full h-full bg-[#090909] rounded-[10px] flex items-center justify-center">
                  <Flame className="w-5 h-5 text-[#F59E0B]" />
                </div>
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Campus<span className="text-[#F59E0B]">Bite</span>
              </span>
            </div>
            
            <p className="text-sm text-[#A1A1AA] max-w-sm leading-relaxed">
              The premier 3D college canteen pre-ordering ecosystem. Eliminating break-time queues, saving student hours, and streamlining kitchen batch cooking.
            </p>

            <div className="flex items-center gap-2 text-xs text-[#F59E0B] bg-[#F59E0B]/10 px-3.5 py-1.5 rounded-full w-fit border border-[#F59E0B]/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Campus Digital Dining Initiative 2026</span>
            </div>
          </div>

          {/* Timings Col */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#F59E0B]" />
              <span>Canteen Hours</span>
            </h4>
            <ul className="space-y-2 text-xs text-[#A1A1AA]">
              <li className="flex justify-between border-b border-white/5 pb-1">
                <span>Breakfast:</span>
                <span className="text-white font-medium">7:30 AM – 10:30 AM</span>
              </li>
              <li className="flex justify-between border-b border-white/5 pb-1">
                <span>Lunch Break:</span>
                <span className="text-white font-medium">12:00 PM – 3:00 PM</span>
              </li>
              <li className="flex justify-between border-b border-white/5 pb-1">
                <span>Evening Snacks:</span>
                <span className="text-white font-medium">4:30 PM – 7:30 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Midnight Maggi:</span>
                <span className="text-[#F59E0B] font-bold">10:00 PM – 1:00 AM</span>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Quick Navigation</h4>
            <ul className="space-y-2 text-xs text-[#A1A1AA]">
              <li>
                <button onClick={() => onRouteChange('home')} className="hover:text-[#F59E0B] transition-colors">
                  Home Showcase
                </button>
              </li>
              <li>
                <button onClick={() => onRouteChange('menu')} className="hover:text-[#F59E0B] transition-colors">
                  Full Canteen Menu
                </button>
              </li>
              <li>
                <button onClick={() => onRouteChange('my-orders')} className="hover:text-[#F59E0B] transition-colors">
                  Live Order Tracker
                </button>
              </li>
              <li>
                <button onClick={() => onRouteChange('profile')} className="hover:text-[#F59E0B] transition-colors">
                  Student Meal Card
                </button>
              </li>
              <li>
                <button onClick={() => onRouteChange('admin-dashboard')} className="text-[#FF6B35] font-semibold hover:underline">
                  Staff Admin Desk
                </button>
              </li>
            </ul>
          </div>

          {/* Location & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#F59E0B]" />
              <span>Campus Pickup</span>
            </h4>
            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              Student Activity Center (SAC), Ground Floor Central Food Court Counters 1-4.
            </p>
            <div className="pt-2">
              <span className="text-[11px] text-zinc-500 block">Need assistance?</span>
              <span className="text-xs text-white font-semibold">canteen.help@campus.edu</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#A1A1AA]">
          <p>© {new Date().getFullYear()} CampusBite Platform. Crafted for College Campus Life.</p>
          <div className="flex items-center gap-4 text-zinc-500">
            <span>FSSAI Certified Canteen</span>
            <span>•</span>
            <span>Zero Queue Standard</span>
            <span>•</span>
            <span>Made with Clean React + Three.js</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

