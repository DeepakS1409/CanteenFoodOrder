import React, { useState } from 'react';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ForgotPassword({ onNavigate }) {
  const { sendPasswordResetEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await sendPasswordResetEmail(email);
      if (res.success) {
        setIsSubmitted(true);
      } else {
        setErrorMsg(res.error || "Unable to send password reset email.");
      }
    } catch (err) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="max-w-md w-full relative z-10">
        
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF6B35] to-[#F59E0B] p-0.5 mx-auto mb-4 shadow-glow-primary">
            <div className="w-full h-full bg-[#090909] rounded-[14px] flex items-center justify-center">
              <KeyRound className="w-7 h-7 text-[#F59E0B]" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Reset Password
          </h1>
          <p className="text-sm text-[#A1A1AA] mt-1.5">
            Enter your college email address to receive reset instructions
          </p>
        </div>

        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl">
          {isSubmitted ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#22C55E]/20 text-[#22C55E] flex items-center justify-center mx-auto border border-[#22C55E]/40">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-white">Instructions Sent</h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                If an account exists for <strong className="text-white">{email}</strong>, you will receive a secure password reset link shortly.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-all mt-4"
              >
                Return to Login
              </button>
            </div>
          ) : (
            <>
              {errorMsg && (
                <div className="mb-5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-xs text-red-300">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div className="flex-1 leading-relaxed">{errorMsg}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="text-zinc-300 font-semibold block mb-1.5">Registered College Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      placeholder="student@campus.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#141414] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#F59E0B] transition-colors"
                    />
                  </div>
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
                      <span>Send Reset Link</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-5 text-center text-xs">
                <button
                  type="button"
                  onClick={() => onNavigate('login')}
                  className="text-zinc-400 hover:text-white inline-flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
