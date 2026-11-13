import React, { useState } from 'react';
import { 
  Flame, 
  Mail, 
  Hash, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  User,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login({ onNavigate, onLoginSuccess }) {
  const { loginWithEmail, loginWithRegisterNumber } = useAuth();

  // Login Mode: 'email' | 'registerNumber'
  const [loginMethod, setLoginMethod] = useState('email');

  // Form Fields
  const [email, setEmail] = useState('');
  const [registerNumber, setRegisterNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      let result;
      if (loginMethod === 'email') {
        result = await loginWithEmail({ email, password });
      } else {
        result = await loginWithRegisterNumber({ registerNumber, password });
      }

      if (result.success) {
        setSuccessMsg("Signed in successfully! Redirecting...");
        setTimeout(() => {
          if (onLoginSuccess) {
            onLoginSuccess(result.role);
          } else if (result.role === 'admin') {
            onNavigate('admin-dashboard');
          } else {
            onNavigate('home');
          }
        }, 700);
      } else {
        setErrorMsg(result.error || "Unable to sign in. Please verify your credentials.");
      }
    } catch (err) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to prefill demo credentials
  const fillDemoStudent = () => {
    setLoginMethod('email');
    setEmail('alex.rivera@campus.edu');
    setPassword('student123');
    setErrorMsg(null);
  };

  const fillDemoRegisterNumber = () => {
    setLoginMethod('registerNumber');
    setRegisterNumber('CB-2024-884');
    setPassword('student123');
    setErrorMsg(null);
  };

  const fillDemoAdmin = () => {
    setLoginMethod('email');
    setEmail('canteen.head@campus.edu');
    setPassword('admin123');
    setErrorMsg(null);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background ambient glowing orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-[#F59E0B]/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full bg-[#FF6B35]/10 blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        
        {/* Card Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF6B35] to-[#F59E0B] p-0.5 mx-auto mb-4 shadow-glow-primary">
            <div className="w-full h-full bg-[#090909] rounded-[14px] flex items-center justify-center">
              <Flame className="w-7 h-7 text-[#F59E0B]" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Welcome to Campus<span className="text-[#F59E0B]">Bite</span>
          </h1>
          <p className="text-sm text-[#A1A1AA] mt-1.5">
            Unified sign-in for students and canteen staff
          </p>
        </div>

        {/* Login Panel */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl">
          
          {/* Method Selector Tabs */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#141414] border border-white/10 mb-6">
            <button
              type="button"
              onClick={() => { setLoginMethod('email'); setErrorMsg(null); }}
              className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                loginMethod === 'email'
                  ? 'bg-[#F59E0B] text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>College Email</span>
            </button>

            <button
              type="button"
              onClick={() => { setLoginMethod('registerNumber'); setErrorMsg(null); }}
              className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                loginMethod === 'registerNumber'
                  ? 'bg-[#F59E0B] text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Hash className="w-3.5 h-3.5" />
              <span>Register Number</span>
            </button>
          </div>

          {/* Error & Success Feedback Banners */}
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-xs text-red-300 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 rounded-2xl bg-[#22C55E]/10 border border-[#22C55E]/30 flex items-start gap-3 text-xs text-emerald-300 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed font-semibold">{successMsg}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {loginMethod === 'email' ? (
              <div>
                <label className="text-zinc-300 font-semibold block mb-1.5">College Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    placeholder="student@campus.edu or staff@campus.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#141414] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#F59E0B] transition-colors"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="text-zinc-300 font-semibold block mb-1.5">College Register / Roll Number</label>
                <div className="relative">
                  <Hash className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. CB-2024-884"
                    value={registerNumber}
                    onChange={(e) => setRegisterNumber(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#141414] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#F59E0B] transition-colors uppercase font-mono"
                  />
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-zinc-300 font-semibold">Password</label>
                <button
                  type="button"
                  onClick={() => onNavigate('forgot-password')}
                  className="text-[11px] text-[#F59E0B] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#141414] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#F59E0B] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-900 text-[#F59E0B] focus:ring-[#F59E0B]"
              />
              <label htmlFor="remember" className="text-zinc-400 text-[11px] select-none cursor-pointer">
                Remember this device for seamless 3D ordering
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#F59E0B] to-[#FF6B35] text-black font-extrabold text-sm hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-glow-primary mt-2 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Bar */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-2 text-center">
              Quick Test Credentials
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={fillDemoStudent}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] font-semibold text-zinc-300 flex flex-col items-center gap-1 text-center transition-all"
              >
                <User className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>Student (Email)</span>
              </button>
              <button
                type="button"
                onClick={fillDemoRegisterNumber}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] font-semibold text-zinc-300 flex flex-col items-center gap-1 text-center transition-all"
              >
                <Hash className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>Student (Reg No)</span>
              </button>
              <button
                type="button"
                onClick={fillDemoAdmin}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] font-semibold text-zinc-300 flex flex-col items-center gap-1 text-center transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#FF6B35]" />
                <span>Canteen Admin</span>
              </button>
            </div>
          </div>

          {/* Don't have an account */}
          <div className="mt-5 text-center text-xs text-zinc-400">
            <span>New student at campus? </span>
            <button
              type="button"
              onClick={() => onNavigate('register')}
              className="text-[#F59E0B] font-bold hover:underline"
            >
              Create Account
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
