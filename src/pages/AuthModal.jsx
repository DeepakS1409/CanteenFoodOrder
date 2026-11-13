import React, { useState } from 'react';
import { X, User, ShieldCheck, ArrowRight, Sparkles, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose, onNavigate }) {
  const { switchRole, role, loginWithEmail } = useAuth();
  const [activeTab, setActiveTab] = useState('student'); // 'student' | 'admin'

  if (!isOpen) return null;

  const handleQuickDemoLogin = async (targetRole) => {
    if (targetRole === 'admin') {
      await loginWithEmail({ email: 'canteen.head@campus.edu', password: 'admin123' });
      if (onNavigate) onNavigate('admin-dashboard');
    } else {
      await loginWithEmail({ email: 'alex.rivera@campus.edu', password: 'student123' });
      if (onNavigate) onNavigate('home');
    }
    onClose();
  };

  const goToRoute = (route) => {
    onClose();
    if (onNavigate) onNavigate(route);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
      <div className="glass-card max-w-md w-full p-6 sm:p-8 rounded-3xl border border-white/20 shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Title */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF6B35] to-[#F59E0B] p-0.5 mx-auto mb-3 shadow-glow-primary">
            <div className="w-full h-full bg-[#090909] rounded-[14px] flex items-center justify-center text-[#F59E0B]">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-white">CampusBite Portal</h2>
          <p className="text-xs text-[#A1A1AA] mt-1">Select an authentication option</p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => goToRoute('login')}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#F59E0B] to-[#FF6B35] text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-glow-primary hover:opacity-95 transition-all"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In (Email or Register No.)</span>
          </button>

          <button
            onClick={() => goToRoute('register')}
            className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <UserPlus className="w-4 h-4 text-[#F59E0B]" />
            <span>Register New Student Account</span>
          </button>
        </div>

        {/* Quick Demo Shortcuts */}
        <div className="mt-6 pt-5 border-t border-white/10">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-2 text-center">
            One-Click Demo Access
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('student')}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-zinc-200 flex items-center justify-center gap-1.5 transition-all"
            >
              <User className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Demo Student</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('admin')}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-zinc-200 flex items-center justify-center gap-1.5 transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#FF6B35]" />
              <span>Canteen Admin</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
