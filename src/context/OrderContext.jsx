import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialMenuItems } from '../data/sampleMenu';
import { initialOrders } from '../data/sampleOrders';

const OrderContext = createContext();

export function OrderProvider({ children }) {
  // Menu items state
  const [menuItems, setMenuItems] = useState(() => {
    const saved = localStorage.getItem('cb_menu_items');
    return saved ? JSON.parse(saved) : initialMenuItems;
  });

  // Orders state
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('cb_orders');
    return saved ? JSON.parse(saved) : initialOrders;
  });

  // Safety buffer for cooking summary
  const [cookingSafetyBuffer, setCookingSafetyBuffer] = useState(10); // percentage e.g. 10%

  useEffect(() => {
    localStorage.setItem('cb_menu_items', JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem('cb_orders', JSON.stringify(orders));
  }, [orders]);

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
      status: "Pending", // initial status
      paymentStatus: `Paid (${paymentMethod || 'UPI FastPay'})`,
      paymentMethod: paymentMethod || "UPI FastPay Demo",
      createdAt: new Date().toISOString(),
      prepRemainingMins: 15,
      qrCodeValue: `CAMPUSBITE:${newOrderId}:TOKEN:${tokenNumber}:${studentInfo.name}`,
      notes: notes || ""
    };

    setOrders(prev => [newOrder, ...prev]);

    // Also decrement stock if available
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

    // Cancellation check: Allow cancellation only when Pending or Accepted
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

    // If Pending or Accepted, allow cancellation
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

  // Admin Menu Management actions
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
  };

  // Cooking summary calculation
  // "Group all confirmed orders by food item... Calculate total quantity required... Allow optional configurable safety buffer... Cancelled, failed and unpaid orders must NOT be counted."
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

