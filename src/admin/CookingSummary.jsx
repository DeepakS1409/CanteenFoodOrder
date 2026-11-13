import React from 'react';
import { Flame, ShieldAlert, CheckCircle2, Users, Printer, Sparkles, Filter, RefreshCw, Layers } from 'lucide-react';
import { useOrders } from '../context/OrderContext';

export default function CookingSummary() {
  const { 
    calculateCookingSummary, 
    cookingSafetyBuffer, 
    setCookingSafetyBuffer, 
    orders 
  } = useOrders();

  const summary = calculateCookingSummary();

  const totalDishesToPrep = summary.reduce((sum, item) => sum + item.totalToPrepare, 0);
  const totalBaseOrdered = summary.reduce((sum, item) => sum + item.confirmedQuantity, 0);
  const totalBufferExtra = summary.reduce((sum, item) => sum + item.bufferQuantity, 0);

  const activeOrdersCount = orders.filter(o => ['Accepted', 'Cooking', 'Ready for Pickup'].includes(o.status)).length;

  return (
    <div className="space-y-8 select-none">
      
      {/* Header & Feature Explanation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6B35]/20 text-[#FF6B35] text-xs font-bold uppercase tracking-wider mb-2">
            <Flame className="w-3.5 h-3.5" />
            <span>Kitchen Display System (KDS) • Batch Aggregation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Kitchen Cooking Summary
          </h1>
          <p className="text-xs text-[#A1A1AA] mt-1 max-w-2xl leading-relaxed">
            Consolidates all confirmed college meal bookings by dish for high-efficiency batch cooking. Cancelled, failed, and unpaid orders are excluded automatically.
          </p>
        </div>

        {/* Safety Buffer Configurator */}
        <div className="glass-card p-4 rounded-2xl border border-white/10 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-300 font-bold flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Safety Buffer:</span>
            </span>
            <span className="text-[#F59E0B] font-black text-sm">+{cookingSafetyBuffer}%</span>
          </div>

          <div className="flex items-center gap-1.5">
            {[0, 5, 10, 15, 20].map(pct => (
              <button
                key={pct}
                onClick={() => setCookingSafetyBuffer(pct)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  cookingSafetyBuffer === pct
                    ? 'bg-[#F59E0B] text-black shadow-glow-primary'
                    : 'bg-[#141414] text-zinc-400 hover:text-white border border-white/5'
                }`}
              >
                +{pct}%
              </button>
            ))}
          </div>
          <span className="text-[10px] text-zinc-500">Accounts for spillages & walk-in buffer</span>
        </div>
      </div>

      {/* Batch Preparation Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-1">
          <span className="text-xs font-semibold text-zinc-400">Total Confirmed Pre-Orders</span>
          <div className="text-3xl font-black text-white">{totalBaseOrdered} <span className="text-xs font-normal text-zinc-500">portions</span></div>
          <span className="text-[10px] text-[#22C55E]">Across {activeOrdersCount} verified student orders</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-1">
          <span className="text-xs font-semibold text-zinc-400">Configured Safety Buffer ({cookingSafetyBuffer}%)</span>
          <div className="text-3xl font-black text-[#F59E0B]">+{totalBufferExtra} <span className="text-xs font-normal text-zinc-500">safety buffer</span></div>
          <span className="text-[10px] text-zinc-400">Avoids mid-service shortage</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-[#FF6B35]/40 bg-[#FF6B35]/10 shadow-glow-secondary space-y-1">
          <span className="text-xs font-bold text-[#FF6B35] uppercase tracking-wider">Total Required for Preparation</span>
          <div className="text-3xl font-black text-white">{totalDishesToPrep} <span className="text-xs font-normal text-zinc-400">portions to cook</span></div>
          <span className="text-[10px] text-white/80">Batch kitchen target for current slot</span>
        </div>
      </div>

      {/* Grouped Dishes Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#F59E0B]" />
            <span>Dish-wise Kitchen Quantities</span>
          </h2>
          <span className="text-xs text-zinc-400">
            {summary.length} unique items currently queued
          </span>
        </div>

        {summary.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {summary.map((entry) => (
              <div
                key={entry.name}
                className="glass-card p-5 rounded-2xl border border-white/10 hover:border-[#F59E0B]/40 transition-all space-y-4 flex flex-col justify-between"
              >
                <div>
                  {/* Dish Title & Image */}
                  <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                    <img
                      src={entry.image}
                      alt={entry.name}
                      className="w-14 h-14 rounded-xl object-cover shrink-0 border border-white/10"
                    />
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-white leading-tight truncate">
                        {entry.name}
                      </h3>
                      <span className="text-xs text-[#F59E0B] font-semibold block mt-0.5">
                        {entry.ordersBreakdown.length} student orders
                      </span>
                    </div>
                  </div>

                  {/* Quantity Breakdown Box */}
                  <div className="grid grid-cols-3 gap-2 my-3 text-center bg-[#141414] p-3 rounded-xl border border-white/5">
                    <div>
                      <span className="text-[10px] text-zinc-400 block uppercase">Ordered</span>
                      <span className="text-lg font-bold text-white">{entry.confirmedQuantity}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 block uppercase">Buffer</span>
                      <span className="text-lg font-bold text-[#F59E0B]">+{entry.bufferQuantity}</span>
                    </div>
                    <div className="border-l border-white/10 pl-1">
                      <span className="text-[10px] text-[#22C55E] block uppercase font-bold">Total Prep</span>
                      <span className="text-xl font-black text-[#22C55E]">{entry.totalToPrepare}</span>
                    </div>
                  </div>

                  {/* Active Tokens Breakdown */}
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-1.5">
                      Waiting Tokens:
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                      {entry.ordersBreakdown.map((bk, i) => (
                        <span
                          key={i}
                          className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-zinc-300"
                          title={`${bk.studentName} (${bk.status})`}
                        >
                          {bk.token} <span className="text-[#F59E0B]">({bk.quantity}x)</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Status indicator bar */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
                    In Kitchen Queue
                  </span>
                  <span className="text-white font-bold">{entry.totalToPrepare} Total</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel p-12 rounded-2xl text-center max-w-md mx-auto border border-white/10">
            <CheckCircle2 className="w-12 h-12 text-[#22C55E] mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">All Kitchen Queues Clear</h3>
            <p className="text-xs text-[#A1A1AA] mt-1">
              There are currently no active cooking orders. New student pre-orders will aggregate here in real-time.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}

