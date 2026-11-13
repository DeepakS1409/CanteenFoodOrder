import React, { useState } from 'react';
import { 
  Calendar, 
  Plus, 
  Trash2, 
  Copy, 
  Save, 
  RotateCcw, 
  Check, 
  X, 
  Search, 
  Filter, 
  Eye, 
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useOrders } from '../context/OrderContext';
import { WEEKDAYS } from '../services/menuScheduleService';

export default function WeeklyMenuPlanner({ onPreviewStudentMenu }) {
  const { 
    menuItems, 
    weeklySchedule, 
    updateDaySchedule, 
    saveFullWeeklySchedule, 
    copyDaySchedule, 
    clearDaySchedule, 
    resetSchedules 
  } = useOrders();

  const [activeDay, setActiveDay] = useState('monday');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [targetCopyDay, setTargetCopyDay] = useState('tuesday');
  const [feedback, setFeedback] = useState(null);

  // Add Food Modal States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDishIds, setSelectedDishIds] = useState([]);

  // Active day's scheduled dish IDs and resolved items
  const currentScheduledIds = weeklySchedule[activeDay] || [];
  const catalogMap = new Map(menuItems.map(item => [item.id, item]));
  const currentScheduledDishes = currentScheduledIds
    .map(id => catalogMap.get(id))
    .filter(Boolean);

  const showNotification = (msg, type = 'success') => {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback(null), 3000);
  };

  // Open Add Food modal
  const handleOpenAddModal = () => {
    setSelectedDishIds([]);
    setSearchQuery('');
    setSelectedCategory('all');
    setIsAddModalOpen(true);
  };

  // Toggle dish selection in modal
  const handleToggleDishSelect = (id) => {
    // If already in the active day's schedule, ignore
    if (currentScheduledIds.includes(id)) return;

    setSelectedDishIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Confirm adding selected dishes to active day
  const handleConfirmAdd = () => {
    const updatedIds = Array.from(new Set([...currentScheduledIds, ...selectedDishIds]));
    updateDaySchedule(activeDay, updatedIds);
    setIsAddModalOpen(false);
    showNotification(`Added ${selectedDishIds.length} dish(es) to ${WEEKDAYS.find(w => w.key === activeDay)?.label}`);
    setSelectedDishIds([]);
  };

  // Remove dish from active day
  const handleRemoveDish = (dishId) => {
    const updatedIds = currentScheduledIds.filter(id => id !== dishId);
    updateDaySchedule(activeDay, updatedIds);
    showNotification('Dish removed from schedule');
  };

  // Copy active day to target day
  const handleCopyDay = (e) => {
    e.preventDefault();
    copyDaySchedule(activeDay, targetCopyDay);
    setIsCopyModalOpen(false);
    const sourceLabel = WEEKDAYS.find(w => w.key === activeDay)?.label;
    const targetLabel = WEEKDAYS.find(w => w.key === targetCopyDay)?.label;
    showNotification(`Copied ${sourceLabel} schedule to ${targetLabel}`);
  };

  // Clear active day's schedule
  const handleClearDay = () => {
    if (window.confirm(`Clear all dishes scheduled for ${WEEKDAYS.find(w => w.key === activeDay)?.label}?`)) {
      clearDaySchedule(activeDay);
      showNotification('Day schedule cleared', 'info');
    }
  };

  // Save weekly schedule confirmation
  const handleSaveSchedule = () => {
    saveFullWeeklySchedule(weeklySchedule);
    showNotification('Weekly Menu Schedule saved successfully to local storage!');
  };

  // Reset to default schedule
  const handleReset = () => {
    if (window.confirm('Reset the weekly schedule to CampusBite standard defaults?')) {
      resetSchedules();
      showNotification('Schedule reset to default menu');
    }
  };

  // Filter catalog items inside Add Food modal
  const modalCatalogItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 select-none">
      
      {/* Top Header & Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F59E0B]/20 text-[#F59E0B] text-xs font-bold uppercase tracking-wider mb-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>Automated Day-wise Menu Scheduler</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Weekly Menu Planner
          </h1>
          <p className="text-xs text-[#A1A1AA] mt-1 max-w-2xl leading-relaxed">
            Configure which dishes from the food catalog are scheduled for each day of the week. The student frontend automatically switches its menu based on the current local day.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSaveSchedule}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#F59E0B] to-[#FF6B35] text-black font-extrabold text-xs shadow-glow-primary flex items-center gap-2 hover:opacity-95"
          >
            <Save className="w-4 h-4" />
            <span>Save Weekly Schedule</span>
          </button>

          <button
            onClick={onPreviewStudentMenu}
            className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs border border-white/10 flex items-center gap-1.5 transition-all"
            title="Preview how students see today's menu"
          >
            <Eye className="w-4 h-4 text-[#F59E0B]" />
            <span>Preview Student Menu</span>
          </button>

          <button
            onClick={handleReset}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/10 transition-all"
            title="Reset to Default Schedule"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Feedback Notification */}
      {feedback && (
        <div className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2.5 border transition-all ${
          feedback.type === 'success' 
            ? 'bg-green-950/40 border-green-500/40 text-green-300' 
            : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
        }`}>
          <Check className="w-4 h-4 text-green-400 shrink-0" />
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* Day Selector Pills (Monday to Sunday) */}
      <div className="glass-card p-3 rounded-2xl border border-white/10">
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {WEEKDAYS.map(day => {
            const count = (weeklySchedule[day.key] || []).length;
            const isSelected = activeDay === day.key;

            return (
              <button
                key={day.key}
                onClick={() => setActiveDay(day.key)}
                className={`py-3 px-2 rounded-xl text-center transition-all flex flex-col items-center justify-center border ${
                  isSelected
                    ? 'bg-gradient-to-b from-[#F59E0B]/20 to-[#FF6B35]/20 border-[#F59E0B] shadow-glow-primary scale-102'
                    : 'bg-[#141414] border-white/5 text-zinc-400 hover:text-white hover:border-white/15'
                }`}
              >
                <span className={`text-xs font-black uppercase tracking-wider ${
                  isSelected ? 'text-[#F59E0B]' : 'text-zinc-300'
                }`}>
                  {day.label}
                </span>
                <span className={`text-[11px] font-semibold mt-1 px-2 py-0.5 rounded-full ${
                  isSelected 
                    ? 'bg-[#F59E0B] text-black font-extrabold' 
                    : count > 0 
                      ? 'bg-white/10 text-zinc-300' 
                      : 'bg-red-500/10 text-red-400'
                }`}>
                  {count} {count === 1 ? 'Dish' : 'Dishes'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Day Schedule Card */}
      <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-6">
        
        {/* Active Day Header & Utility Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/20 flex items-center justify-center text-[#F59E0B] font-black text-lg">
              {WEEKDAYS.find(w => w.key === activeDay)?.short}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white capitalize">
                {WEEKDAYS.find(w => w.key === activeDay)?.label}'s Scheduled Menu
              </h2>
              <span className="text-xs text-zinc-400">
                {currentScheduledDishes.length} items active for automatic rotation
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAddModal}
              className="px-3.5 py-2 rounded-xl bg-[#F59E0B] text-black font-extrabold text-xs flex items-center gap-1.5 hover:bg-[#FF6B35] transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Add Food</span>
            </button>

            <button
              onClick={() => setIsCopyModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-zinc-300 hover:text-white border border-white/10 flex items-center gap-1.5 transition-all"
            >
              <Copy className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Copy to Day...</span>
            </button>

            {currentScheduledDishes.length > 0 && (
              <button
                onClick={handleClearDay}
                className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-xs font-bold text-red-400 border border-red-500/20 flex items-center gap-1.5 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Scheduled Dishes Grid for the Selected Day */}
        {currentScheduledDishes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentScheduledDishes.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-[#141414] border border-white/5 hover:border-white/15 transition-all flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 rounded-xl object-cover border border-white/10 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${item.isVeg ? 'bg-green-400' : 'bg-red-400'}`} />
                      <h4 className="text-sm font-bold text-white truncate">{item.name}</h4>
                    </div>
                    <span className="text-[11px] text-[#F59E0B] font-semibold block">{item.category}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-black text-white">₹{item.price}</span>
                      <span className="text-[10px] text-zinc-500">{item.prepTime}</span>
                    </div>
                  </div>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => handleRemoveDish(item.id)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors"
                  title="Remove from this day's schedule"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-4 rounded-xl border border-dashed border-white/10">
            <Calendar className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
            <h3 className="text-base font-bold text-white">No dishes scheduled for this day</h3>
            <p className="text-xs text-[#A1A1AA] mt-1 max-w-sm mx-auto">
              Click "Add Food" to select dishes from the food catalog, or copy the schedule from another weekday.
            </p>
            <button
              onClick={handleOpenAddModal}
              className="mt-4 px-4 py-2 rounded-xl bg-[#F59E0B] text-black font-extrabold text-xs hover:bg-[#FF6B35] transition-all inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Add Dishes to Schedule</span>
            </button>
          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* MODAL 1: ADD FOOD TO DAY (SELECT FROM FOOD CATALOG)     */}
      {/* ======================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-card max-w-3xl w-full p-6 rounded-3xl border border-white/20 shadow-2xl max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div>
                <h3 className="text-lg font-black text-white">
                  Add Dishes to {WEEKDAYS.find(w => w.key === activeDay)?.label}'s Schedule
                </h3>
                <p className="text-xs text-[#A1A1AA]">
                  Select dishes already available in the catalog. Referenced by ID to avoid duplicates.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search & Category Filter Toolbar */}
            <div className="space-y-3 mb-4">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative w-full sm:flex-1">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search catalog by dish name, ingredients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#141414] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#F59E0B]"
                  />
                </div>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-[#141414] border border-white/10 text-xs text-white focus:outline-none focus:border-[#F59E0B]"
                >
                  <option value="all">All Categories</option>
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Beverages">Beverages</option>
                  <option value="Special Items">Special Items</option>
                </select>
              </div>
            </div>

            {/* Catalog Grid with Multi-select Checkboxes */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 max-h-[50vh]">
              {modalCatalogItems.map(item => {
                const isAlreadyScheduled = currentScheduledIds.includes(item.id);
                const isChecked = selectedDishIds.includes(item.id);

                return (
                  <div
                    key={item.id}
                    onClick={() => handleToggleDishSelect(item.id)}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all cursor-pointer ${
                      isAlreadyScheduled
                        ? 'bg-[#141414]/50 border-white/5 opacity-50 cursor-not-allowed'
                        : isChecked
                          ? 'bg-[#F59E0B]/15 border-[#F59E0B] shadow-glow-primary'
                          : 'bg-[#141414] border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={isAlreadyScheduled || isChecked}
                        disabled={isAlreadyScheduled}
                        readOnly
                        className="w-4 h-4 accent-[#F59E0B] rounded cursor-pointer"
                      />

                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded-xl object-cover shrink-0"
                      />

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white truncate">{item.name}</h4>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                            item.isVeg ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                          }`}>
                            {item.isVeg ? 'Veg' : 'Non-Veg'}
                          </span>
                        </div>
                        <span className="text-[11px] text-zinc-400">{item.category} • ₹{item.price}</span>
                      </div>
                    </div>

                    <div>
                      {isAlreadyScheduled ? (
                        <span className="text-[10px] font-bold text-zinc-500 px-2.5 py-1 rounded bg-white/5">
                          Already on Menu
                        </span>
                      ) : isChecked ? (
                        <span className="text-[10px] font-black text-[#F59E0B] bg-[#F59E0B]/20 px-2.5 py-1 rounded">
                          Selected
                        </span>
                      ) : (
                        <span className="text-[10px] text-zinc-400 px-2 py-1">Click to select</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Bottom Actions with Counter Badge */}
            <div className="pt-4 border-t border-white/10 mt-4 flex items-center justify-between">
              <div className="text-xs text-zinc-400">
                <span>Selected: </span>
                <strong className="text-white font-bold">{selectedDishIds.length}</strong> items
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleConfirmAdd}
                  disabled={selectedDishIds.length === 0}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#F59E0B] to-[#FF6B35] text-black font-extrabold text-xs shadow-glow-primary hover:opacity-95 disabled:opacity-40 transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Add Selected Foods ({selectedDishIds.length})</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: COPY DAY MENU TO ANOTHER DAY                   */}
      {/* ======================================================== */}
      {isCopyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-card max-w-md w-full p-6 rounded-2xl border border-white/20 shadow-2xl">
            <h3 className="text-lg font-black text-white mb-1">
              Copy {WEEKDAYS.find(w => w.key === activeDay)?.label}'s Menu
            </h3>
            <p className="text-xs text-[#A1A1AA] mb-4">
              Duplicate the {currentScheduledDishes.length} dishes from {WEEKDAYS.find(w => w.key === activeDay)?.label} to another day of the week.
            </p>

            <form onSubmit={handleCopyDay} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                  Select Target Weekday:
                </label>
                <select
                  value={targetCopyDay}
                  onChange={(e) => setTargetCopyDay(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-white/10 text-xs text-white focus:outline-none focus:border-[#F59E0B]"
                >
                  {WEEKDAYS.filter(w => w.key !== activeDay).map(day => (
                    <option key={day.key} value={day.key}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCopyModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#F59E0B] text-black font-extrabold text-xs shadow-glow-primary hover:bg-[#FF6B35] transition-all"
                >
                  Confirm Copy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
