import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('cb_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Flying item animation state (for standard small quick add)
  const [flyingItem, setFlyingItem] = useState(null); // { id, image, startX, startY }

  // 3D Realistic Plastic Carry Bag Packing Modal State
  const [packingModalState, setPackingModalState] = useState({
    isOpen: false,
    item: null,
    quantity: 1,
    startPos: { x: 0, y: 0 }
  });

  // Food packing animation overlay state (for checkout)
  const [isPackingAnimationActive, setIsPackingAnimationActive] = useState(false);
  const [packingCompleteCallback, setPackingCompleteCallback] = useState(null);

  useEffect(() => {
    localStorage.setItem('cb_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Core add to cart logic (preserves item, quantity, options)
  const addItemsInternal = (item, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, { ...item, quantity }];
    });
  };

  // Trigger Realistic 3D Plastic Carry Bag Packing Animation on "Order Now"
  const triggerPlasticPacking = (item, quantity = 1, clickEvent = null) => {
    // 1. Immediately ensure item is added to cart without delay
    addItemsInternal(item, quantity);

    // 2. Extract starting coordinates from click event or center
    let startX = typeof window !== 'undefined' ? window.innerWidth / 2 : 200;
    let startY = typeof window !== 'undefined' ? window.innerHeight - 150 : 400;

    if (clickEvent) {
      if (clickEvent.currentTarget && typeof clickEvent.currentTarget.getBoundingClientRect === 'function') {
        const rect = clickEvent.currentTarget.getBoundingClientRect();
        startX = rect.left + rect.width / 2;
        startY = rect.top + rect.height / 2;
      } else if (clickEvent.clientX && clickEvent.clientY) {
        startX = clickEvent.clientX;
        startY = clickEvent.clientY;
      }
    }

    // 3. Open realistic 3D plastic bag packing modal
    setPackingModalState({
      isOpen: true,
      item,
      quantity,
      startPos: { x: startX, y: startY }
    });
  };

  const closePackingModal = () => {
    setPackingModalState(prev => ({ ...prev, isOpen: false }));
  };

  // Add to cart with optional click coordinates for flying animation
  const addToCart = (item, quantity = 1, clickEvent = null) => {
    addItemsInternal(item, quantity);

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
      triggerPlasticPacking,
      packingModalState,
      closePackingModal,
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
