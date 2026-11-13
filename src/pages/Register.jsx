import React, { useState } from 'react';
import { 
  Flame, 
  User, 
  Mail, 
  Hash, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register({ onNavigate, onRegisterSuccess }) {
  const { registerStudent } = useAuth();

  const [fullName, setFullName] = useState('');
  const [collegeEmail, setCollegeEmail] = useState('');
  const [registerNumber, setRegisterNumber] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engg');
  const [year, setYear] = useState('1st Year (Semester 1)');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validation
    if (!fullName.trim() || !collegeEmail.trim() || !registerNumber.trim() || !password) {
      setErrorMsg("All registration fields are mandatory.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(collegeEmail.trim())) {
      setErrorMsg("Please provide a valid college email address.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Password and Confirm Password do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await registerStudent({
        fullName,
        collegeEmail,
        registerNumber,
        department,
        year,
        password
      });

      if (result.success) {
        if (result.requiresEmailConfirmation) {
          setSuccessMsg("Account created! Please check your college email inbox to verify your email address.");
        } else {
          setSuccessMsg("Registration complete! Welcome to CampusBite.");
          setTimeout(() => {
            if (onRegisterSuccess) onRegisterSuccess('student');
            else onNavigate('home');
          }, 800);
        }
      } else {
        setErrorMsg(result.error || "Failed to create account.");
      }
    } catch (err) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/4 -right-20 w-96 h-96 rounded-full bg-[#F59E0B]/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-20 w-96 h-96 rounded-full bg-[#FF6B35]/10 blur-3xl pointer-events-none" />

      <div className="max-w-lg w-full relative z-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF6B35] to-[#F59E0B] p-0.5 mx-auto mb-4 shadow-glow-primary">
            <div className="w-full h-full bg-[#090909] rounded-[14px] flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-[#F59E0B]" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Create Student Account
          </h1>
          <p className="text-sm text-[#A1A1AA] mt-1.5">
            Register for automated canteen pre-orders and instant pickup tokens
          </p>
        </div>

        {/* Card */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl">
          
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

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Full Name */}
            <div>
              <label className="text-zinc-300 font-semibold block mb-1.5">Full Student Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Rivera"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#141414] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#F59E0B] transition-colors"
                />
              </div>
            </div>

            {/* Email & Register Number 2-column grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-zinc-300 font-semibold block mb-1.5">College Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    placeholder="student@campus.edu"
                    value={collegeEmail}
                    onChange={(e) => setCollegeEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#141414] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#F59E0B] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-300 font-semibold block mb-1.5">College Register No.</label>
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
            </div>

            {/* Department & Year */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-zinc-300 font-semibold block mb-1.5">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl bg-[#141414] border border-white/10 text-white focus:outline-none focus:border-[#F59E0B] transition-colors"
                >
                  <option value="Computer Science & Engg">Computer Science & Engg</option>
                  <option value="Electronics & Comm">Electronics & Comm</option>
                  <option value="Mechanical Engg">Mechanical Engg</option>
                  <option value="Civil & Architecture">Civil & Architecture</option>
                  <option value="Biotechnology">Biotechnology</option>
                  <option value="Management Studies">Management Studies</option>
                </select>
              </div>

              <div>
                <label className="text-zinc-300 font-semibold block mb-1.5">Academic Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl bg-[#141414] border border-white/10 text-white focus:outline-none focus:border-[#F59E0B] transition-colors"
                >
                  <option value="1st Year (Semester 1)">1st Year (Semester 1)</option>
                  <option value="2nd Year (Semester 3)">2nd Year (Semester 3)</option>
                  <option value="3rd Year (Semester 5)">3rd Year (Semester 5)</option>
                  <option value="4th Year (Semester 7)">4th Year (Semester 7)</option>
                  <option value="Postgraduate (PG)">Postgraduate (PG)</option>
                </select>
              </div>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-zinc-300 font-semibold block mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-9 py-3 rounded-xl bg-[#141414] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#F59E0B] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-zinc-500 hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-zinc-300 font-semibold block mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#141414] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#F59E0B] transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#F59E0B]/5 border border-[#F59E0B]/15 text-[11px] text-zinc-400 flex items-start gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#F59E0B] shrink-0 mt-0.5" />
              <span>Public registration securely creates a Student profile with ₹850 initial demo meal balance & 340 campus loyalty points.</span>
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
                  <span>Create Student Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Already registered */}
          <div className="mt-5 text-center text-xs text-zinc-400">
            <span>Already have an account? </span>
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="text-[#F59E0B] font-bold hover:underline"
            >
              Sign In
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
