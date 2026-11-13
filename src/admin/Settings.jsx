import React, { useState } from 'react';
import { Settings, Shield, Bell, Clock, Printer, CheckCircle, Save } from 'lucide-react';

export default function AdminSettings() {
  const [canteenStatus, setCanteenStatus] = useState('open');
  const [autoAccept, setAutoAccept] = useState(false);
  const [audioChime, setAudioChime] = useState(true);
  const [counterStaff, setCounterStaff] = useState('Chef Vikram Rao (Counter 1 & 2)');
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Kitchen & Canteen Settings
        </h1>
        <p className="text-xs text-[#A1A1AA] mt-1">
          Operational controls for the college kitchen, counter assignment, and ticket printers.
        </p>
      </div>

      <form onSubmit={handleSave} className="glass-card p-6 rounded-2xl border border-white/10 space-y-6 text-xs">
        {/* Canteen Status Toggle */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div>
            <span className="font-bold text-white text-sm block">Canteen Ordering Status</span>
            <span className="text-zinc-400">Accepting pre-orders from college students</span>
          </div>
          <div className="flex items-center gap-2 bg-[#141414] p-1 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => setCanteenStatus('open')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs ${
                canteenStatus === 'open' ? 'bg-[#22C55E] text-black shadow-sm' : 'text-zinc-400'
              }`}
            >
              Open for Orders
            </button>
            <button
              type="button"
              onClick={() => setCanteenStatus('closed')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs ${
                canteenStatus === 'closed' ? 'bg-red-500 text-white shadow-sm' : 'text-zinc-400'
              }`}
            >
              Kitchen Closed
            </button>
          </div>
        </div>

        {/* Automated Acceptance Toggle */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div>
            <span className="font-bold text-white text-sm block">Auto-Accept Incoming Orders</span>
            <span className="text-zinc-400">Automatically move incoming paid orders directly to Accepted status</span>
          </div>
          <input
            type="checkbox"
            checked={autoAccept}
            onChange={(e) => setAutoAccept(e.target.checked)}
            className="w-5 h-5 accent-[#F59E0B] cursor-pointer"
          />
        </div>

        {/* Audio Alerts */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div>
            <span className="font-bold text-white text-sm block">Kitchen Ticket Audio Chime</span>
            <span className="text-zinc-400">Play chime when a student submits a new order</span>
          </div>
          <input
            type="checkbox"
            checked={audioChime}
            onChange={(e) => setAudioChime(e.target.checked)}
            className="w-5 h-5 accent-[#F59E0B] cursor-pointer"
          />
        </div>

        {/* Active Counter Staff */}
        <div>
          <label className="font-bold text-white block mb-1">Assigned Counter Staff on Duty</label>
          <input
            type="text"
            value={counterStaff}
            onChange={(e) => setCounterStaff(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-white/10 text-white"
          />
        </div>

        <div className="pt-2 flex items-center justify-between">
          {saved && <span className="text-xs font-bold text-[#22C55E]">Settings updated!</span>}
          <button
            type="submit"
            className="ml-auto px-5 py-2.5 rounded-xl bg-[#F59E0B] text-black font-extrabold flex items-center gap-2 hover:bg-[#FF6B35] transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Kitchen Configurations</span>
          </button>
        </div>
      </form>
    </div>
  );
}

