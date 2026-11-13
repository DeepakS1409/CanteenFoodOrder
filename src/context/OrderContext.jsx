import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { initialMenuItems } from '../data/sampleMenu';
import { initialOrders } from '../data/sampleOrders';
import { menuScheduleService } from '../services/menuScheduleService';
import { foodService } from '../services/foodService';
import { weeklyMenuService } from '../services/weeklyMenuService';
import { specialMenuService } from '../services/specialMenuService';
import { currentMenuService } from '../services/currentMenuService';

const OrderContext = createContext();

export function OrderProvider({ children }) {
  // 1. Food Catalog state (initialized with cache/mock for instantaneous first paint)
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
  const [simulatedDate, setSimulatedDate] = useState(() => {
    return localStorage.getItem('cb_simulated_date') || null;
  });

  // Clock tick trigger to refresh menu automatically on date rollover or app refocus
  const [clockTick, setClockTick] = useState(0);

  // 5. Backend RPC Today Menu cache
  const [backendTodayMenu, setBackendTodayMenu] = useState(null);

  // 6. Orders state
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('cb_orders');
    return saved ? JSON.parse(saved) : initialOrders;
  });

  // Safety buffer for cooking summary
  const [cookingSafetyBuffer, setCookingSafetyBuffer] = useState(10); // percentage e.g. 10%

  // Sync orders to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('cb_orders', JSON.stringify(orders));
    } catch (_) {}
  }, [orders]);

  // Sync simulated date
  useEffect(() => {
    if (simulatedDate) {
      localStorage.setItem('cb_simulated_date', simulatedDate);
    } else {
      localStorage.removeItem('cb_simulated_date');
    }
  }, [simulatedDate]);

  // Listen for window focus & visibility changes to automatically recheck date without page refresh
  useEffect(() => {
    const handleRecheck = () => {
      setClockTick(prev => prev + 1);
    };

    window.addEventListener('focus', handleRecheck);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') handleRecheck();
    });

    const interval = setInterval(handleRecheck, 30000);

    return () => {
      window.removeEventListener('focus', handleRecheck);
      clearInterval(interval);
    };
  }, []);

  // Async load data from Supabase backend (Catalog, Weekly, Special, Today RPC)
  const refreshBackendData = useCallback(async () => {
    try {
      const [catRes, weekRes, specRes, todayRes] = await Promise.all([
        foodService.fetchCatalog({ includeInactive: true }),
        weeklyMenuService.fetchWeeklySchedule(),
        specialMenuService.fetchSpecialMenus(),
        currentMenuService.fetchTodayMenu(simulatedDate)
      ]);

      if (catRes?.data) setMenuItems(catRes.data);
      if (weekRes?.data) setWeeklySchedule(weekRes.data);
      if (specRes?.data) setSpecialMenus(specRes.data);
      if (todayRes?.success) setBackendTodayMenu(todayRes);
    } catch (err) {
      console.warn('[OrderContext] Backend sync notice:', err);
    }
  }, [simulatedDate]);

  useEffect(() => {
    refreshBackendData();

    // Subscribe to Supabase Realtime changes
    const unsubscribe = currentMenuService.subscribeToMenuUpdates(() => {
      refreshBackendData();
    });

    return () => {
      unsubscribe();
    };
  }, [refreshBackendData, clockTick]);

  // Compute Effective Menu for Today:
  // Prefer backend RPC result when available; otherwise use seamless local fallback
  const effectiveMenu = useMemo(() => {
    if (backendTodayMenu && backendTodayMenu.dishes) {
      return backendTodayMenu;
    }

    return menuScheduleService.getEffectiveMenu({
      catalog: menuItems,
      weeklySchedule,
      specialMenus,
      simulation: simulatedDate
    });
  }, [backendTodayMenu, menuItems, weeklySchedule, specialMenus, simulatedDate, clockTick]);

  // Schedule Management Actions (Optimistic Local UI + Async Backend Sync):
  const updateDaySchedule = useCallback(async (dayKey, dishIds) => {
    setWeeklySchedule(prev => ({ ...prev, [dayKey]: dishIds }));
    setBackendTodayMenu(null); // invalidate cached today menu to re-evaluate
    await weeklyMenuService.saveDaySchedule(dayKey, dishIds);
    refreshBackendData();
  }, [refreshBackendData]);

  const saveFullWeeklySchedule = useCallback(async (newSchedule) => {
    setWeeklySchedule(newSchedule);
    setBackendTodayMenu(null);
    const res = await weeklyMenuService.saveFullWeeklySchedule(newSchedule);
    refreshBackendData();
    return res;
  }, [refreshBackendData]);

  const copyDaySchedule = useCallback(async (fromDayKey, toDayKey) => {
    setWeeklySchedule(prev => {
      const sourceDishes = prev[fromDayKey] || [];
      const updated = { ...prev, [toDayKey]: [...sourceDishes] };
      weeklyMenuService.saveDaySchedule(toDayKey, [...sourceDishes]);
      return updated;
    });
    setBackendTodayMenu(null);
    setTimeout(() => refreshBackendData(), 100);
  }, [refreshBackendData]);

  const clearDaySchedule = useCallback(async (dayKey) => {
    setWeeklySchedule(prev => ({ ...prev, [dayKey]: [] }));
    setBackendTodayMenu(null);
    await weeklyMenuService.saveDaySchedule(dayKey, []);
    refreshBackendData();
  }, [refreshBackendData]);

  const resetSchedules = useCallback(async () => {
    const res = await weeklyMenuService.resetToDefaults();
    await specialMenuService.fetchSpecialMenus();
    setBackendTodayMenu(null);
    refreshBackendData();
    return res;
  }, [refreshBackendData]);

  const saveSpecialDateMenu = useCallback(async (dateStr, data) => {
    setSpecialMenus(prev => ({
      ...prev,
      [dateStr]: {
        dishIds: data.dishIds || [],
        title: data.title || "Campus Canteen Special Menu",
        badge: data.badge || "Special Menu",
        notes: data.notes || ""
      }
    }));
    setBackendTodayMenu(null);
    const res = await specialMenuService.saveSpecialDateMenu(dateStr, data);
    refreshBackendData();
    return res;
  }, [refreshBackendData]);

  const deleteSpecialDateMenu = useCallback(async (dateStr) => {
    setSpecialMenus(prev => {
      const updated = { ...prev };
      delete updated[dateStr];
      return updated;
    });
    setBackendTodayMenu(null);
    const res = await specialMenuService.deleteSpecialDateMenu(dateStr);
    refreshBackendData();
    return res;
  }, [refreshBackendData]);

  // Admin Menu Management actions (Catalog CRUD):
  const addMenuItem = async (itemData) => {
    const newItem = {
      ...itemData,
      id: `item-${Date.now()}`,
      available: true,
      stock: itemData.stock ? parseInt(itemData.stock, 10) : 30,
      price: parseFloat(itemData.price),
      rating: 5.0,
      reviewsCount: 1,
      isActive: true
    };
    setMenuItems(prev => [newItem, ...prev]);

    const res = await foodService.createDish(newItem);
    if (res?.data?.id) {
      setMenuItems(prev => prev.map(i => i.id === newItem.id ? res.data : i));
    }
    refreshBackendData();
    return res?.data || newItem;
  };

  const updateMenuItem = async (itemId, updates) => {
    setMenuItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, ...updates };
      }
      return item;
    }));
    await foodService.updateDish(itemId, updates);
    refreshBackendData();
  };

  const toggleItemAvailability = async (itemId) => {
    let nextState = true;
    setMenuItems(prev => prev.map(item => {
      if (item.id === itemId) {
        nextState = !item.available;
        return { ...item, available: nextState, stock: nextState ? 25 : 0 };
      }
      return item;
    }));
    await foodService.toggleAvailability(itemId, nextState);
    refreshBackendData();
  };

  const deleteMenuItem = async (itemId) => {
    setMenuItems(prev => prev.filter(item => item.id !== itemId));
    // Remove from weekly schedule
    setWeeklySchedule(prev => {
      const updated = {};
      Object.entries(prev).forEach(([day, ids]) => {
        updated[day] = ids.filter(id => id !== itemId);
      });
      return updated;
    });
    setBackendTodayMenu(null);

    await foodService.deleteDish(itemId, true); // soft delete preserves past orders
    refreshBackendData();
  };

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
      calculateCookingSummary,
      refreshBackendData
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
