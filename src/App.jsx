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

// Authentication Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Admin Pages
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/Dashboard';
import IncomingOrders from './admin/IncomingOrders';
import CookingSummary from './admin/CookingSummary';
import MenuManagement from './admin/MenuManagement';
import WeeklyMenuPlanner from './admin/WeeklyMenuPlanner';
import SpecialDateMenu from './admin/SpecialDateMenu';
import Analytics from './admin/Analytics';
import AdminSettings from './admin/Settings';

import { ShieldAlert, ArrowLeft, LogIn } from 'lucide-react';

function MainAppContent() {
  const { role, switchRole, isAuthenticated, isAdmin, isStudent } = useAuth();
  
  // Routes:
  // Student: 'home' | 'menu' | 'checkout' | 'order-confirmation' | 'my-orders' | 'profile'
  // Auth: 'login' | 'register' | 'forgot-password' | 'reset-password'
  // Admin: 'admin-dashboard' | 'admin-schedule' | 'admin-special-dates' | 'admin-orders' | 'admin-cooking' | 'admin-menu' | 'admin-analytics' | 'admin-settings'
  const [currentRoute, setCurrentRoute] = useState('home');
  const [adminTab, setAdminTab] = useState('dashboard');
  const [activeConfirmedOrderId, setActiveConfirmedOrderId] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingRoute, setPendingRoute] = useState(null);

  // Navigate helper with Role-based protection
  const handleRouteChange = (newRoute) => {
    // 1. Admin route access check
    if (newRoute.startsWith('admin-')) {
      const tab = newRoute.replace('admin-', '');
      setAdminTab(tab);

      // If user is not admin, block and show unauthorized
      if (!isAdmin) {
        setCurrentRoute('access-denied');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      switchRole('admin');
      setCurrentRoute(newRoute);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 2. Protected Student routes (Checkout, My Orders, Profile)
    const protectedStudentRoutes = ['checkout', 'my-orders', 'profile'];
    if (protectedStudentRoutes.includes(newRoute) && !isAuthenticated) {
      setPendingRoute(newRoute);
      setCurrentRoute('login');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Normal student & auth routes
    setCurrentRoute(newRoute);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Called when student finishes checkout
  const handleOrderPlaced = (orderId) => {
    setActiveConfirmedOrderId(orderId);
    setCurrentRoute('order-confirmation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Called when login succeeds
  const handleLoginSuccess = (userRole) => {
    if (userRole === 'admin') {
      switchRole('admin');
      setAdminTab('dashboard');
      setCurrentRoute('admin-dashboard');
    } else {
      switchRole('student');
      if (pendingRoute) {
        const dest = pendingRoute;
        setPendingRoute(null);
        setCurrentRoute(dest);
      } else {
        setCurrentRoute('home');
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If user is currently in Admin view
  const isViewingAdmin = role === 'admin' && isAdmin;

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

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        onNavigate={handleRouteChange}
      />

      {/* RENDER VIEW: Admin vs Student Portal */}
      {isViewingAdmin ? (
        <AdminLayout
          activeTab={adminTab}
          onTabChange={(tab) => setAdminTab(tab)}
          onExitAdmin={() => handleRouteChange('home')}
        >
          {adminTab === 'dashboard' && <AdminDashboard onNavigateTab={(tab) => setAdminTab(tab)} />}
          {adminTab === 'schedule' && <WeeklyMenuPlanner onPreviewStudentMenu={() => handleRouteChange('menu')} />}
          {adminTab === 'special-dates' && <SpecialDateMenu />}
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
            {/* Student Pages */}
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
                onNavigate={handleRouteChange}
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

            {/* Authentication Pages */}
            {currentRoute === 'login' && (
              <Login 
                onNavigate={handleRouteChange} 
                onLoginSuccess={handleLoginSuccess}
              />
            )}

            {currentRoute === 'register' && (
              <Register 
                onNavigate={handleRouteChange}
                onRegisterSuccess={handleLoginSuccess}
              />
            )}

            {currentRoute === 'forgot-password' && (
              <ForgotPassword onNavigate={handleRouteChange} />
            )}

            {currentRoute === 'reset-password' && (
              <ResetPassword onNavigate={handleRouteChange} />
            )}

            {/* Access Denied View for Unauthorized Admin Attempts */}
            {currentRoute === 'access-denied' && (
              <div className="max-w-xl mx-auto px-4 py-24 text-center">
                <div className="w-16 h-16 rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-5 text-red-400">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
                  Access Denied
                </h2>
                <p className="text-sm text-[#A1A1AA] mb-6 leading-relaxed">
                  The Canteen Operations Dashboard is strictly restricted to authorized canteen staff and administrators. Your current account does not have admin permissions.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => handleRouteChange('home')}
                    className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center gap-2 transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Return to Student Menu</span>
                  </button>
                  <button
                    onClick={() => handleRouteChange('login')}
                    className="px-5 py-2.5 rounded-xl bg-[#F59E0B] text-black font-extrabold text-xs flex items-center gap-2 transition-all hover:bg-[#FF6B35]"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign in with Staff Account</span>
                  </button>
                </div>
              </div>
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
