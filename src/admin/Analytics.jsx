import React from 'react';
import { BarChart3, TrendingUp, Users, DollarSign, Award, Clock, ArrowUpRight } from 'lucide-react';
import { useOrders } from '../context/OrderContext';

export default function Analytics() {
  const { orders } = useOrders();

  const totalRevenue = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const topItems = [
    { name: "The Quad Smash Burger", orders: 42, revenue: 7560, pct: 92 },
    { name: "Schezwan Fire Fried Rice", orders: 36, revenue: 5040, pct: 78 },
    { name: "Ghee Roast Masala Dosa", orders: 31, revenue: 2790, pct: 67 },
    { name: "Crispy Peri-Peri Chicken Sub", orders: 25, revenue: 4000, pct: 54 },
    { name: "Cold Brew Mango Mint Cooler", orders: 22, revenue: 2090, pct: 48 },
  ];

  return (
    <div className="space-y-8 select-none">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Canteen Sales & Dining Analytics
        </h1>
        <p className="text-xs text-[#A1A1AA] mt-1">
          Historical trends, peak hour throughput, student favorites, and kitchen performance.
        </p>
      </div>

      {/* Top 3 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-1">
          <span className="text-xs font-semibold text-zinc-400">Total Pre-Order GMV</span>
          <div className="text-3xl font-black text-[#F59E0B]">₹{totalRevenue}</div>
          <span className="text-[10px] text-[#22C55E] font-bold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +28% week-over-week
          </span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-1">
          <span className="text-xs font-semibold text-zinc-400">Average Kitchen Prep Time</span>
          <div className="text-3xl font-black text-white">6.4 <span className="text-xs font-normal text-zinc-400">mins</span></div>
          <span className="text-[10px] text-[#22C55E]">Target SLA &lt; 10 mins maintained</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-1">
          <span className="text-xs font-semibold text-zinc-400">Queue Time Saved for Students</span>
          <div className="text-3xl font-black text-[#22C55E]">~18 <span className="text-xs font-normal text-zinc-400">mins / student</span></div>
          <span className="text-[10px] text-zinc-400">Based on counter turnaround benchmarks</span>
        </div>
      </div>

      {/* Top Selling Food Items */}
      <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-base">Top Selling Canteen Dishes</h3>
            <p className="text-xs text-[#A1A1AA]">Ranked by total quantity pre-ordered this week</p>
          </div>
          <span className="text-xs font-bold text-[#F59E0B] bg-[#F59E0B]/10 px-2.5 py-1 rounded-lg">
            Bestsellers
          </span>
        </div>

        <div className="space-y-4">
          {topItems.map((item, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-white font-bold flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-white/10 text-[10px] flex items-center justify-center text-[#F59E0B] font-black">
                    #{idx + 1}
                  </span>
                  {item.name}
                </span>
                <span className="text-zinc-300">
                  <strong className="text-white">{item.orders} orders</strong> (₹{item.revenue})
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#141414] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#F59E0B] to-[#FF6B35]"
                  style={{ width: `${item.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

