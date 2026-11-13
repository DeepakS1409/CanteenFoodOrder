import React, { useState } from 'react';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Calendar, 
  Check, 
  X, 
  Search, 
  Edit3, 
  AlertCircle,
  Tag,
  Clock
} from 'lucide-react';
import { useOrders } from '../context/OrderContext';

export default function SpecialDateMenu() {
  const { 
    menuItems, 
    specialMenus, 
    saveSpecialDateMenu, 
    deleteSpecialDateMenu 
  } = useOrders();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDate, setEditingDate] = useState(null);

  // Form states
  const [targetDate, setTargetDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [menuTitle, setMenuTitle] = useState('');
  const [badgeText, setBadgeText] = useState('Fest Special');
  const [notes, setNotes] = useState('');
  const [selectedDishIds, setSelectedDishIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [feedback, setFeedback] = useState(null);

  const catalogMap = new Map(menuItems.map(item => [item.id, item]));

  const showNotification = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleOpenAdd = () => {
    setEditingDate(null);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setTargetDate(tomorrow.toISOString().split('T')[0]);
    setMenuTitle('Campus Cultural Fest Special');
    setBadgeText('Fest Special');
    setNotes('Special high-volume batch menu');
    setSelectedDishIds([]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dateStr, data) => {
    setEditingDate(dateStr);
    setTargetDate(dateStr);
    setMenuTitle(data.title || '');
    setBadgeText(data.badge || 'Special Menu');
    setNotes(data.notes || '');
    setSelectedDishIds(data.dishIds || []);
    setIsModalOpen(true);
  };

  const handleToggleSelectDish = (id) => {
    setSelectedDishIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!targetDate) return;
    if (selectedDishIds.length === 0) {
      alert('Please select at least 1 dish from the food catalog for this special menu.');
      return;
    }

    saveSpecialDateMenu(targetDate, {
      dishIds: selectedDishIds,
      title: menuTitle || 'Campus Canteen Special Menu',
      badge: badgeText || 'Special Menu',
      notes
    });

    setIsModalOpen(false);
    showNotification(`Special menu for ${targetDate} saved successfully!`);
  };

  const handleDelete = (dateStr) => {
    if (window.confirm(`Delete the special menu override scheduled for ${dateStr}?`)) {
      deleteSpecialDateMenu(dateStr);
      showNotification(`Deleted special menu for ${dateStr}`);
    }
  };

  const modalCatalogItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const specialEntries = Object.entries(specialMenus || {}).sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <div className="space-y-6 select-none">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6B35]/20 text-[#FF6B35] text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Priority Calendar Overrides</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Special Date Menu Overrides
          </h1>
          <p className="text-xs text-[#A1A1AA] mt-1 max-w-2xl leading-relaxed">
            Create custom dining menus for college festivals, sports days, or exam week specials. When a special menu is scheduled for a date, it automatically overrides the normal weekly schedule for that day only.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#F59E0B] text-black font-extrabold text-xs shadow-glow-secondary flex items-center gap-2 hover:opacity-95 self-start md:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Schedule Special Date Menu</span>
        </button>
      </div>

      {/* Floating feedback message */}
      {feedback && (
        <div className="p-3.5 rounded-xl text-xs font-bold bg-green-950/40 border border-green-500/40 text-green-300 flex items-center gap-2">
          <Check className="w-4 h-4 text-green-400" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Special Menus Cards List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#F59E0B]" />
          <span>Scheduled Special Date Menus ({specialEntries.length})</span>
        </h2>

        {specialEntries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {specialEntries.map(([dateStr, data]) => {
              const dishes = (data.dishIds || []).map(id => catalogMap.get(id)).filter(Boolean);
              const formattedDate = new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              });

              return (
                <div
                  key={dateStr}
                  className="glass-card p-5 rounded-2xl border border-white/10 hover:border-[#FF6B35]/40 transition-all flex flex-col justify-between space-y-4"
                >
                  <div>
                    {/* Header with Date & Badge */}
                    <div className="flex items-start justify-between gap-3 border-b border-white/5 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#FF6B35] bg-[#FF6B35]/15 px-2.5 py-0.5 rounded-full border border-[#FF6B35]/30">
                            {data.badge || 'Special Menu'}
                          </span>
                          <span className="text-xs text-zinc-400 font-mono">{dateStr}</span>
                        </div>
                        <h3 className="text-base font-bold text-white mt-1">{data.title}</h3>
                        <p className="text-xs text-zinc-400">{formattedDate}</p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(dateStr, data)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
                          title="Edit this special menu"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(dateStr)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-zinc-400 hover:text-red-400"
                          title="Delete special date schedule"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {data.notes && (
                      <p className="text-xs text-[#A1A1AA] italic my-2">
                        "{data.notes}"
                      </p>
                    )}

                    {/* Dishes thumbnails */}
                    <div className="mt-3">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                        {dishes.length} Override Dishes Scheduled:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {dishes.map(dish => (
                          <div key={dish.id} className="flex items-center gap-2 p-1.5 rounded-lg bg-[#141414] border border-white/5 text-xs">
                            <img src={dish.image} alt={dish.name} className="w-8 h-8 rounded-md object-cover" />
                            <span className="font-bold text-white truncate">{dish.name}</span>
                            <span className="ml-auto text-[11px] font-bold text-[#F59E0B]">₹{dish.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-500">
                    <span>Overrides weekly schedule on this day</span>
                    <span className="text-[#22C55E] font-semibold">Priority 1 Active</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-panel p-12 rounded-2xl text-center max-w-md mx-auto border border-white/10">
            <Sparkles className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
            <h3 className="text-base font-bold text-white">No Special Date Overrides Scheduled</h3>
            <p className="text-xs text-[#A1A1AA] mt-1">
              Currently, CampusBite is operating on the standard 7-day Weekly Menu Planner.
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-4 px-4 py-2 rounded-xl bg-[#FF6B35] text-white font-extrabold text-xs hover:opacity-90 inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Schedule a Fest or Holiday Special</span>
            </button>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL: ADD / EDIT SPECIAL DATE MENU                      */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-card max-w-2xl w-full p-6 rounded-3xl border border-white/20 shadow-2xl max-h-[90vh] flex flex-col">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div>
                <h3 className="text-lg font-black text-white">
                  {editingDate ? `Edit Special Menu (${editingDate})` : 'Schedule Special Date Menu Override'}
                </h3>
                <p className="text-xs text-[#A1A1AA]">
                  This custom menu will supersede the normal weekly schedule on the specified date.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 flex flex-col min-h-0 space-y-4 text-xs">
              
              {/* Target Date & Title inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-300 block mb-1 font-semibold">Special Event Date:</label>
                  <input
                    type="date"
                    required
                    value={targetDate}
                    disabled={!!editingDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#141414] border border-white/10 text-white focus:outline-none focus:border-[#FF6B35]"
                  />
                </div>
                <div>
                  <label className="text-zinc-300 block mb-1 font-semibold">Event Title / Fest Name:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cultural Fest Grand Feast"
                    value={menuTitle}
                    onChange={(e) => setMenuTitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#141414] border border-white/10 text-white focus:outline-none focus:border-[#FF6B35]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-300 block mb-1 font-semibold">Student Badge Label:</label>
                  <input
                    type="text"
                    placeholder="e.g. Fest Special, Chef Gala, Exam Refuel"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#141414] border border-white/10 text-white focus:outline-none focus:border-[#FF6B35]"
                  />
                </div>
                <div>
                  <label className="text-zinc-300 block mb-1 font-semibold">Staff Notes (Optional):</label>
                  <input
                    type="text"
                    placeholder="e.g. Higher quantity for sports day"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#141414] border border-white/10 text-white focus:outline-none focus:border-[#FF6B35]"
                  />
                </div>
              </div>

              {/* Select Food Items from Catalog */}
              <div className="flex-1 flex flex-col min-h-0 pt-2 border-t border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white">Select Dishes from Food Catalog:</span>
                  <span className="text-xs text-[#FF6B35] font-bold">
                    {selectedDishIds.length} Selected
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search catalog..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#141414] border border-white/10 text-xs text-white"
                    />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#141414] border border-white/10 text-xs text-white"
                  >
                    <option value="all">All Categories</option>
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Special Items">Special Items</option>
                  </select>
                </div>

                {/* Items listing */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[30vh]">
                  {modalCatalogItems.map(item => {
                    const isChecked = selectedDishIds.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleToggleSelectDish(item.id)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-[#FF6B35]/15 border-[#FF6B35]'
                            : 'bg-[#141414] border-white/5 hover:border-white/15'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            readOnly
                            className="w-4 h-4 accent-[#FF6B35]"
                          />
                          <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                          <div>
                            <span className="font-bold text-white block truncate">{item.name}</span>
                            <span className="text-[11px] text-zinc-400">{item.category} • ₹{item.price}</span>
                          </div>
                        </div>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          isChecked ? 'bg-[#FF6B35] text-white' : 'text-zinc-500'
                        }`}>
                          {isChecked ? 'Included' : 'Select'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom buttons */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#F59E0B] text-black font-extrabold shadow-glow-secondary hover:opacity-95"
                >
                  Save Special Date Menu Override
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
