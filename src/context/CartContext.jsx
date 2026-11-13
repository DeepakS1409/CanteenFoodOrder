import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('cb_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Flying item animation state
  const [flyingItem, setFlyingItem] = useState(null); // { id, image, startX, startY }

  // Food packing animation overlay state
  const [isPackingAnimationActive, setIsPackingAnimationActive] = useState(false);
  const [packingCompleteCallback, setPackingCompleteCallback] = useState(null);

  useEffect(() => {
    localStorage.setItem('cb_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Add to cart with optional click coordinates for flying animation
  const addToCart = (item, quantity = 1, clickEvent = null) => {
    // If click event provided, trigger fly animation
    if (clickEvent) {
      const rect = clickEvent.currentTarget?.getBoundingClientRect?.() || {
        x: clickEvent.clientX || window.innerWidth / 2,
        y: clickEvent.clientY || window.innerHeight / 2
      };
      
      const startX = clickEvent.clientX || (rect.left + rect.width / 2);
      const startY = clickEvent.clientY || (rect.top + rect.height / 2);

      setFlyingItem({
        id: Date.now(),
        image: item.image,
        startX,
        startY
      });

      // Clear after animation duration
      setTimeout(() => {
        setFlyingItem(null);
      }, 850);
    }

    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, { ...item, quantity }];
    });
  };

  const updateQuantity = (id, newQty) => {
    if (newQty <= 0) {
      removeFromCart(id);
      return;
    }
    setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity: newQty } : item));
  };

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Trigger packing animation before checkout
  const triggerPackingAnimation = (onComplete) => {
    setIsCartOpen(false);
    setIsPackingAnimationActive(true);
    setPackingCompleteCallback(() => onComplete);
  };

  const finishPackingAnimation = () => {
    setIsPackingAnimationActive(false);
    if (packingCompleteCallback) {
      packingCompleteCallback();
      setPackingCompleteCallback(null);
    }
  };

  const totalItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const campusDiscount = subtotal > 300 ? Math.round(subtotal * 0.1) : 0; // 10% student perk on orders > 300
  const packagingFee = subtotal > 0 ? 10 : 0;
  const totalAmount = Math.max(0, subtotal - campusDiscount + packagingFee);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      isCartOpen,
      setIsCartOpen,
      flyingItem,
      totalItemsCount,
      subtotal,
      campusDiscount,
      packagingFee,
      totalAmount,
      isPackingAnimationActive,
      triggerPackingAnimation,
      finishPackingAnimation
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}

