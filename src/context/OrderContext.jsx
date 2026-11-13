import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { initialMenuItems } from '../data/sampleMenu';
import { initialOrders } from '../data/sampleOrders';
import { menuScheduleService } from '../services/menuScheduleService';

const OrderContext = createContext();

export function OrderProvider({ children }) {
  // 1. Food Catalog state
  const [menuItems, setMenuItems] = useState(() => {
    return menuScheduleService.getCatalog();
  });

  // 2. Weekly Schedule state
  const [weeklySchedule, setWeeklySchedule] = useState(() => {
    return menuScheduleService.getWeeklySchedule();
  });

  // 3. Special Date Overrides state
  const [specialMenus, setSpecialMenus] = useState(() => {
    return menuScheduleService.getSpecialDateSchedules();
  });

  // 4. Development Date Simulator state (null = real system local time)
  // Can be a weekday name e.g. "monday" or ISO date string "2026-11-16"
  const [simulatedDate, setSimulatedDate] = useState(() => {
    return localStorage.getItem('cb_simulated_date') || null;
  });

  // Clock tick trigger to refresh menu automatically on date rollover or app refocus
  const [clockTick, setClockTick] = useState(0);

  // 5. Orders state
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('cb_orders');
    return saved ? JSON.parse(saved) : initialOrders;
  });

  // Safety buffer for cooking summary
  const [cookingSafetyBuffer, setCookingSafetyBuffer] = useState(10); // percentage e.g. 10%

  // Sync catalog changes
  useEffect(() => {
    localStorage.setItem('cb_menu_items', JSON.stringify(menuItems));
  }, [menuItems]);

  // Sync orders
  useEffect(() => {
    localStorage.setItem('cb_orders', JSON.stringify(orders));
  }, [orders]);

  // Sync simulated date
  useEffect(() => {
    if (simulatedDate) {
      localStorage.setItem('cb_simulated_date', simulatedDate);
    } else {
      localStorage.removeItem('cb_simulated_date');
    }
  }, [simulatedDate]);

  // Listen for window focus & visibility changes to automatically update date without page refresh
  useEffect(() => {
    const handleRecheck = () => {
      setClockTick(prev => prev + 1);
    };

    window.addEventListener('focus', handleRecheck);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') handleRecheck();
    });

    // Also check every 30 seconds for midnight rollover
    const interval = setInterval(handleRecheck, 30000);

    return () => {
      window.removeEventListener('focus', handleRecheck);
      clearInterval(interval);
    };
  }, []);

  // 6. Compute Effective Menu for Today (reactive to catalog, schedules, simulation & clock)
  const effectiveMenu = useMemo(() => {
    return menuScheduleService.getEffectiveMenu({
      catalog: menuItems,
      weeklySchedule,
      specialMenus,
      simulation: simulatedDate
    });
  }, [menuItems, weeklySchedule, specialMenus, simulatedDate, clockTick]);

  // Schedule Management Actions:
  const updateDaySchedule = useCallback((dayKey, dishIds) => {
    setWeeklySchedule(prev => {
      const updated = { ...prev, [dayKey]: dishIds };
      menuScheduleService.saveWeeklySchedule(updated);
      return updated;
    });
  }, []);

  const saveFullWeeklySchedule = useCallback((newSchedule) => {
    menuScheduleService.saveWeeklySchedule(newSchedule);
    setWeeklySchedule(newSchedule);
    return { success: true };
  }, []);

  const copyDaySchedule = useCallback((fromDayKey, toDayKey) => {
    setWeeklySchedule(prev => {
      const sourceDishes = prev[fromDayKey] || [];
      const updated = { ...prev, [toDayKey]: [...sourceDishes] };
      menuScheduleService.saveWeeklySchedule(updated);
      return updated;
    });
  }, []);

  const clearDaySchedule = useCallback((dayKey) => {
    setWeeklySchedule(prev => {
      const updated = { ...prev, [dayKey]: [] };
      menuScheduleService.saveWeeklySchedule(updated);
      return updated;
    });
  }, []);

  const resetSchedules = useCallback(() => {
    const res = menuScheduleService.resetScheduleToDefault();
    if (res.success) {
      setWeeklySchedule(res.weeklySchedule);
      setSpecialMenus(res.specialMenus);
    }
    return res;
  }, []);

  const saveSpecialDateMenu = useCallback((dateStr, data) => {
    const res = menuScheduleService.saveSpecialDateSchedule(dateStr, data);
    if (res.success) {
      setSpecialMenus(res.specialMenus);
    }
    return res;
  }, []);

  const deleteSpecialDateMenu = useCallback((dateStr) => {
    const res = menuScheduleService.deleteSpecialDateSchedule(dateStr);
    if (res.success) {
      setSpecialMenus(res.specialMenus);
    }
    return res;
  }, []);

  // Place new order
  const placeOrder = ({ items, pickupSlot, paymentMethod, notes, studentInfo }) => {
    const orderNumber = Math.floor(1000 + Math.random() * 9000);
    const tokenNumber = `T-${Math.floor(10 + Math.random() * 89)}`;
    const newOrderId = `CB-${orderNumber}`;

    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const newOrder = {
      id: newOrderId,
      token: tokenNumber,
      studentName: studentInfo.name || "Alex Rivera",
      studentId: studentInfo.collegeId || "CB-2024-884",
      department: studentInfo.department || "Computer Science",
      year: studentInfo.year || "3rd Year",
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image
      })),
      totalAmount,
      pickupSlot: pickupSlot || "Immediate (Next 10 Mins)",
      status: "Pending",
      paymentStatus: `Paid (${paymentMethod || 'UPI FastPay'})`,
      paymentMethod: paymentMethod || "UPI FastPay Demo",
      createdAt: new Date().toISOString(),
      prepRemainingMins: 15,
      qrCodeValue: `CAMPUSBITE:${newOrderId}:TOKEN:${tokenNumber}:${studentInfo.name}`,
      notes: notes || ""
    };

    setOrders(prev => [newOrder, ...prev]);

    // Decrement stock if available
    setMenuItems(prev => prev.map(menuItem => {
      const ordered = items.find(i => i.id === menuItem.id);
      if (ordered) {
        const remaining = Math.max(0, menuItem.stock - ordered.quantity);
        return { ...menuItem, stock: remaining, available: remaining > 0 };
      }
      return menuItem;
    }));

    return newOrder;
  };

  // Cancel order (with validation)
  const cancelOrder = (orderId, reason = "Changed my mind") => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) {
      return { success: false, message: "Order not found." };
    }

    if (targetOrder.status === 'Cooking') {
      return {
        success: false,
        message: "Order is already in the kitchen cooking! The canteen kitchen has begun preparation and ingredients are actively being prepared. Cancellation is no longer permitted."
      };
    }

    if (targetOrder.status === 'Ready for Pickup' || targetOrder.status === 'Collected') {
      return {
        success: false,
        message: `Order is already ${targetOrder.status.toLowerCase()} and cannot be cancelled.`
      };
    }

    if (targetOrder.status === 'Cancelled') {
      return {
        success: false,
        message: "This order is already cancelled."
      };
    }

    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          status: 'Cancelled',
          cancelReason: reason,
          cancelledAt: new Date().toISOString()
        };
      }
      return order;
    }));

    return { success: true, message: "Order cancelled successfully. Refund initiated to original payment method." };
  };

  // Admin order status update
  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        let prepMins = order.prepRemainingMins;
        if (newStatus === 'Cooking') prepMins = 8;
        if (newStatus === 'Ready for Pickup' || newStatus === 'Collected' || newStatus === 'Cancelled') prepMins = 0;
        return {
          ...order,
          status: newStatus,
          prepRemainingMins: prepMins,
          updatedAt: new Date().toISOString()
        };
      }
      return order;
    }));
  };

  // Admin Menu Management actions (Catalog CRUD)
  const addMenuItem = (itemData) => {
    const newItem = {
      ...itemData,
      id: `item-${Date.now()}`,
      available: true,
      stock: itemData.stock ? parseInt(itemData.stock, 10) : 30,
      price: parseFloat(itemData.price),
      rating: 5.0,
      reviewsCount: 1
    };
    setMenuItems(prev => [newItem, ...prev]);
    return newItem;
  };

  const updateMenuItem = (itemId, updates) => {
    setMenuItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, ...updates };
      }
      return item;
    }));
  };

  const toggleItemAvailability = (itemId) => {
    setMenuItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const nextState = !item.available;
        return { ...item, available: nextState, stock: nextState ? 25 : 0 };
      }
      return item;
    }));
  };

  const deleteMenuItem = (itemId) => {
    setMenuItems(prev => prev.filter(item => item.id !== itemId));
    // Also remove from all days in weekly schedule
    setWeeklySchedule(prev => {
      const updated = {};
      Object.entries(prev).forEach(([day, ids]) => {
        updated[day] = ids.filter(id => id !== itemId);
      });
      menuScheduleService.saveWeeklySchedule(updated);
      return updated;
    });
  };

  // Cooking summary calculation
  const calculateCookingSummary = () => {
    const validOrders = orders.filter(o => 
      ['Accepted', 'Cooking', 'Ready for Pickup'].includes(o.status)
    );

    const summaryMap = {};

    validOrders.forEach(order => {
      order.items.forEach(item => {
        if (!summaryMap[item.name]) {
          summaryMap[item.name] = {
            id: item.id,
            name: item.name,
            image: item.image,
            confirmedQuantity: 0,
            ordersBreakdown: []
          };
        }
        summaryMap[item.name].confirmedQuantity += item.quantity;
        summaryMap[item.name].ordersBreakdown.push({
          orderId: order.id,
          token: order.token,
          studentName: order.studentName,
          status: order.status,
          quantity: item.quantity
        });
      });
    });

    const summaryList = Object.values(summaryMap).map(entry => {
      const bufferQty = Math.ceil(entry.confirmedQuantity * (cookingSafetyBuffer / 100));
      return {
        ...entry,
        bufferQuantity: bufferQty,
        totalToPrepare: entry.confirmedQuantity + bufferQty
      };
    });

    return summaryList.sort((a, b) => b.totalToPrepare - a.totalToPrepare);
  };

  return (
    <OrderContext.Provider value={{
      menuItems,
      orders,
      weeklySchedule,
      specialMenus,
      simulatedDate,
      setSimulatedDate,
      effectiveMenu,
      updateDaySchedule,
      saveFullWeeklySchedule,
      copyDaySchedule,
      clearDaySchedule,
      resetSchedules,
      saveSpecialDateMenu,
      deleteSpecialDateMenu,
      cookingSafetyBuffer,
      setCookingSafetyBuffer,
      placeOrder,
      cancelOrder,
      updateOrderStatus,
      addMenuItem,
      updateMenuItem,
      toggleItemAvailability,
      deleteMenuItem,
      calculateCookingSummary
    }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) throw new Error('useOrders must be used within an OrderProvider');
  return context;
}
