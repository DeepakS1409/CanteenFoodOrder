import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OrderProvider } from './context/OrderContext';
import { CartProvider } from './context/CartContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import FlyToCartOverlay from './components/FlyToCartOverlay';
import PackingAnimation from './components/PackingAnimation';
import PlasticPackingModal from './components/PlasticPackingModal';

// Student Pages
import Home from './pages/Home';
import Menu from './pages/Menu';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import MyOrders from './pages/MyOrders';
import Profile from './pages/Profile';
import AuthModal from './pages/AuthModal';

// Admin Pages
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/Dashboard';
import IncomingOrders from './admin/IncomingOrders';
import CookingSummary from './admin/CookingSummary';
import MenuManagement from './admin/MenuManagement';
import Analytics from './admin/Analytics';
import AdminSettings from './admin/Settings';

function MainAppContent() {
  const { role, switchRole } = useAuth();
  const [currentRoute, setCurrentRoute] = useState('home'); // home | menu | checkout | order-confirmation | my-orders | profile
  const [adminTab, setAdminTab] = useState('dashboard'); // dashboard | orders | cooking | menu | analytics | settings
  const [activeConfirmedOrderId, setActiveConfirmedOrderId] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Navigate helper
  const handleRouteChange = (newRoute) => {
    // If navigating to an admin route
    if (newRoute.startsWith('admin-')) {
      const tab = newRoute.replace('admin-', '');
      setAdminTab(tab);
      switchRole('admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Student routes
    setCurrentRoute(newRoute);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Called when student finishes checkout
  const handleOrderPlaced = (orderId) => {
    setActiveConfirmedOrderId(orderId);
    setCurrentRoute('order-confirmation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#090909] text-white flex flex-col font-sans selection:bg-[#F59E0B] selection:text-black">
      
      {/* Universal Floating Flying Food Animation Overlay */}
      <FlyToCartOverlay />

      {/* Signature Realistic 3D Plastic Carry Bag Packing Modal */}
      <PlasticPackingModal />

      {/* Special Takeaway Bag Packing Animation Overlay */}
      <PackingAnimation />

      {/* Slide-out Cart Drawer */}
      <CartDrawer 
        onProceedToCheckout={() => handleRouteChange('checkout')} 
      />

      {/* Auth / Role Switcher Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />

      {/* Render based on role: Student vs Canteen Admin */}
      {role === 'admin' ? (
        <AdminLayout
          activeTab={adminTab}
          onTabChange={(tab) => setAdminTab(tab)}
          onExitAdmin={() => handleRouteChange('home')}
        >
          {adminTab === 'dashboard' && <AdminDashboard onNavigateTab={(tab) => setAdminTab(tab)} />}
          {adminTab === 'orders' && <IncomingOrders />}
          {adminTab === 'cooking' && <CookingSummary />}
          {adminTab === 'menu' && <MenuManagement />}
          {adminTab === 'analytics' && <Analytics />}
          {adminTab === 'settings' && <AdminSettings />}
        </AdminLayout>
      ) : (
        <>
          <Navbar 
            currentRoute={currentRoute} 
            onRouteChange={handleRouteChange} 
          />

          <main className="flex-1">
            {currentRoute === 'home' && (
              <Home onRouteChange={handleRouteChange} />
            )}

            {currentRoute === 'menu' && (
              <Menu />
            )}

            {currentRoute === 'checkout' && (
              <Checkout
                onBackToMenu={() => handleRouteChange('menu')}
                onOrderPlaced={handleOrderPlaced}
              />
            )}

            {currentRoute === 'order-confirmation' && (
              <OrderConfirmation
                orderId={activeConfirmedOrderId}
                onGoToOrders={() => handleRouteChange('my-orders')}
                onGoHome={() => handleRouteChange('home')}
              />
            )}

            {currentRoute === 'my-orders' && (
              <MyOrders onExploreMenu={() => handleRouteChange('menu')} />
            )}

            {currentRoute === 'profile' && (
              <Profile onGoToOrders={() => handleRouteChange('my-orders')} />
            )}
          </main>

          <Footer onRouteChange={handleRouteChange} />
        </>
      )}

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <OrderProvider>
        <CartProvider>
          <MainAppContent />
        </CartProvider>
      </OrderProvider>
    </AuthProvider>
  );
}

