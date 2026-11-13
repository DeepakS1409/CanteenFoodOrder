# CampusBite 🍔

> Premium 3D College Canteen Ordering Platform

CampusBite is a dark-themed, 3D-driven food ordering platform designed for college campuses. It allows students to explore the live canteen menu with interactive 3D presentations, pre-order meals between lectures, pay via demo payment methods, and collect hot meals at canteen counters using digital QR tokens. The system includes a dedicated Canteen Kitchen Admin portal featuring an automated batch cooking summary.

---

## ✨ Features

- **Interactive 3D Food Showcase:** Full-screen presentation with Three.js ambient stage, dynamic lighting, floating particles, tilt parallax, and smooth transitions.
- **Dynamic Fly-to-Cart Animation:** Food thumbnails animate towards the cart icon upon addition.
- **Cinematic Food Packing Animation:** Custom checkout transition showing food packed into an eco-friendly takeaway bag with a QC seal.
- **Category Filtering & Search:** Quick filters across Breakfast, Lunch, Snacks, Beverages, and Special Items with Veg-only and availability toggles.
- **Checkout & Break Slots:** Select campus lecture break pickup slots and simulated payment options (UPI, Campus Meal Card, Counter Cash).
- **Digital Token & QR Code:** Generates unique order IDs, pickup tokens, and printable/scannable QR codes.
- **Live Order Timeline & Cancellation Policy:** Real-time 5-stage status tracker with cancellation locking once cooking begins.
- **Canteen Kitchen Admin Portal:**
  - Real-time order metrics and rush hour distribution charts.
  - **Batch Cooking Summary (KDS):** Aggregates confirmed orders by dish and applies a configurable safety buffer (+0% to +20%).
  - **Incoming Orders Feed:** Real-time status controls (Accept, Start Cooking, Mark Ready, Mark Collected).
  - **Menu Management:** Add, edit, set prices, and mark items as available or sold out.

---

## 🛠️ Tech Stack

- **React.js 18** + **Vite**
- **Three.js** (3D Ambient Stage & Particle Effects)
- **Tailwind CSS** (Custom Dark Theme Design System)
- **Framer Motion** (Smooth UI & Modal Animations)
- **GSAP** (Scroll & Transform Dynamics)
- **Lucide React** (Vector Icons)
- **Canvas Confetti** (Order Confirmation Celebration)

---

## 🚀 Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/DeepakS1409/CanteenFoodOrder.git
   cd CanteenFoodOrder
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.
