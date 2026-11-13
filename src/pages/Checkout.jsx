import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  Smartphone, 
  Clock, 
  User, 
  ShieldCheck, 
  AlertCircle, 
  ArrowLeft, 
  ShoppingBag, 
  Sparkles,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';

export default function Checkout({ onBackToMenu, onOrderPlaced, onNavigate }) {
  const { cartItems, subtotal, campusDiscount, packagingFee, totalAmount, clearCart } = useCart();
  const { studentProfile, isAuthenticated, loginWithEmail } = useAuth();
  const { placeOrder } = useOrders();

  // Form states
  const [pickupSlot, setPickupSlot] = useState("Immediate (10-15 Mins)");
  const [paymentMethod, setPaymentMethod] = useState("upi"); // 'upi' | 'campus-card' | 'counter-cash'
  const [orderNotes, setOrderNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // If cart is empty, redirect back
  if (cartItems.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center text-white">
        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 text-[#F59E0B]">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black mb-2">Your Cart is Empty</h2>
        <p className="text-sm text-[#A1A1AA] mb-6">
          Add some delicious items from the 3D canteen showcase before checking out.
        </p>
        <button
          onClick={onBackToMenu}
          className="px-6 py-3 rounded-xl bg-[#F59E0B] text-black font-bold text-sm hover:bg-[#FF6B35] transition-all"
        >
          Return to Menu
        </button>
      </div>
    );
  }

  const handlePayNow = (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      if (onNavigate) {
        onNavigate('login');
      }
      return;
    }

    setIsProcessing(true);

    // Simulate swift, ultra-smooth demo payment
    setTimeout(() => {
      const createdOrder = placeOrder({
        items: cartItems,
        pickupSlot,
        paymentMethod: paymentMethod === 'upi' ? 'UPI FastPay (Simulated Demo)' : paymentMethod === 'campus-card' ? 'Campus Card NFC (Simulated Demo)' : 'Pay on Counter Pickup',
        notes: orderNotes,
        studentInfo: studentProfile
      });

      clearCart();
      setIsProcessing(false);
      onOrderPlaced(createdOrder.id);
    }, 1200);
  };

  return (
    <div className="w-full bg-[#090909] text-white min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Back Navigation */}
        <button
          onClick={onBackToMenu}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#A1A1AA] hover:text-white mb-6 group transition-colors"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Menu</span>
        </button>

        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Checkout & Pre-Order
          </h1>
          <p className="text-sm text-[#A1A1AA] mt-1">
            Review your order items, select your campus break time slot, and confirm simulated demo payment.
          </p>
        </div>

        <form onSubmit={handlePayNow} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT 7 COLS: Student Info, Slot Picker, Payment Options */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Student Info Verification Card */}
            <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2.5">
                  <User className="w-5 h-5 text-[#F59E0B]" />
                  <h3 className="font-bold text-white text-base">Student Identification</h3>
                </div>
                <span className="text-[11px] font-semibold text-[#22C55E] bg-[#22C55E]/10 px-2.5 py-0.5 rounded-full border border-[#22C55E]/20">
                  Verified Student ID
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-zinc-500 block uppercase tracking-wider text-[10px]">Student Name</span>
                  <span className="text-white font-bold text-sm">{studentProfile.name}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block uppercase tracking-wider text-[10px]">College Roll / ID</span>
                  <span className="text-white font-bold text-sm">{studentProfile.collegeId}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block uppercase tracking-wider text-[10px]">Department</span>
                  <span className="text-zinc-300 font-medium">{studentProfile.department}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block uppercase tracking-wider text-[10px]">Academic Year</span>
                  <span className="text-zinc-300 font-medium">{studentProfile.year}</span>
                </div>
              </div>
            </div>

            {/* Pickup Break Slot Selector */}
            <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
              <div className="flex items-center gap-2.5 border-b border-white/5 pb-3">
                <Clock className="w-5 h-5 text-[#F59E0B]" />
                <div>
                  <h3 className="font-bold text-white text-base">Select Pickup Time Slot</h3>
                  <p className="text-xs text-[#A1A1AA]">When do you plan to collect your order from the canteen counter?</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: "Immediate (10-15 Mins)", label: "Immediate Prep", desc: "Next 10-15 mins" },
                  { id: "12:45 PM (Class 3 Break)", label: "12:45 PM Break", desc: "After lecture block" },
                  { id: "1:30 PM (Main Lunch Break)", label: "1:30 PM Lunch", desc: "Full canteen operational" },
                  { id: "4:45 PM (Evening Snacks)", label: "4:45 PM Evening", desc: "Post-lab quick grab" }
                ].map(slot => (
                  <button
                    type="button"
                    key={slot.id}
                    onClick={() => setPickupSlot(slot.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      pickupSlot === slot.id
                        ? 'bg-[#F59E0B]/15 border-[#F59E0B] shadow-glow-primary text-white'
                        : 'bg-[#141414] border-white/10 text-zinc-300 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{slot.label}</span>
                      {pickupSlot === slot.id && <CheckCircle className="w-4 h-4 text-[#F59E0B]" />}
                    </div>
                    <span className="text-[11px] text-[#A1A1AA] block mt-0.5">{slot.desc}</span>
                  </button>
                ))}
              </div>

              {/* Special Cooking Instructions / Allergy Notes */}
              <div className="pt-2">
                <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                  Special Kitchen Note (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Extra napkins, less spicy, parcel chutney separately..."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#F59E0B]"
                />
              </div>
            </div>

            {/* Online Payment Options (Simulated Demo) */}
            <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-5 h-5 text-[#F59E0B]" />
                  <div>
                    <h3 className="font-bold text-white text-base">Payment Method</h3>
                    <p className="text-xs text-[#A1A1AA]">Simulated sandbox payment demo</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
                  Frontend Demo Only
                </span>
              </div>

              <div className="space-y-3">
                {/* UPI Option */}
                <label className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'upi' ? 'bg-[#F59E0B]/10 border-[#F59E0B]' : 'bg-[#141414] border-white/10 hover:border-white/20'
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="upi"
                      checked={paymentMethod === 'upi'}
                      onChange={() => setPaymentMethod('upi')}
                      className="accent-[#F59E0B]"
                    />
                    <Smartphone className="w-5 h-5 text-[#F59E0B]" />
                    <div>
                      <span className="text-xs font-bold text-white block">UPI Instant Pay</span>
                      <span className="text-[11px] text-zinc-400">Google Pay • PhonePe • Paytm • Any UPI QR</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-[#22C55E] font-bold">Zero Fee</span>
                </label>

                {/* Campus Card Option */}
                <label className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'campus-card' ? 'bg-[#F59E0B]/10 border-[#F59E0B]' : 'bg-[#141414] border-white/10 hover:border-white/20'
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="campus-card"
                      checked={paymentMethod === 'campus-card'}
                      onChange={() => setPaymentMethod('campus-card')}
                      className="accent-[#F59E0B]"
                    />
                    <CreditCard className="w-5 h-5 text-[#FF6B35]" />
                    <div>
                      <span className="text-xs font-bold text-white block">Campus Student Meal Card</span>
                      <span className="text-[11px] text-zinc-400">Current balance: ₹{studentProfile.campusCardBalance}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-amber-400 font-bold">1-Tap NFC</span>
                </label>

                {/* Counter Cash Option */}
                <label className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'counter-cash' ? 'bg-[#F59E0B]/10 border-[#F59E0B]' : 'bg-[#141414] border-white/10 hover:border-white/20'
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="counter-cash"
                      checked={paymentMethod === 'counter-cash'}
                      onChange={() => setPaymentMethod('counter-cash')}
                      className="accent-[#F59E0B]"
                    />
                    <ShoppingBag className="w-5 h-5 text-zinc-400" />
                    <div>
                      <span className="text-xs font-bold text-white block">Pay at Canteen Counter</span>
                      <span className="text-[11px] text-zinc-400">Pay cash or card when showing your pickup token</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-bold">Offline</span>
                </label>
              </div>

              {/* Demo disclaimer alert */}
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-zinc-400">
                <AlertCircle className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
                <p>
                  <strong>Demo Mode:</strong> No real bank transactions or database mutations will occur. Placing this order will immediately register it in the Canteen Admin Kitchen display!
                </p>
              </div>
            </div>

          </div>

          {/* RIGHT 5 COLS: Order Items Summary & Pay Button */}
          <div className="lg:col-span-5">
            <div className="glass-card p-6 rounded-2xl border border-white/10 sticky top-24 space-y-5">
              <h3 className="font-bold text-white text-lg flex items-center justify-between">
                <span>Order Summary</span>
                <span className="text-xs text-[#F59E0B] font-semibold">{cartItems.length} Items</span>
              </h3>

              {/* Items List */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between text-xs py-1 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-2.5">
                      <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <span className="font-bold text-white block truncate max-w-[170px]">{item.name}</span>
                        <span className="text-zinc-500">₹{item.price} × {item.quantity}</span>
                      </div>
                    </div>
                    <span className="font-black text-white">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 pt-3 border-t border-white/10 text-xs text-[#A1A1AA]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-white font-medium">₹{subtotal}</span>
                </div>
                {campusDiscount > 0 && (
                  <div className="flex justify-between text-[#22C55E]">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Student Discount (10%)
                    </span>
                    <span>-₹{campusDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Canteen Packaging & Paper Bag</span>
                  <span className="text-white font-medium">₹{packagingFee}</span>
                </div>
                <div className="pt-3 border-t border-white/10 flex justify-between text-lg font-black text-white">
                  <span>Total Payable</span>
                  <span className="text-[#F59E0B]">₹{totalAmount}</span>
                </div>
              </div>

              {/* Pay Now Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full h-13 rounded-xl bg-gradient-to-r from-[#F59E0B] to-[#FF6B35] text-black font-black text-base flex items-center justify-center gap-2 hover:opacity-95 shadow-glow-primary active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Processing Demo Payment...</span>
                  </div>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                    <span>Pay Now • ₹{totalAmount}</span>
                  </>
                )}
              </button>

              <div className="text-[11px] text-zinc-500 text-center">
                Instant digital QR token will be generated on completion
              </div>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}

