import React, { useState } from 'react';
import { User, CreditCard, Award, Clock, Settings, Save, ShieldCheck, Mail, Phone, MapPin, Sparkles, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';

export default function Profile({ onGoToOrders }) {
  const { studentProfile, updateStudentProfile, logout } = useAuth();
  const { orders } = useOrders();

  const [name, setName] = useState(studentProfile.name);
  const [department, setDepartment] = useState(studentProfile.department);
  const [year, setYear] = useState(studentProfile.year);
  const [phone, setPhone] = useState(studentProfile.phone);
  const [diet, setDiet] = useState(studentProfile.dietPreference || "Non-Vegetarian");
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    updateStudentProfile({
      name,
      department,
      year,
      phone,
      dietPreference: diet
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleTopup = (amt) => {
    updateStudentProfile({
      campusCardBalance: studentProfile.campusCardBalance + amt
    });
  };

  return (
    <div className="w-full bg-[#090909] text-white min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Profile Card Header */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 relative overflow-hidden flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <img
              src={studentProfile.avatar}
              alt={studentProfile.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-[#F59E0B] shadow-glow-primary"
            />
            <div className="absolute -bottom-2 -right-2 bg-[#22C55E] text-black text-[10px] font-black px-2 py-0.5 rounded-full border border-black">
              ACTIVE
            </div>
          </div>

          <div className="flex-1 text-center md:text-left space-y-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white">{studentProfile.name}</h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#F59E0B]/20 text-[#F59E0B] font-bold border border-[#F59E0B]/30">
                {studentProfile.collegeId}
              </span>
            </div>
            <p className="text-xs text-[#A1A1AA]">{studentProfile.department} • {studentProfile.year}</p>
            <p className="text-xs text-zinc-500">{studentProfile.email} • {studentProfile.hostelBlock}</p>
          </div>

          {/* Quick Balance Box */}
          <div className="bg-[#141414] p-4 rounded-2xl border border-white/10 text-center w-full md:w-auto min-w-[200px]">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">Campus Meal Balance</span>
            <div className="text-3xl font-black text-[#F59E0B] my-0.5">₹{studentProfile.campusCardBalance}</div>
            <div className="flex items-center justify-center gap-1.5 mt-2">
              <button
                onClick={() => handleTopup(200)}
                className="text-[10px] font-bold px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white"
              >
                +₹200
              </button>
              <button
                onClick={() => handleTopup(500)}
                className="text-[10px] font-bold px-2 py-1 rounded bg-[#F59E0B]/20 hover:bg-[#F59E0B]/30 text-[#F59E0B]"
              >
                +₹500
              </button>
            </div>
          </div>
        </div>

        {/* 2-Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Account Settings Form */}
          <div className="lg:col-span-7">
            <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-5">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-[#F59E0B]" />
                  <h3 className="font-bold text-white text-base">Student Details & Preferences</h3>
                </div>
                {savedNotice && (
                  <span className="text-xs font-bold text-[#22C55E]">Saved!</span>
                )}
              </div>

              <form onSubmit={handleSave} className="space-y-4 text-xs">
                <div>
                  <label className="text-zinc-400 block mb-1 font-medium">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-white/10 text-white focus:outline-none focus:border-[#F59E0B]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-zinc-400 block mb-1 font-medium">Department</label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-white/10 text-white focus:outline-none focus:border-[#F59E0B]"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1 font-medium">Academic Year</label>
                    <input
                      type="text"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-white/10 text-white focus:outline-none focus:border-[#F59E0B]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-zinc-400 block mb-1 font-medium">Contact Phone</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-white/10 text-white focus:outline-none focus:border-[#F59E0B]"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1 font-medium">Dietary Preference</label>
                    <select
                      value={diet}
                      onChange={(e) => setDiet(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-white/10 text-white focus:outline-none focus:border-[#F59E0B]"
                    >
                      <option value="Non-Vegetarian">Non-Vegetarian</option>
                      <option value="Pure Vegetarian">Pure Vegetarian</option>
                      <option value="Eggetarian">Eggetarian</option>
                      <option value="Vegan">Vegan</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#F59E0B] text-black font-extrabold flex items-center justify-center gap-2 hover:bg-[#FF6B35] transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>Update Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => logout()}
                  className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs flex items-center justify-center gap-2 transition-all border border-red-500/20"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out of Campus Account</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right: Loyalty Perks & Recent Orders Snapshot */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Campus Loyalty Box */}
            <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-[#F59E0B]">
                <Award className="w-5 h-5" />
                <h3 className="font-bold text-white text-base">CampusBite Perks</h3>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">{studentProfile.loyaltyPoints}</span>
                <span className="text-xs text-[#22C55E] font-bold">Reward Points Earned</span>
              </div>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                Earn 5 points for every ₹100 spent. Redeem points for free cold brews and dessert items!
              </p>
            </div>

            {/* Quick Order History Link */}
            <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Clock className="w-4 h-4 text-[#F59E0B]" />
                  <span>Order Activity</span>
                </div>
                <span className="text-xs text-[#F59E0B] font-bold">{orders.length} Orders</span>
              </div>

              <div className="space-y-2">
                {orders.slice(0, 3).map(o => (
                  <div key={o.id} className="flex items-center justify-between text-xs p-2 rounded-xl bg-[#141414] border border-white/5">
                    <div>
                      <span className="font-bold text-white block">{o.token} • {o.items[0]?.name}</span>
                      <span className="text-[10px] text-zinc-500">{new Date(o.createdAt).toLocaleDateString()}</span>
                    </div>
                    <span className="text-xs font-bold text-[#F59E0B]">₹{o.totalAmount}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={onGoToOrders}
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white transition-all text-center block"
              >
                View Full Timeline & QR Codes →
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

