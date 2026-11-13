import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  CheckCircle2, 
  Flame, 
  ShoppingBag, 
  AlertTriangle, 
  XCircle, 
  QrCode, 
  ChevronRight,
  Info,
  Calendar,
  Sparkles
} from 'lucide-react';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';

const STATUS_STEPS = [
  { key: 'Pending', label: 'Order Placed', desc: 'Sent to canteen desk' },
  { key: 'Accepted', label: 'Accepted', desc: 'Assigned to kitchen chef' },
  { key: 'Cooking', label: 'Cooking', desc: 'On hot stove & fryer' },
  { key: 'Ready for Pickup', label: 'Ready for Pickup', desc: 'Waiting at Counter 2' },
  { key: 'Collected', label: 'Collected', desc: 'Handed over' },
];

export default function MyOrders({ onExploreMenu }) {
  const { orders, cancelOrder } = useOrders();
  const { user, studentProfile, isAdmin } = useAuth();
  const [selectedOrderForCancel, setSelectedOrderForCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState("Change of lecture schedule");
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  // Filter orders: student can only view their own orders
  const displayOrders = orders.filter(o => {
    if (isAdmin) return true;
    if (user && o.userId === user.id) return true;
    if (studentProfile && (o.studentId === studentProfile.collegeId || o.studentName === studentProfile.name)) return true;
    return false;
  });

  const handleCancelSubmit = (e) => {
    e.preventDefault();
    if (!selectedOrderForCancel) return;

    const res = cancelOrder(selectedOrderForCancel.id, cancelReason);
    setFeedbackMessage(res);
    setSelectedOrderForCancel(null);

    setTimeout(() => {
      setFeedbackMessage(null);
    }, 4000);
  };

  const getStepIndex = (status) => {
    if (status === 'Cancelled') return -1;
    return STATUS_STEPS.findIndex(s => s.key === status);
  };

  return (
    <div className="w-full bg-[#090909] text-white min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F59E0B]/20 text-[#F59E0B] text-xs font-bold uppercase tracking-wider mb-2">
              <Clock className="w-3.5 h-3.5" />
              <span>Campus Kitchen Live Sync</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              My Orders & Live Timeline
            </h1>
            <p className="text-sm text-[#A1A1AA] mt-1">
              Track your canteen food status from prep to counter pickup.
            </p>
          </div>

          <button
            onClick={onExploreMenu}
            className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs border border-white/10 flex items-center gap-2 transition-all self-start sm:self-center"
          >
            <ShoppingBag className="w-4 h-4 text-[#F59E0B]" />
            <span>Order More Food</span>
          </button>
        </div>

        {/* Global Feedback Banner */}
        <AnimatePresence>
          {feedbackMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`p-4 rounded-xl mb-6 text-xs flex items-center gap-3 border ${
                feedbackMessage.success 
                  ? 'bg-green-950/40 border-green-500/40 text-green-300' 
                  : 'bg-red-950/40 border-red-500/40 text-red-300'
              }`}
            >
              {feedbackMessage.success ? <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" /> : <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />}
              <span>{feedbackMessage.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Orders Listing */}
        {displayOrders.length > 0 ? (
          <div className="space-y-6">
            {displayOrders.map((order) => {
              const currentStep = getStepIndex(order.status);
              const isCancelled = order.status === 'Cancelled';
              const isCooking = order.status === 'Cooking';
              const isReady = order.status === 'Ready for Pickup';
              const canCancel = ['Pending', 'Accepted'].includes(order.status);

              return (
                <div
                  key={order.id}
                  className={`glass-card p-6 rounded-2xl border transition-all ${
                    isReady 
                      ? 'border-[#22C55E]/50 shadow-[0_0_25px_rgba(34,197,94,0.15)] bg-[#141d16]/80' 
                      : isCooking
                        ? 'border-[#F59E0B]/40 shadow-glow-primary'
                        : isCancelled
                          ? 'border-red-500/20 opacity-75'
                          : 'border-white/10'
                  }`}
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-black text-[#F59E0B] tracking-tight bg-[#090909] px-3 py-1 rounded-xl border border-white/10 shadow-inner">
                        {order.token}
                      </div>
                      <div>
                        <span className="text-xs text-zinc-400 block">
                          Order <strong className="text-white font-mono">{order.id}</strong>
                        </span>
                        <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Slot: {order.pickupSlot}
                        </span>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                        isReady
                          ? 'bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/40 animate-pulse'
                          : isCooking
                            ? 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40'
                            : isCancelled
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : 'bg-white/10 text-white'
                      }`}>
                        {isReady && <Sparkles className="w-3 h-3" />}
                        {isCooking && <Flame className="w-3 h-3 animate-bounce" />}
                        <span>{order.status}</span>
                      </span>
                    </div>
                  </div>

                  {/* Status Timeline */}
                  {!isCancelled ? (
                    <div className="py-6 border-b border-white/5">
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 relative">
                        {STATUS_STEPS.map((step, idx) => {
                          const isDone = currentStep >= idx;
                          const isCurrent = currentStep === idx;

                          return (
                            <div key={step.key} className="flex flex-col items-center text-center relative z-10">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                isCurrent
                                  ? 'bg-[#F59E0B] text-black ring-4 ring-[#F59E0B]/20 scale-110 shadow-glow-primary'
                                  : isDone
                                    ? 'bg-[#22C55E] text-black'
                                    : 'bg-[#141414] text-zinc-600 border border-white/10'
                              }`}>
                                {isDone && !isCurrent ? (
                                  <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                                ) : (
                                  <span>{idx + 1}</span>
                                )}
                              </div>
                              <span className={`text-xs font-bold mt-2 ${
                                isCurrent ? 'text-[#F59E0B]' : isDone ? 'text-white' : 'text-zinc-600'
                              }`}>
                                {step.label}
                              </span>
                              <span className="text-[10px] text-zinc-500 hidden sm:block mt-0.5">
                                {step.desc}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Ready Callout Alert */}
                      {isReady && (
                        <div className="mt-4 p-3 rounded-xl bg-[#22C55E]/15 border border-[#22C55E]/30 text-xs text-[#22C55E] flex items-center justify-between">
                          <span className="font-bold flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            Your order is READY at Canteen Counter 2! Please flash your token #{order.token}.
                          </span>
                          <span className="text-[11px] underline cursor-pointer font-bold">Pick Up Hot</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="my-4 p-3.5 rounded-xl bg-red-950/30 border border-red-500/20 text-xs text-red-300">
                      <strong>Order Cancelled:</strong> {order.cancelReason || 'Requested by student before cooking began.'} Refund credited to campus meal balance.
                    </div>
                  )}

                  {/* Order Items & Summary */}
                  <div className="pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs bg-[#141414] px-3 py-1.5 rounded-xl border border-white/5">
                          <img src={it.image} alt={it.name} className="w-6 h-6 rounded-md object-cover" />
                          <span className="font-medium text-white">{it.quantity}x {it.name}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-4 text-xs">
                      <div>
                        <span className="text-zinc-500 block">Total Paid</span>
                        <span className="text-base font-black text-white">₹{order.totalAmount}</span>
                      </div>

                      {/* Cancellation Button Logic */}
                      {canCancel && (
                        <button
                          onClick={() => setSelectedOrderForCancel(order)}
                          className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/30 font-bold text-xs transition-all"
                        >
                          Cancel Order
                        </button>
                      )}

                      {/* Disabled Cancellation Banner with Explanation when Cooking */}
                      {isCooking && (
                        <div className="group relative">
                          <button
                            disabled
                            className="px-3.5 py-2 rounded-xl bg-zinc-800 text-zinc-500 border border-white/5 font-semibold text-xs cursor-not-allowed flex items-center gap-1.5"
                          >
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                            <span>Cancellation Locked</span>
                          </button>
                          
                          {/* Hover Tooltip / Explanation */}
                          <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block w-72 p-3 rounded-xl bg-[#1B1B1B] border border-amber-500/40 text-[11px] text-zinc-300 shadow-2xl z-20">
                            <strong className="text-amber-400 block mb-1">Cooking in Progress</strong>
                            The canteen kitchen has already prepped and cooked these ingredients. Under canteen policy, cancellation is locked once cooking begins.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-panel p-16 rounded-3xl text-center max-w-md mx-auto my-12 border border-white/10">
            <ShoppingBag className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">No Orders Yet</h3>
            <p className="text-xs text-[#A1A1AA] mt-1">
              You haven't placed any canteen orders today. Explore the 3D menu and grab a hot bite!
            </p>
            <button
              onClick={onExploreMenu}
              className="mt-4 px-5 py-2.5 rounded-xl bg-[#F59E0B] text-black font-bold text-xs hover:bg-[#FF6B35] transition-all"
            >
              Explore Canteen Menu
            </button>
          </div>
        )}

      </div>

      {/* Cancellation Reason Modal */}
      <AnimatePresence>
        {selectedOrderForCancel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card max-w-md w-full p-6 rounded-2xl border border-red-500/30 shadow-2xl relative"
            >
              <h3 className="text-lg font-bold text-white mb-1">Cancel Order #{selectedOrderForCancel.id}?</h3>
              <p className="text-xs text-[#A1A1AA] mb-4">
                Since this order is still <strong>{selectedOrderForCancel.status}</strong>, full refund of ₹{selectedOrderForCancel.totalAmount} will be returned to your Campus Balance.
              </p>

              <form onSubmit={handleCancelSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Reason for cancellation:</label>
                  <select
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#141414] border border-white/10 text-xs text-white focus:outline-none focus:border-[#F59E0B]"
                  >
                    <option value="Change of lecture schedule">Change of lecture schedule</option>
                    <option value="Ordered incorrect item">Ordered incorrect item</option>
                    <option value="Taking lunch off-campus">Taking lunch off-campus</option>
                    <option value="Break ended early">Break ended early</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOrderForCancel(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
                  >
                    Keep Order
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs shadow-lg transition-all"
                  >
                    Confirm Cancellation
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

