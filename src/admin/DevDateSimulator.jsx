import React from 'react';
import { Calendar, Clock, RotateCcw, Sparkles } from 'lucide-react';
import { useOrders } from '../context/OrderContext';
import { WEEKDAYS } from '../services/menuScheduleService';

export default function DevDateSimulator() {
  const { simulatedDate, setSimulatedDate, effectiveMenu } = useOrders();

  const handleSelectPreset = (e) => {
    const val = e.target.value;
    if (val === 'real') {
      setSimulatedDate(null);
    } else {
      setSimulatedDate(val);
    }
  };

  const isSimulating = Boolean(simulatedDate);

  return (
    <div className="flex items-center gap-2 p-1.5 px-3 rounded-xl bg-[#1B1B1B] border border-amber-500/30 text-xs shadow-inner">
      <div className="flex items-center gap-1.5 text-[#F59E0B]">
        <Clock className="w-3.5 h-3.5 animate-spin-slow" />
        <span className="font-extrabold uppercase text-[10px] tracking-wider hidden sm:inline">
          Dev Date Simulator:
        </span>
      </div>

      <select
        value={simulatedDate || 'real'}
        onChange={handleSelectPreset}
        className="bg-[#090909] text-white border border-white/10 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:border-[#F59E0B] cursor-pointer"
      >
        <option value="real">Real System Date (Live)</option>
        <optgroup label="Simulate Weekdays">
          {WEEKDAYS.map(w => (
            <option key={w.key} value={w.key}>
              Simulate {w.label} Menu
            </option>
          ))}
        </optgroup>
        <optgroup label="Simulate Special Override Dates">
          <option value="2026-11-16">2026-11-16 (Cultural Fest Override)</option>
        </optgroup>
      </select>

      {/* Active Indicator Badge */}
      {isSimulating ? (
        <div className="flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-md text-[10px] font-bold">
          <span>Viewing: {effectiveMenu.dayName}</span>
          {effectiveMenu.isSpecialOverride && (
            <span className="bg-[#FF6B35] text-black px-1 rounded font-black">FEST</span>
          )}
          <button
            onClick={() => setSimulatedDate(null)}
            className="hover:text-white ml-0.5"
            title="Reset to Real Today"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <span className="text-[10px] text-[#22C55E] font-medium hidden md:inline">
          ● Live: {effectiveMenu.dayName}
        </span>
      )}
    </div>
  );
}
