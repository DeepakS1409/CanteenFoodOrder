import { supabase, isSupabaseConfigured } from './supabaseClient';
import { menuScheduleService, WEEKDAYS } from './menuScheduleService';
import { formatDishFromDb } from './foodService';

export const currentMenuService = {
  /**
   * Fetch today's effective menu from the Supabase RPC `get_today_menu`
   * or fall back to client-side resolution if Supabase is offline.
   */
  async fetchTodayMenu(simulatedDate = null) {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.rpc('get_today_menu', {
          p_simulated_date: simulatedDate || null
        });

        if (!error && data && typeof data === 'object') {
          const dishes = Array.isArray(data.items)
            ? data.items.map(formatDishFromDb)
            : [];

          const dayKey = (data.day_name || 'monday').toLowerCase();
          const dayMeta = WEEKDAYS.find(w => w.key === dayKey) || { label: data.day_name || 'Monday' };

          // Format human-friendly display date
          let displayDate = data.date;
          try {
            if (data.date) {
              const [y, m, d] = data.date.split('-').map(Number);
              const dateObj = new Date(y, m - 1, d);
              displayDate = dateObj.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              });
            }
          } catch (_) {}

          return {
            success: true,
            source: 'supabase_rpc',
            dishes,
            dishIds: dishes.map(d => d.id),
            isSpecialOverride: Boolean(data.is_special_override),
            specialInfo: data.is_special_override ? {
              id: data.special_menu_id,
              title: data.special_title,
              badge: data.special_badge,
              notes: data.special_notes,
              dishIds: dishes.map(d => d.id)
            } : null,
            dayKey,
            dayName: dayMeta.label,
            rawDateStr: data.date,
            formattedDate: displayDate
          };
        }

        if (error) {
          console.warn('[currentMenuService] RPC get_today_menu returned error, using fallback:', error.message);
        }
      } catch (err) {
        console.warn('[currentMenuService] Fetch today menu exception, using fallback:', err);
      }
    }

    // Local / Offline Fallback using existing menuScheduleService
    const localResult = menuScheduleService.getEffectiveMenu({ simulation: simulatedDate });
    return {
      success: true,
      source: 'local_fallback',
      ...localResult
    };
  },

  /**
   * Listen to Supabase Realtime changes across menu tables
   */
  subscribeToMenuUpdates(onUpdate) {
    if (!isSupabaseConfigured() || !supabase) {
      return () => {};
    }

    try {
      const channel = supabase
        .channel('campusbite-menu-live-sync')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'food_catalog' },
          () => {
            console.log('[Realtime] food_catalog changed, reloading menu...');
            onUpdate?.();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'weekly_menu_schedule' },
          () => {
            console.log('[Realtime] weekly_menu_schedule changed, reloading menu...');
            onUpdate?.();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'special_date_menus' },
          () => {
            console.log('[Realtime] special_date_menus changed, reloading menu...');
            onUpdate?.();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'special_menu_items' },
          () => {
            console.log('[Realtime] special_menu_items changed, reloading menu...');
            onUpdate?.();
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('[CampusBite Realtime] Subscribed to live menu updates.');
          }
        });

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (e) {
      console.warn('[CampusBite Realtime] Subscription error:', e);
      return () => {};
    }
  }
};
