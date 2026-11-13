import React from 'react';
import { 
  ShoppingBag, 
  TrendingUp, 
  DollarSign, 
  Flame, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight,
  Sparkles,
  Users
} from 'lucide-react';
import { useOrders } from '../context/OrderContext';

export default function Dashboard({ onNavigateTab }) {
  const { orders } = useOrders();

  // Metrics
  const totalOrdersCount = orders.length;
  const confirmedBookings = orders.filter(o => ['Accepted', 'Cooking', 'Ready for Pickup', 'Collected'].includes(o.status)).length;
  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  const currentlyCooking = orders.filter(o => o.status === 'Cooking').length;
  const readyOrders = orders.filter(o => o.status === 'Ready for Pickup').length;

  const totalRevenue = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const totalItemsSold = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.items.reduce((s, it) => s + it.quantity, 0), 0);

  // Hourly rush mock chart data
  const rushHours = [
    { time: "8-10 AM (Breakfast)", volume: 65, color: "#F59E0B" },
    { time: "10-12 PM (Morning Break)", volume: 110, color: "#FF6B35" },
    { time: "12-2 PM (Lunch Rush)", volume: 240, color: "#EF4444" },
    { time: "2-4 PM (Afternoon Labs)", volume: 45, color: "#3B82F6" },
    { time: "4-6 PM (Evening Snacks)", volume: 135, color: "#F59E0B" },
    { time: "8-11 PM (Hostel Dinner)", volume: 90, color: "#8B5CF6" },
  ];

  const maxVolume = Math.max(...rushHours.map(r => r.volume));

  return (
    <div className="space-y-8">
      
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Canteen Operations Overview
          </h1>
          <p className="text-xs text-[#A1A1AA] mt-1">
            Real-time feed of campus meal orders, prep batches, and revenue.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigateTab('schedule')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#F59E0B] to-[#FF6B35] text-black font-extrabold text-xs shadow-glow-primary flex items-center gap-1.5 hover:opacity-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Weekly Menu Planner</span>
          </button>

          <button
            onClick={() => onNavigateTab('cooking')}
            className="px-4 py-2 rounded-xl bg-white/10 text-white font-extrabold text-xs flex items-center gap-2 hover:bg-white/15 border border-white/10"
          >
            <Flame className="w-4 h-4 text-[#FF6B35]" />
            <span>Cooking Summary (KDS)</span>
          </button>
        </div>
      </div>

      {/* 6 Key Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        
        {/* Metric 1: Total Orders */}
        <div className="glass-card p-4 rounded-2xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div className="text-2xl font-black text-white">{totalOrdersCount}</div>
          <span className="text-[10px] text-[#22C55E] font-bold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +14% vs yesterday
          </span>
        </div>

        {/* Metric 2: Confirmed Bookings */}
        <div className="glass-card p-4 rounded-2xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">Confirmed Pre-orders</span>
            <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
          </div>
          <div className="text-2xl font-black text-white">{confirmedBookings}</div>
          <span className="text-[10px] text-zinc-400">Ready or In-Flight</span>
        </div>

        {/* Metric 3: Total Revenue */}
        <div className="glass-card p-4 rounded-2xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">Today's Revenue</span>
            <span className="text-xs font-bold text-[#F59E0B]">INR</span>
          </div>
          <div className="text-2xl font-black text-[#F59E0B]">₹{totalRevenue}</div>
          <span className="text-[10px] text-[#22C55E] font-bold">100% Digital / QR</span>
        </div>

        {/* Metric 4: Food Items Sold */}
        <div className="glass-card p-4 rounded-2xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">Items Cooked</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">{totalItemsSold}</div>
          <span className="text-[10px] text-zinc-400">Portions dispatched</span>
        </div>

        {/* Metric 5: Pending Action */}
        <div className={`p-4 rounded-2xl border space-y-2 ${
          pendingOrders > 0 
            ? 'bg-red-950/20 border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.15)]' 
            : 'glass-card border-white/5'
        }`}>
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">Pending Orders</span>
            <AlertCircle className={`w-4 h-4 ${pendingOrders > 0 ? 'text-red-400 animate-pulse' : 'text-zinc-500'}`} />
          </div>
          <div className={`text-2xl font-black ${pendingOrders > 0 ? 'text-red-400' : 'text-white'}`}>
            {pendingOrders}
          </div>
          <button
            onClick={() => onNavigateTab('orders')}
            className="text-[10px] text-zinc-300 hover:text-white underline font-semibold"
          >
            Review Now →
          </button>
        </div>

        {/* Metric 6: Currently Cooking */}
        <div className={`p-4 rounded-2xl border space-y-2 ${
          currentlyCooking > 0 
            ? 'bg-[#FF6B35]/15 border-[#FF6B35]/40 shadow-glow-secondary' 
            : 'glass-card border-white/5'
        }`}>
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">Currently Cooking</span>
            <Flame className="w-4 h-4 text-[#FF6B35] animate-bounce" />
          </div>
          <div className="text-2xl font-black text-[#FF6B35]">
            {currentlyCooking}
          </div>
          <button
            onClick={() => onNavigateTab('cooking')}
            className="text-[10px] text-zinc-300 hover:text-white underline font-semibold"
          >
            View Batch Counts →
          </button>
        </div>

      </div>

      {/* Two Column Section: Peak Hours Chart & Recent Incoming Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left 7 cols: Peak Canteen Rush Graph */}
        <div className="lg:col-span-7 glass-card p-6 rounded-2xl border border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-base">Canteen Peak Demand Curve</h3>
              <p className="text-xs text-[#A1A1AA]">Order density by lecture breaks and dining hours</p>
            </div>
            <span className="text-xs text-[#F59E0B] font-bold bg-[#F59E0B]/10 px-2.5 py-1 rounded-lg">
              Live Hourly Feed
            </span>
          </div>

          {/* Bar Chart Visual */}
          <div className="space-y-3 pt-2">
            {rushHours.map((slot, i) => {
              const pct = Math.round((slot.volume / maxVolume) * 100);
              return (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-300 font-medium">{slot.time}</span>
                    <span className="text-white font-bold">{slot.volume} orders ({pct}%)</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-[#141414] overflow-hidden p-0.5 border border-white/5">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ 
                        width: `${pct}%`,
                        backgroundColor: slot.color 
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-[11px] text-zinc-500 pt-2 border-t border-white/5 flex items-center justify-between">
            <span>Peak break: 12:00 PM – 2:00 PM (Pre-orders recommended)</span>
            <span className="text-[#22C55E]">Batch cooking algorithm active</span>
          </div>
        </div>

        {/* Right 5 cols: Live Orders Stream */}
        <div className="lg:col-span-5 glass-card p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-base">Active Orders Stream</h3>
              <p className="text-xs text-[#A1A1AA]">Recent canteen counter queue</p>
            </div>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs text-[#F59E0B] font-bold hover:underline"
            >
              View All ({orders.length})
            </button>
          </div>

          <div className="space-y-3">
            {orders.slice(0, 4).map(o => (
              <div 
                key={o.id} 
                onClick={() => onNavigateTab('orders')}
                className="p-3 rounded-xl bg-[#141414] hover:bg-[#1B1B1B] border border-white/5 cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="text-lg font-black text-[#F59E0B] bg-[#090909] px-2.5 py-1 rounded-lg border border-white/10">
                    {o.token}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block group-hover:text-[#F59E0B] transition-colors">
                      {o.studentName} ({o.department})
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      {o.items.length} items • Slot: {o.pickupSlot}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full block ${
                    o.status === 'Ready for Pickup'
                      ? 'bg-green-500/20 text-green-400'
                      : o.status === 'Cooking'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-white/10 text-zinc-300'
                  }`}>
                    {o.status}
                  </span>
                  <span className="text-xs font-bold text-white mt-0.5 block">₹{o.totalAmount}</span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigateTab('cooking')}
            className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white transition-all text-center"
          >
            Check Batch Kitchen Preparation Summary →
          </button>
        </div>

      </div>

    </div>
  );
}

