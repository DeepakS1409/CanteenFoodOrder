import React, { useState } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Image as ImageIcon, 
  DollarSign, 
  Flame, 
  Clock, 
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  Sparkles
} from 'lucide-react';
import { useOrders } from '../context/OrderContext';

export default function MenuManagement() {
  const { 
    menuItems, 
    addMenuItem, 
    updateMenuItem, 
    toggleItemAvailability, 
    deleteMenuItem 
  } = useOrders();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Snacks');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [prepTime, setPrepTime] = useState('8-10 mins');
  const [calories, setCalories] = useState('450 kcal');
  const [isVeg, setIsVeg] = useState(true);
  const [badge, setBadge] = useState('Canteen Fresh');
  const [description, setDescription] = useState('');
  const [stock, setStock] = useState('35');
  const [imageUrl, setImageUrl] = useState('');

  const resetForm = () => {
    setName('');
    setCategory('Snacks');
    setPrice('');
    setOriginalPrice('');
    setPrepTime('8-10 mins');
    setCalories('450 kcal');
    setIsVeg(true);
    setBadge('Canteen Fresh');
    setDescription('');
    setStock('35');
    setImageUrl('');
    setEditingItem(null);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setName(item.name);
    setCategory(item.category);
    setPrice(item.price);
    setOriginalPrice(item.originalPrice || '');
    setPrepTime(item.prepTime);
    setCalories(item.calories);
    setIsVeg(item.isVeg);
    setBadge(item.badge || '');
    setDescription(item.description);
    setStock(item.stock || 25);
    setImageUrl(item.image);
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = {
      name,
      shortName: name.split(' ').slice(0, 2).join(' '),
      tagline: `${isVeg ? 'Vegetarian' : 'Chef Special'} • Fresh Canteen Batch`,
      category,
      price: parseFloat(price) || 100,
      originalPrice: originalPrice ? parseFloat(originalPrice) : parseFloat(price) + 30,
      prepTime,
      calories,
      isVeg,
      badge,
      description: description || "Freshly prepared in our campus kitchen with premium ingredients.",
      stock: parseInt(stock, 10) || 30,
      image: imageUrl || "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80",
      themeColor: isVeg ? "#22C55E" : "#F59E0B"
    };

    if (editingItem) {
      updateMenuItem(editingItem.id, data);
    } else {
      addMenuItem(data);
    }

    setIsAddModalOpen(false);
    resetForm();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Canteen Menu Management
          </h1>
          <p className="text-xs text-[#A1A1AA] mt-1">
            Control food availability, adjust live prices, toggle sold out statuses, and add new recipes.
          </p>
        </div>

        <button
          onClick={() => { resetForm(); setIsAddModalOpen(true); }}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#F59E0B] text-black font-extrabold text-xs shadow-glow-secondary flex items-center gap-2 hover:opacity-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add New Food Item</span>
        </button>
      </div>

      {/* Menu Catalog Table / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {menuItems.map(item => (
          <div
            key={item.id}
            className={`glass-card p-4 rounded-2xl border transition-all flex flex-col justify-between ${
              item.available ? 'border-white/10' : 'border-red-500/30 opacity-75 bg-red-950/10'
            }`}
          >
            <div>
              {/* Item Header & Image */}
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 rounded-xl object-cover border border-white/10 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${item.isVeg ? 'bg-green-400' : 'bg-red-400'}`} />
                    <h3 className="font-bold text-white text-sm truncate">{item.name}</h3>
                  </div>
                  <span className="text-xs text-[#F59E0B] font-semibold block">{item.category}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-black text-white">₹{item.price}</span>
                    <span className="text-[10px] text-zinc-500 line-through">₹{item.originalPrice}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-[#A1A1AA] line-clamp-2 mb-3">
                {item.description}
              </p>

              {/* Quick details */}
              <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#141414] p-2 rounded-xl mb-3 border border-white/5">
                <div>
                  <span className="text-zinc-500 block">Prep Time</span>
                  <span className="font-bold text-zinc-300">{item.prepTime}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Current Stock</span>
                  <span className="font-bold text-zinc-300">{item.stock} left</span>
                </div>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
              {/* Availability Toggle */}
              <button
                onClick={() => toggleItemAvailability(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  item.available
                    ? 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${item.available ? 'bg-[#22C55E]' : 'bg-red-500'}`} />
                <span>{item.available ? 'Available' : 'Marked Sold Out'}</span>
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white"
                  title="Edit Food Details"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteMenuItem(item.id)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-zinc-400 hover:text-red-400"
                  title="Delete Item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-card max-w-xl w-full p-6 rounded-2xl border border-white/20 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <h3 className="font-black text-lg text-white">
                {editingItem ? 'Edit Food Item' : 'Add New Item to Canteen Menu'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-zinc-300 block mb-1 font-semibold">Dish Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Crispy Paneer Tikka Wrap"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-white/10 text-white focus:outline-none focus:border-[#F59E0B]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-zinc-300 block mb-1 font-semibold">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-white/10 text-white focus:outline-none focus:border-[#F59E0B]"
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Special Items">Special Items</option>
                  </select>
                </div>
                <div>
                  <label className="text-zinc-300 block mb-1 font-semibold">Diet Type</label>
                  <select
                    value={isVeg ? 'veg' : 'non-veg'}
                    onChange={(e) => setIsVeg(e.target.value === 'veg')}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-white/10 text-white focus:outline-none focus:border-[#F59E0B]"
                  >
                    <option value="veg">Pure Vegetarian (Green Dot)</option>
                    <option value="non-veg">Non-Vegetarian (Red Dot)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-zinc-300 block mb-1 font-semibold">Canteen Price (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="150"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-white/10 text-white focus:outline-none focus:border-[#F59E0B]"
                  />
                </div>
                <div>
                  <label className="text-zinc-300 block mb-1 font-semibold">Original Price (Strikeout ₹)</label>
                  <input
                    type="number"
                    placeholder="180"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-white/10 text-white focus:outline-none focus:border-[#F59E0B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-zinc-300 block mb-1 font-semibold">Prep Time</label>
                  <input
                    type="text"
                    value={prepTime}
                    onChange={(e) => setPrepTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#141414] border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="text-zinc-300 block mb-1 font-semibold">Calories</label>
                  <input
                    type="text"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#141414] border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="text-zinc-300 block mb-1 font-semibold">Daily Stock</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#141414] border border-white/10 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-300 block mb-1 font-semibold">Food Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-white/10 text-white"
                />
              </div>

              <div>
                <label className="text-zinc-300 block mb-1 font-semibold">Description</label>
                <textarea
                  rows="2"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-white/10 text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#F59E0B] text-black font-extrabold shadow-glow-secondary"
                >
                  {editingItem ? 'Save Changes' : 'Add to Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

