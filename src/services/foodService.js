import { supabase, isSupabaseConfigured } from './supabaseClient';
import { initialMenuItems } from '../data/sampleMenu';

const STORAGE_KEY_CATALOG = 'cb_menu_items';

/**
 * Format DB snake_case record to frontend camelCase object
 */
export function formatDishFromDb(row) {
  if (!row) return null;
  return {
    id: row.id,
    code: row.code || row.id,
    name: row.name,
    shortName: row.short_name || row.name,
    tagline: row.tagline || '',
    category: row.category,
    price: Number(row.price),
    originalPrice: row.original_price ? Number(row.original_price) : Number(row.price),
    rating: row.rating ? Number(row.rating) : 4.9,
    reviewsCount: row.reviews_count ? Number(row.reviews_count) : 320,
    badge: row.badge || '',
    prepTime: row.prep_time || '5-8 mins',
    calories: row.calories || '400 kcal',
    isVeg: row.is_veg !== false,
    isSpecial: Boolean(row.is_special),
    available: row.available !== false,
    stock: row.stock !== undefined ? Number(row.stock) : 30,
    description: row.description || '',
    ingredients: Array.isArray(row.ingredients) ? row.ingredients : [],
    image: row.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80',
    themeColor: row.theme_color || '#F59E0B',
    modelType: row.model_type || 'burger',
    isActive: row.is_active !== false,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

/**
 * Format frontend dish object to DB snake_case for inserts/updates
 */
export function formatDishToDb(dish) {
  const payload = {};
  if (dish.code) payload.code = dish.code;
  if (dish.name !== undefined) payload.name = dish.name;
  if (dish.shortName !== undefined) payload.short_name = dish.shortName;
  if (dish.tagline !== undefined) payload.tagline = dish.tagline;
  if (dish.category !== undefined) payload.category = dish.category;
  if (dish.price !== undefined) payload.price = parseFloat(dish.price);
  if (dish.originalPrice !== undefined) payload.original_price = parseFloat(dish.originalPrice);
  if (dish.badge !== undefined) payload.badge = dish.badge;
  if (dish.prepTime !== undefined) payload.prep_time = dish.prepTime;
  if (dish.calories !== undefined) payload.calories = dish.calories;
  if (dish.isVeg !== undefined) payload.is_veg = Boolean(dish.isVeg);
  if (dish.isSpecial !== undefined) payload.is_special = Boolean(dish.isSpecial);
  if (dish.available !== undefined) payload.available = Boolean(dish.available);
  if (dish.stock !== undefined) payload.stock = parseInt(dish.stock, 10);
  if (dish.description !== undefined) payload.description = dish.description;
  if (dish.ingredients !== undefined) payload.ingredients = Array.isArray(dish.ingredients) ? dish.ingredients : [];
  if (dish.image !== undefined) payload.image_url = dish.image;
  if (dish.themeColor !== undefined) payload.theme_color = dish.themeColor;
  if (dish.modelType !== undefined) payload.model_type = dish.modelType;
  if (dish.isActive !== undefined) payload.is_active = Boolean(dish.isActive);
  return payload;
}

export const foodService = {
  /**
   * Fetch all active food dishes (or all dishes for admin)
   */
  async fetchCatalog({ includeInactive = false } = {}) {
    if (isSupabaseConfigured() && supabase) {
      try {
        let query = supabase
          .from('food_catalog')
          .select('*')
          .order('category', { ascending: true })
          .order('name', { ascending: true });

        if (!includeInactive) {
          query = query.eq('is_active', true);
        }

        const { data, error } = await query;
        if (!error && Array.isArray(data) && data.length > 0) {
          const formatted = data.map(formatDishFromDb);
          // Sync to localStorage as offline cache
          try {
            localStorage.setItem(STORAGE_KEY_CATALOG, JSON.stringify(formatted));
          } catch (_) {}
          return { success: true, data: formatted, source: 'supabase' };
        }
        if (error) {
          console.warn('[foodService] Supabase catalog error, falling back to local:', error.message);
        }
      } catch (err) {
        console.warn('[foodService] Fetch catalog exception:', err);
      }
    }

    // Local / Offline Fallback
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CATALOG);
      const items = saved ? JSON.parse(saved) : initialMenuItems;
      const filtered = includeInactive ? items : items.filter(i => i.isActive !== false);
      return { success: true, data: filtered, source: 'local' };
    } catch (_) {
      return { success: true, data: initialMenuItems, source: 'mock' };
    }
  },

  /**
   * Create a new dish in the catalog
   */
  async createDish(dishData) {
    const dbPayload = formatDishToDb(dishData);
    if (!dbPayload.code) {
      dbPayload.code = `item-${Date.now()}`;
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('food_catalog')
          .insert([dbPayload])
          .select()
          .single();

        if (!error && data) {
          const formatted = formatDishFromDb(data);
          return { success: true, data: formatted, source: 'supabase' };
        }
        console.error('[foodService] Create dish error:', error);
      } catch (err) {
        console.error('[foodService] Create dish exception:', err);
      }
    }

    // Local fallback
    const newItem = {
      ...dishData,
      id: dbPayload.code || `item-${Date.now()}`,
      available: true,
      stock: dishData.stock ? parseInt(dishData.stock, 10) : 30,
      price: parseFloat(dishData.price) || 100,
      rating: 5.0,
      reviewsCount: 1,
      isActive: true
    };
    return { success: true, data: newItem, source: 'local' };
  },

  /**
   * Update an existing dish
   */
  async updateDish(dishId, updates) {
    const dbPayload = formatDishToDb(updates);
    dbPayload.updated_at = new Date().toISOString();

    if (isSupabaseConfigured() && supabase) {
      try {
        // Check if dishId is UUID or legacy code
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(dishId);
        const query = isUuid
          ? supabase.from('food_catalog').update(dbPayload).eq('id', dishId)
          : supabase.from('food_catalog').update(dbPayload).eq('code', dishId);

        const { data, error } = await query.select().single();
        if (!error && data) {
          return { success: true, data: formatDishFromDb(data), source: 'supabase' };
        }
        console.error('[foodService] Update dish error:', error);
      } catch (err) {
        console.error('[foodService] Update dish exception:', err);
      }
    }

    // Local fallback
    return { success: true, data: { id: dishId, ...updates }, source: 'local' };
  },

  /**
   * Soft-delete dish by setting is_active = false
   * Preserves historical orders and relational integrity
   */
  async deleteDish(dishId, soft = true) {
    if (isSupabaseConfigured() && supabase) {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(dishId);
        let query;

        if (soft) {
          query = isUuid
            ? supabase.from('food_catalog').update({ is_active: false, updated_at: new Date().toISOString() }).eq('id', dishId)
            : supabase.from('food_catalog').update({ is_active: false, updated_at: new Date().toISOString() }).eq('code', dishId);
        } else {
          query = isUuid
            ? supabase.from('food_catalog').delete().eq('id', dishId)
            : supabase.from('food_catalog').delete().eq('code', dishId);
        }

        const { error } = await query;
        if (!error) {
          return { success: true, source: 'supabase' };
        }
        console.error('[foodService] Delete dish error:', error);
      } catch (err) {
        console.error('[foodService] Delete dish exception:', err);
      }
    }

    return { success: true, source: 'local' };
  },

  /**
   * Toggle dish availability and adjust stock
   */
  async toggleAvailability(dishId, isAvailable) {
    const payload = {
      available: isAvailable,
      stock: isAvailable ? 25 : 0,
      updated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(dishId);
        const query = isUuid
          ? supabase.from('food_catalog').update(payload).eq('id', dishId)
          : supabase.from('food_catalog').update(payload).eq('code', dishId);

        const { data, error } = await query.select().single();
        if (!error && data) {
          return { success: true, data: formatDishFromDb(data), source: 'supabase' };
        }
      } catch (err) {
        console.error('[foodService] Toggle availability exception:', err);
      }
    }

    return { success: true, data: { id: dishId, ...payload }, source: 'local' };
  }
};
