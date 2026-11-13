export const initialOrders = [
  {
    id: "CB-8492",
    token: "T-42",
    studentName: "Alex Rivera",
    studentId: "CB-2024-884",
    department: "Computer Science",
    year: "3rd Year",
    items: [
      { id: "item-1", name: "The Quad Smash Burger", quantity: 2, price: 180, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80" },
      { id: "item-5", name: "Golden Truffle Crispy Fries", quantity: 1, price: 110, image: "https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=900&q=80" },
      { id: "item-6", name: "Cold Brew Mango Mint Cooler", quantity: 1, price: 95, image: "https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=900&q=80" }
    ],
    totalAmount: 565,
    pickupSlot: "12:45 PM (After Lab)",
    status: "Cooking", // Pending | Accepted | Cooking | Ready for Pickup | Collected | Cancelled
    paymentStatus: "Paid (Demo UPI)",
    paymentMethod: "UPI FastPay",
    createdAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    prepRemainingMins: 6,
    qrCodeValue: "CAMPUSBITE:CB-8492:TOKEN:T-42:ALEX",
    notes: "Extra napkins and spicy dip please!"
  },
  {
    id: "CB-8491",
    token: "T-41",
    studentName: "Priya Sharma",
    studentId: "CB-2023-102",
    department: "Electronics & Comm.",
    year: "4th Year",
    items: [
      { id: "item-4", name: "Ghee Roast Masala Dosa", quantity: 2, price: 90, image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=900&q=80" },
      { id: "item-7", name: "Oreo Monster Fudge Shake", quantity: 1, price: 135, image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=900&q=80" }
    ],
    totalAmount: 315,
    pickupSlot: "12:30 PM (Break Time)",
    status: "Ready for Pickup",
    paymentStatus: "Paid (Campus Card)",
    paymentMethod: "Campus NFC Card",
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    prepRemainingMins: 0,
    qrCodeValue: "CAMPUSBITE:CB-8491:TOKEN:T-41:PRIYA",
    notes: "Chutney packed separately"
  },
  {
    id: "CB-8490",
    token: "T-40",
    studentName: "Rohan Varma",
    studentId: "CB-2024-519",
    department: "Mechanical Engg.",
    year: "2nd Year",
    items: [
      { id: "item-2", name: "Schezwan Fire Fried Rice", quantity: 1, price: 140, image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=80" },
      { id: "item-3", name: "Crispy Peri-Peri Chicken Sub", quantity: 1, price: 160, image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=900&q=80" }
    ],
    totalAmount: 300,
    pickupSlot: "1:00 PM (Lunch Break)",
    status: "Accepted",
    paymentStatus: "Paid (Demo UPI)",
    paymentMethod: "Google Pay Demo",
    createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    prepRemainingMins: 12,
    qrCodeValue: "CAMPUSBITE:CB-8490:TOKEN:T-40:ROHAN",
    notes: "Make it extra spicy"
  },
  {
    id: "CB-8489",
    token: "T-39",
    studentName: "Ananya Iyer",
    studentId: "CB-2025-331",
    department: "Biotechnology",
    year: "1st Year",
    items: [
      { id: "item-8", name: "Paneer Butter Masala Meal Box", quantity: 1, price: 190, image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=900&q=80" },
      { id: "item-6", name: "Cold Brew Mango Mint Cooler", quantity: 1, price: 95, image: "https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=900&q=80" }
    ],
    totalAmount: 285,
    pickupSlot: "1:15 PM (Next Break)",
    status: "Pending",
    paymentStatus: "Paid (Campus Card)",
    paymentMethod: "Campus NFC Card",
    createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    prepRemainingMins: 15,
    qrCodeValue: "CAMPUSBITE:CB-8489:TOKEN:T-39:ANANYA",
    notes: ""
  },
  {
    id: "CB-8480",
    token: "T-30",
    studentName: "Devansh Patel",
    studentId: "CB-2023-772",
    department: "Information Tech",
    year: "4th Year",
    items: [
      { id: "item-10", name: "Midnight Cheesy Maggi Pot", quantity: 2, price: 85, image: "https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=900&q=80" }
    ],
    totalAmount: 170,
    pickupSlot: "11:00 AM",
    status: "Collected",
    paymentStatus: "Paid (Demo UPI)",
    paymentMethod: "Paytm Demo",
    createdAt: new Date(Date.now() - 95 * 60 * 1000).toISOString(),
    prepRemainingMins: 0,
    qrCodeValue: "CAMPUSBITE:CB-8480:TOKEN:T-30:DEVANSH",
    notes: ""
  }
];

