import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartDrawer({ onProceedToCheckout }) {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    campusDiscount,
    packagingFee,
    totalAmount,
    triggerPackingAnimation
  } = useCart();

  if (!isCartOpen) return null;

  const handleCheckoutClick = () => {
    // Triggers the special packing animation first, then executes navigation callback
    triggerPackingAnimation(() => {
      onProceedToCheckout();
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Dimmed Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="w-screen max-w-md bg-[#141414] border-l border-white/10 text-white flex flex-col justify-between shadow-2xl relative z-10"
        >
          {/* Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B]">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white leading-tight">Your Canteen Cart</h2>
                <p className="text-xs text-[#A1A1AA]">{cartItems.length} unique items selected</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cartItems.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-zinc-500 hover:text-red-400 px-2 py-1 transition-colors"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="glass-card p-3 rounded-xl border border-white/5 flex items-center gap-3 relative group"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white truncate">{item.name}</h4>
                    <p className="text-xs text-[#F59E0B] font-semibold mt-0.5">₹{item.price} each</p>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center bg-[#090909] rounded-lg border border-white/10 p-0.5">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-5 h-5 rounded flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-5 h-5 rounded flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-xs text-zinc-400">
                        = <strong className="text-white">₹{item.price * item.quantity}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-zinc-600 hover:text-red-400 p-2 transition-colors self-start"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 text-zinc-600">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-white">Your cart is hungry!</h3>
                <p className="text-xs text-[#A1A1AA] mt-1 max-w-xs mx-auto">
                  Explore today's canteen specials, burgers, rice boxes, and chill coolers to pre-order.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-4 px-4 py-2 rounded-xl bg-[#F59E0B] text-black font-bold text-xs hover:bg-[#FF6B35] transition-all"
                >
                  Browse Campus Menu
                </button>
              </div>
            )}
          </div>

          {/* Footer & Order Summary */}
          {cartItems.length > 0 && (
            <div className="p-5 border-t border-white/10 bg-[#0E0E0E] space-y-3">
              {/* Calculations breakdown */}
              <div className="space-y-1.5 text-xs text-[#A1A1AA]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-white font-medium">₹{subtotal}</span>
                </div>
                {campusDiscount > 0 && (
                  <div className="flex justify-between text-[#22C55E]">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Student Perk (10% Off &gt; ₹300)
                    </span>
                    <span>-₹{campusDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Eco-Packaging & Canteen Tray</span>
                  <span className="text-white font-medium">₹{packagingFee}</span>
                </div>
                <div className="pt-2 border-t border-white/10 flex justify-between text-base font-black text-white">
                  <span>Total Payable</span>
                  <span className="text-[#F59E0B]">₹{totalAmount}</span>
                </div>
              </div>

              {/* Proceed to Checkout Button */}
              <button
                onClick={handleCheckoutClick}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-[#F59E0B] to-[#FF6B35] text-black font-extrabold flex items-center justify-center gap-2 hover:opacity-95 shadow-glow-primary active:scale-[0.98] transition-all"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[11px] text-zinc-500 text-center">
                Instant digital token & QR code generated after checkout
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

