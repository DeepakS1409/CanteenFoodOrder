import { supabase, isSupabaseConfigured } from './supabaseClient';
import { DEFAULT_SPECIAL_MENUS } from './menuScheduleService';

const STORAGE_KEY_SPECIAL_MENUS = 'cb_special_date_menus';

export const specialMenuService = {
  /**
   * Fetch all special date menus and their assigned dishes
   */
  async fetchSpecialMenus() {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('special_date_menus')
          .select(`
            id,
            menu_date,
            title,
            badge,
            notes,
            is_active,
            special_menu_items (
              id,
              food_id,
              sort_order,
              is_available,
              food_catalog (
                id,
                code,
                name,
                is_active
              )
            )
          `)
          .eq('is_active', true)
          .order('menu_date', { ascending: true });

        if (!error && Array.isArray(data)) {
          const result = {};
          data.forEach(menu => {
            const dateStr = menu.menu_date;
            const items = (menu.special_menu_items || [])
              .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
              .map(item => item.food_catalog?.id || item.food_id)
              .filter(Boolean);

            result[dateStr] = {
              id: menu.id,
              title: menu.title,
              badge: menu.badge || 'Fest Special',
              notes: menu.notes || '',
              dishIds: items,
              isActive: menu.is_active
            };
          });

          // Sync local storage cache
          try {
            localStorage.setItem(STORAGE_KEY_SPECIAL_MENUS, JSON.stringify(result));
          } catch (_) {}

          return { success: true, data: result, source: 'supabase' };
        }

        if (error) {
          console.warn('[specialMenuService] Supabase special menus error, falling back to local:', error.message);
        }
      } catch (err) {
        console.warn('[specialMenuService] Fetch special menus exception:', err);
      }
    }

    // Local fallback
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SPECIAL_MENUS);
      const menus = saved ? JSON.parse(saved) : DEFAULT_SPECIAL_MENUS;
      return { success: true, data: menus, source: 'local' };
    } catch (_) {
      return { success: true, data: DEFAULT_SPECIAL_MENUS, source: 'mock' };
    }
  },

  /**
   * Save or update a special date override menu
   */
  async saveSpecialDateMenu(dateStr, menuData) {
    if (isSupabaseConfigured() && supabase) {
      try {
        // 1. Upsert into special_date_menus
        const { data: menuRow, error: menuError } = await supabase
          .from('special_date_menus')
          .upsert({
            menu_date: dateStr,
            title: menuData.title || 'Campus Canteen Special Menu',
            badge: menuData.badge || 'Fest Special',
            notes: menuData.notes || '',
            is_active: true,
            updated_at: new Date().toISOString()
          }, { onConflict: 'menu_date' })
          .select()
          .single();

        if (menuError) {
          console.error('[specialMenuService] Upsert special date error:', menuError);
        } else if (menuRow && Array.isArray(menuData.dishIds)) {
          // 2. Fetch catalog to resolve legacy codes to UUIDs if needed
          const { data: catalogItems } = await supabase
            .from('food_catalog')
            .select('id, code');

          const codeToUuid = new Map((catalogItems || []).map(c => [c.code, c.id]));

          // Delete existing items for this special menu
          await supabase
            .from('special_menu_items')
            .delete()
            .eq('special_menu_id', menuRow.id);

          // Insert new items
          const itemsToInsert = menuData.dishIds.map((dishId, idx) => ({
            special_menu_id: menuRow.id,
            food_id: codeToUuid.get(dishId) || dishId,
            sort_order: idx + 1,
            is_available: true
          }));

          if (itemsToInsert.length > 0) {
            await supabase.from('special_menu_items').insert(itemsToInsert);
          }
        }
      } catch (err) {
        console.error('[specialMenuService] Save special date menu exception:', err);
      }
    }

    // Always update local storage
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SPECIAL_MENUS);
      const current = saved ? JSON.parse(saved) : { ...DEFAULT_SPECIAL_MENUS };
      current[dateStr] = {
        dishIds: menuData.dishIds || [],
        title: menuData.title || 'Campus Canteen Special Menu',
        badge: menuData.badge || 'Special Menu',
        notes: menuData.notes || ''
      };
      localStorage.setItem(STORAGE_KEY_SPECIAL_MENUS, JSON.stringify(current));
      return { success: true, specialMenus: current, source: isSupabaseConfigured() ? 'supabase' : 'local' };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  /**
   * Delete a special date menu
   */
  async deleteSpecialDateMenu(dateStr) {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase
          .from('special_date_menus')
          .delete()
          .eq('menu_date', dateStr);
      } catch (err) {
        console.error('[specialMenuService] Delete special date menu exception:', err);
      }
    }

    // Update local storage
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SPECIAL_MENUS);
      const current = saved ? JSON.parse(saved) : { ...DEFAULT_SPECIAL_MENUS };
      delete current[dateStr];
      localStorage.setItem(STORAGE_KEY_SPECIAL_MENUS, JSON.stringify(current));
      return { success: true, specialMenus: current };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
};

