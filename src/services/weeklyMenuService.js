import { supabase, isSupabaseConfigured } from './supabaseClient';
import { DEFAULT_WEEKLY_SCHEDULE, WEEKDAYS } from './menuScheduleService';

const STORAGE_KEY_WEEKLY_SCHEDULE = 'cb_weekly_menu_schedule';

// PostgreSQL DOW: 0 = Sunday ... 6 = Saturday
const DOW_TO_KEY = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const KEY_TO_DOW = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6
};

export const weeklyMenuService = {
  dayOfWeekToKey(dow) {
    return DOW_TO_KEY[dow] || 'monday';
  },

  keyToDayOfWeek(key) {
    const lower = String(key).toLowerCase();
    return KEY_TO_DOW[lower] !== undefined ? KEY_TO_DOW[lower] : 1;
  },

  /**
   * Fetch complete weekly schedule grouped by day key
   */
  async fetchWeeklySchedule() {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('weekly_menu_schedule')
          .select(`
            id,
            day_of_week,
            sort_order,
            is_available,
            food_id,
            food_catalog (
              id,
              code,
              name,
              is_active
            )
          `)
          .order('day_of_week', { ascending: true })
          .order('sort_order', { ascending: true });

        if (!error && Array.isArray(data) && data.length > 0) {
          const schedule = {
            sunday: [],
            monday: [],
            tuesday: [],
            wednesday: [],
            thursday: [],
            friday: [],
            saturday: []
          };

          data.forEach(row => {
            const dayKey = DOW_TO_KEY[row.day_of_week];
            // Prefer UUID id, but if legacy code is needed, use code or id
            const foodIdentifier = row.food_catalog?.id || row.food_id;
            if (dayKey && foodIdentifier && row.food_catalog?.is_active !== false) {
              schedule[dayKey].push(foodIdentifier);
            }
          });

          // Sync to localStorage
          try {
            localStorage.setItem(STORAGE_KEY_WEEKLY_SCHEDULE, JSON.stringify(schedule));
          } catch (_) {}

          return { success: true, data: schedule, source: 'supabase' };
        }

        if (error) {
          console.warn('[weeklyMenuService] Supabase fetch error, using local fallback:', error.message);
        }
      } catch (err) {
        console.warn('[weeklyMenuService] Fetch weekly schedule exception:', err);
      }
    }

    // Local fallback
    try {
      const saved = localStorage.getItem(STORAGE_KEY_WEEKLY_SCHEDULE);
      const schedule = saved ? JSON.parse(saved) : DEFAULT_WEEKLY_SCHEDULE;
      return { success: true, data: schedule, source: 'local' };
    } catch (_) {
      return { success: true, data: DEFAULT_WEEKLY_SCHEDULE, source: 'mock' };
    }
  },

  /**
   * Save / overwrite schedule for a single weekday
   */
  async saveDaySchedule(dayKey, dishIds) {
    const dow = this.keyToDayOfWeek(dayKey);

    if (isSupabaseConfigured() && supabase) {
      try {
        // First delete existing records for this day
        const { error: delError } = await supabase
          .from('weekly_menu_schedule')
          .delete()
          .eq('day_of_week', dow);

        if (delError) {
          console.error('[weeklyMenuService] Error deleting existing day schedule:', delError);
        }

        if (dishIds && dishIds.length > 0) {
          // Resolve food_ids: if item is a legacy code (e.g. 'item-1'), resolve UUID from food_catalog
          const { data: catalogItems } = await supabase
            .from('food_catalog')
            .select('id, code');

          const codeToUuid = new Map((catalogItems || []).map(c => [c.code, c.id]));
          const validUuids = new Set((catalogItems || []).map(c => c.id));

          const rowsToInsert = dishIds.map((dishId, idx) => {
            let targetUuid = dishId;
            if (codeToUuid.has(dishId)) {
              targetUuid = codeToUuid.get(dishId);
            } else if (!validUuids.has(dishId)) {
              // Attempt to match
              targetUuid = dishId;
            }
            return {
              food_id: targetUuid,
              day_of_week: dow,
              sort_order: idx + 1,
              is_available: true
            };
          }).filter(r => r.food_id);

          if (rowsToInsert.length > 0) {
            const { error: insError } = await supabase
              .from('weekly_menu_schedule')
              .insert(rowsToInsert);

            if (insError) {
              console.error('[weeklyMenuService] Error inserting day schedule:', insError);
            }
          }
        }
      } catch (err) {
        console.error('[weeklyMenuService] Save day schedule exception:', err);
      }
    }

    // Always update local storage
    try {
      const saved = localStorage.getItem(STORAGE_KEY_WEEKLY_SCHEDULE);
      const schedule = saved ? JSON.parse(saved) : { ...DEFAULT_WEEKLY_SCHEDULE };
      schedule[dayKey] = dishIds;
      localStorage.setItem(STORAGE_KEY_WEEKLY_SCHEDULE, JSON.stringify(schedule));
      return { success: true, schedule, source: isSupabaseConfigured() ? 'supabase' : 'local' };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  /**
   * Save complete weekly schedule for all 7 days
   */
  async saveFullWeeklySchedule(fullSchedule) {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: catalogItems } = await supabase
          .from('food_catalog')
          .select('id, code');

        const codeToUuid = new Map((catalogItems || []).map(c => [c.code, c.id]));

        // Clear existing weekly schedule
        await supabase.from('weekly_menu_schedule').delete().neq('day_of_week', -1);

        const rowsToInsert = [];
        Object.entries(fullSchedule).forEach(([dayKey, dishIds]) => {
          const dow = this.keyToDayOfWeek(dayKey);
          if (Array.isArray(dishIds)) {
            dishIds.forEach((dishId, idx) => {
              const targetUuid = codeToUuid.get(dishId) || dishId;
              rowsToInsert.push({
                food_id: targetUuid,
                day_of_week: dow,
                sort_order: idx + 1,
                is_available: true
              });
            });
          }
        });

        if (rowsToInsert.length > 0) {
          await supabase.from('weekly_menu_schedule').insert(rowsToInsert);
        }
      } catch (err) {
        console.error('[weeklyMenuService] Save full weekly schedule exception:', err);
      }
    }

    // Update local storage
    try {
      localStorage.setItem(STORAGE_KEY_WEEKLY_SCHEDULE, JSON.stringify(fullSchedule));
      return { success: true, schedule: fullSchedule };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  /**
   * Reset to default schedule
   */
  async resetToDefaults() {
    return this.saveFullWeeklySchedule(DEFAULT_WEEKLY_SCHEDULE);
  }
};
