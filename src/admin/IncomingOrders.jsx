import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  CheckCircle2, 
  Flame, 
  Check, 
  Clock, 
  User, 
  CreditCard, 
  AlertCircle,
  XCircle,
  Sparkles
} from 'lucide-react';
import { useOrders } from '../context/OrderContext';

export default function IncomingOrders() {
  const { orders, updateOrderStatus } = useOrders();
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const statuses = ['All', 'Pending', 'Accepted', 'Cooking', 'Ready for Pickup', 'Collected', 'Cancelled'];

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'All' || order.status === filterStatus;
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          order.token.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          order.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          order.studentId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Incoming Orders Management
          </h1>
          <p className="text-xs text-[#A1A1AA] mt-1">
            Accept new student tickets, start kitchen preparation, and notify counter pickup.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-zinc-300 font-semibold">
            {filteredOrders.length} Orders displayed
          </span>
        </div>
      </div>

      {/* Toolbar: Search & Filter Tabs */}
      <div className="glass-card p-4 rounded-2xl border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Token (e.g. T-42), Order ID, Student Name, Roll No..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#141414] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#F59E0B]"
            />
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-t border-white/5 pt-3">
          {statuses.map(status => {
            const count = status === 'All' ? orders.length : orders.filter(o => o.status === status).length;
            const isSelected = filterStatus === status;

            return (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#F59E0B] text-black shadow-glow-primary'
                    : 'bg-[#141414] text-zinc-400 hover:text-white border border-white/5'
                }`}
              >
                <span>{status}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isSelected ? 'bg-black/20 text-black font-extrabold' : 'bg-white/10 text-zinc-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Table / Cards View */}
      {filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map(order => {
            return (
              <div
                key={order.id}
                className="glass-card p-5 rounded-2xl border border-white/10 hover:border-white/20 transition-all space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-black text-[#F59E0B] bg-[#090909] px-3 py-1 rounded-xl border border-white/10">
                      {order.token}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{order.studentName}</span>
                        <span className="text-[11px] text-zinc-400 font-mono">({order.studentId})</span>
                      </div>
                      <span className="text-[11px] text-zinc-500">
                        {order.department} • {order.year} • Slot: <strong className="text-zinc-300">{order.pickupSlot}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Status Badge */}
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      order.status === 'Ready for Pickup'
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : order.status === 'Cooking'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : order.status === 'Cancelled'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-white/10 text-white'
                    }`}>
                      {order.status}
                    </span>

                    {/* Total Amount & Payment */}
                    <div className="text-right">
                      <span className="text-base font-black text-white block">₹{order.totalAmount}</span>
                      <span className="text-[10px] text-[#22C55E] block font-medium">{order.paymentStatus}</span>
                    </div>
                  </div>
                </div>

                {/* Items in order */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 p-2 rounded-xl bg-[#141414] border border-white/5">
                      <img src={it.image} alt={it.name} className="w-10 h-10 rounded-lg object-cover" />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-white block truncate">{it.name}</span>
                        <span className="text-[11px] text-[#F59E0B]">Qty: <strong>{it.quantity}</strong> (₹{it.price} each)</span>
                      </div>
                    </div>
                  ))}
                </div>

                {order.notes && (
                  <div className="text-xs bg-amber-500/10 border border-amber-500/20 text-amber-300 p-2.5 rounded-xl">
                    <strong>Special Chef Note:</strong> "{order.notes}"
                  </div>
                )}

                {/* Action Controls for Staff */}
                <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <span className="text-[11px] text-zinc-500">
                    Order ID: <code className="text-zinc-400">{order.id}</code> • Booked at {new Date(order.createdAt).toLocaleTimeString()}
                  </span>

                  <div className="flex flex-wrap items-center gap-2">
                    {order.status === 'Pending' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'Accepted')}
                        className="px-4 py-2 rounded-xl bg-[#F59E0B] text-black font-extrabold hover:bg-[#FF6B35] transition-all flex items-center gap-1.5 shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Accept Order</span>
                      </button>
                    )}

                    {(order.status === 'Pending' || order.status === 'Accepted') && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'Cooking')}
                        className="px-4 py-2 rounded-xl bg-[#FF6B35] text-white font-extrabold hover:opacity-90 transition-all flex items-center gap-1.5 shadow-glow-secondary"
                      >
                        <Flame className="w-3.5 h-3.5" />
                        <span>Start Cooking</span>
                      </button>
                    )}

                    {order.status === 'Cooking' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'Ready for Pickup')}
                        className="px-4 py-2 rounded-xl bg-[#22C55E] text-black font-extrabold hover:opacity-90 transition-all flex items-center gap-1.5 shadow-lg"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Mark Ready for Pickup</span>
                      </button>
                    )}

                    {order.status === 'Ready for Pickup' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'Collected')}
                        className="px-4 py-2 rounded-xl bg-blue-500 text-white font-extrabold hover:opacity-90 transition-all flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Collected</span>
                      </button>
                    )}

                    {['Pending', 'Accepted'].includes(order.status) && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'Cancelled')}
                        className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold transition-all"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel p-16 rounded-2xl text-center max-w-md mx-auto border border-white/10">
          <ShoppingBag className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Orders Found</h3>
          <p className="text-xs text-[#A1A1AA] mt-1">
            No orders match the selected filter criteria.
          </p>
        </div>
      )}

    </div>
  );
}

