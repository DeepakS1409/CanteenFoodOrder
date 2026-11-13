import React, { useState } from 'react';
import { X, User, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const { switchRole, role } = useAuth();
  const [activeTab, setActiveTab] = useState('student'); // 'student' | 'admin'
  const [studentId, setStudentId] = useState('CB-2024-884');
  const [pin, setPin] = useState('••••');

  if (!isOpen) return null;

  const handleLogin = (e) => {
    e.preventDefault();
    switchRole(activeTab);
    onClose();
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
          <p className="text-xs text-[#A1A1AA] mt-1">Select your campus role to explore features</p>
        </div>

        {/* Role Switcher Pill */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#141414] border border-white/10 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('student')}
            className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'student'
                ? 'bg-[#F59E0B] text-black shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Student Login</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('admin')}
            className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'admin'
                ? 'bg-[#FF6B35] text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Canteen Staff</span>
          </button>
        </div>

        {/* Quick Demo Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="text-zinc-300 block mb-1 font-semibold">
              {activeTab === 'student' ? 'College Roll / Student ID' : 'Staff Admin ID'}
            </label>
            <input
              type="text"
              value={activeTab === 'student' ? studentId : 'STAFF-CANTEEN-01'}
              readOnly
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-white/10 text-white font-mono"
            />
          </div>

          <div>
            <label className="text-zinc-300 block mb-1 font-semibold">Campus PIN</label>
            <input
              type="password"
              value={pin}
              readOnly
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-white/10 text-white font-mono tracking-widest"
            />
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] text-zinc-400">
            {activeTab === 'student' ? (
              <span><strong>Sample Profile:</strong> Alex Rivera, CS Dept, 3rd Year. Meal Balance: ₹850.</span>
            ) : (
              <span><strong>Sample Profile:</strong> Chef Vikram Rao, Head of Canteen Operations & Kitchen Display.</span>
            )}
          </div>

          <button
            type="submit"
            className={`w-full py-3 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all ${
              activeTab === 'student'
                ? 'bg-[#F59E0B] text-black hover:bg-[#FF6B35] shadow-glow-primary'
                : 'bg-[#FF6B35] text-white hover:opacity-90 shadow-glow-secondary'
            }`}
          >
            <span>Continue as {activeTab === 'student' ? 'Student' : 'Staff Admin'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}

