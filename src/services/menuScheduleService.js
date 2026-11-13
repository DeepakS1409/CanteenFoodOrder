import { initialMenuItems } from '../data/sampleMenu';

const STORAGE_KEY_CATALOG = 'cb_menu_items';
const STORAGE_KEY_WEEKLY_SCHEDULE = 'cb_weekly_menu_schedule';
const STORAGE_KEY_SPECIAL_MENUS = 'cb_special_date_menus';

/**
 * Default Weekly Canteen Schedule (Referencing dish IDs from the food catalog)
 * Based on realistic college canteen rotation:
 * - Monday: Dosa, Idli, Pongal, Juice, Maggi
 * - Tuesday: Poori, Upma/Chapati, Fried Rice, Thick Shake
 * - Wednesday: Idli, Poori, Pongal, Truffle Fries, Maggi
 * - Thursday: Dosa, Chapati, Poori, Smash Burger, Juice
 * - Friday: Pongal, Idli, Paneer Meal Box, Chicken Dum Biryani, Peri-Peri Sub
 * - Saturday: Dosa, Poori, Smash Burger, Truffle Fries, Thick Shake
 * - Sunday: Chef's Weekend Special (Biryani, Burger, Paneer, Maggi, Shake)
 */
export const DEFAULT_WEEKLY_SCHEDULE = {
  monday: ["item-4", "item-9", "item-11", "item-6", "item-10"],
  tuesday: ["item-12", "item-14", "item-2", "item-7", "item-5"],
  wednesday: ["item-9", "item-12", "item-11", "item-5", "item-10"],
  thursday: ["item-4", "item-14", "item-12", "item-1", "item-6"],
  friday: ["item-11", "item-9", "item-8", "item-13", "item-3", "item-6"],
  saturday: ["item-4", "item-12", "item-1", "item-5", "item-7"],
  sunday: ["item-13", "item-1", "item-8", "item-10", "item-6", "item-7"]
};

/**
 * Default Special Date Override Schedules
 */
export const DEFAULT_SPECIAL_MENUS = {
  "2026-11-16": {
    dishIds: ["item-13", "item-8", "item-1", "item-7", "item-6"],
    title: "Campus Cultural Fest Grand Feast",
    badge: "Fest Special",
    notes: "Special high-volume fest batch menu approved by Dean of Student Affairs"
  }
};

export const WEEKDAYS = [
  { key: "monday", label: "Monday", short: "Mon" },
  { key: "tuesday", label: "Tuesday", short: "Tue" },
  { key: "wednesday", label: "Wednesday", short: "Wed" },
  { key: "thursday", label: "Thursday", short: "Thu" },
  { key: "friday", label: "Friday", short: "Fri" },
  { key: "saturday", label: "Saturday", short: "Sat" },
  { key: "sunday", label: "Sunday", short: "Sun" },
];

/**
 * Data Access Layer (Ready for Supabase/REST backend replacement)
 */
export const menuScheduleService = {
  // 1. Fetch Food Catalog
  getCatalog() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CATALOG);
      return saved ? JSON.parse(saved) : initialMenuItems;
    } catch (e) {
      return initialMenuItems;
    }
  },

  // 2. Fetch Weekly Schedule
  getWeeklySchedule() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_WEEKLY_SCHEDULE);
      return saved ? JSON.parse(saved) : DEFAULT_WEEKLY_SCHEDULE;
    } catch (e) {
      return DEFAULT_WEEKLY_SCHEDULE;
    }
  },

  // 3. Save Weekly Schedule
  saveWeeklySchedule(schedule) {
    try {
      localStorage.setItem(STORAGE_KEY_WEEKLY_SCHEDULE, JSON.stringify(schedule));
      return { success: true, schedule };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  // 4. Fetch Special Date Menus
  getSpecialDateSchedules() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SPECIAL_MENUS);
      return saved ? JSON.parse(saved) : DEFAULT_SPECIAL_MENUS;
    } catch (e) {
      return DEFAULT_SPECIAL_MENUS;
    }
  },

  // 5. Save or Update Special Date Menu
  saveSpecialDateSchedule(dateStr, data) {
    try {
      const current = this.getSpecialDateSchedules();
      const updated = {
        ...current,
        [dateStr]: {
          dishIds: data.dishIds || [],
          title: data.title || "Campus Canteen Special Menu",
          badge: data.badge || "Special Menu",
          notes: data.notes || ""
        }
      };
      localStorage.setItem(STORAGE_KEY_SPECIAL_MENUS, JSON.stringify(updated));
      return { success: true, specialMenus: updated };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  // 6. Delete Special Date Menu
  deleteSpecialDateSchedule(dateStr) {
    try {
      const current = this.getSpecialDateSchedules();
      const updated = { ...current };
      delete updated[dateStr];
      localStorage.setItem(STORAGE_KEY_SPECIAL_MENUS, JSON.stringify(updated));
      return { success: true, specialMenus: updated };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  // 7. Reset Schedule to Factory Defaults
  resetScheduleToDefault() {
    try {
      localStorage.setItem(STORAGE_KEY_WEEKLY_SCHEDULE, JSON.stringify(DEFAULT_WEEKLY_SCHEDULE));
      localStorage.setItem(STORAGE_KEY_SPECIAL_MENUS, JSON.stringify(DEFAULT_SPECIAL_MENUS));
      return {
        success: true,
        weeklySchedule: DEFAULT_WEEKLY_SCHEDULE,
        specialMenus: DEFAULT_SPECIAL_MENUS
      };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  /**
   * 8. Resolve Effective Menu for any given Date or Weekday
   * Handles Special Date Overrides and Weekday fallback automatically.
   */
  getEffectiveMenu({ catalog = null, weeklySchedule = null, specialMenus = null, simulation = null }) {
    const activeCatalog = catalog || this.getCatalog();
    const activeWeekly = weeklySchedule || this.getWeeklySchedule();
    const activeSpecial = specialMenus || this.getSpecialDateSchedules();

    // Determine target Date
    let dateObj = new Date();
    let isWeekdaySimulation = false;
    let simulatedDayKey = null;

    if (simulation) {
      if (typeof simulation === 'string') {
        const lower = simulation.toLowerCase();
        // Check if simulation is a weekday name, e.g. "monday", "tuesday"
        const matchedDay = WEEKDAYS.find(w => w.key === lower || w.label.toLowerCase() === lower);
        if (matchedDay) {
          isWeekdaySimulation = true;
          simulatedDayKey = matchedDay.key;
        } else if (/^\d{4}-\d{2}-\d{2}$/.test(simulation)) {
          // Custom specific date, e.g. "2026-11-16"
          const [y, m, d] = simulation.split('-').map(Number);
          dateObj = new Date(y, m - 1, d);
        }
      } else if (simulation instanceof Date) {
        dateObj = simulation;
      }
    }

    // Format local date string: YYYY-MM-DD
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const rawDateStr = `${year}-${month}-${day}`;

    // Map day of week (0: Sunday, 1: Monday, ... 6: Saturday)
    const dayIndex = dateObj.getDay();
    const dayKeyMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayKey = isWeekdaySimulation && simulatedDayKey ? simulatedDayKey : dayKeyMap[dayIndex];
    const dayMeta = WEEKDAYS.find(w => w.key === dayKey) || { label: dayKey };

    // Check Special Date Override (Special date overrides only apply to date-based checks, not raw weekday simulations)
    let isSpecialOverride = false;
    let specialInfo = null;
    let scheduledDishIds = [];

    if (!isWeekdaySimulation && activeSpecial && activeSpecial[rawDateStr]) {
      isSpecialOverride = true;
      specialInfo = activeSpecial[rawDateStr];
      scheduledDishIds = specialInfo.dishIds || [];
    } else {
      isSpecialOverride = false;
      scheduledDishIds = activeWeekly[dayKey] || [];
    }

    // Resolve dish IDs against food catalog, preserving order and attributes
    const catalogMap = new Map(activeCatalog.map(item => [item.id, item]));
    const dishes = scheduledDishIds
      .map(id => catalogMap.get(id))
      .filter(Boolean);

    const formattedDate = dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    return {
      dishes,
      dishIds: scheduledDishIds,
      isSpecialOverride,
      specialInfo,
      dayKey,
      dayName: dayMeta.label,
      rawDateStr,
      formattedDate: isWeekdaySimulation ? `${dayMeta.label} (Simulated Schedule)` : formattedDate
    };
  }
};
