/**
 * Convex Mutations and Queries for System Settings
 * Handles theme, branding, integrations, and system configurations
 */

import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

/**
 * Get all settings for a specific category
 */
export const getSettingsByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query('system_settings')
      .withIndex('by_category', (q) => q.eq('category', args.category))
      .collect();

    // Convert to key-value object
    const settingsObject: Record<string, any> = {};
    settings.forEach((setting) => {
      settingsObject[setting.key] = setting.value;
    });

    return settingsObject;
  },
});

/**
 * Get a single setting by category and key
 */
export const getSetting = query({
  args: {
    category: v.string(),
    key: v.string(),
  },
  handler: async (ctx, args) => {
    const setting = await ctx.db
      .query('system_settings')
      .withIndex('by_category_and_key', (q) => q.eq('category', args.category).eq('key', args.key))
      .first();

    return setting?.value ?? null;
  },
});

/**
 * Get all settings (for admin panel)
 */
export const getAllSettings = query({
  handler: async (ctx) => {
    const settings = await ctx.db.query('system_settings').collect();

    // Group by category
    const grouped: Record<string, Record<string, any>> = {};
    settings.forEach((setting) => {
      if (!grouped[setting.category]) {
        grouped[setting.category] = {};
      }
      grouped[setting.category][setting.key] = {
        value: setting.value,
        label: setting.label,
        description: setting.description,
        dataType: setting.data_type,
        defaultValue: setting.default_value,
      };
    });

    return grouped;
  },
});

/**
 * Set or update a setting
 */
export const setSetting = mutation({
  args: {
    category: v.string(),
    key: v.string(),
    value: v.any(),
    label: v.optional(v.string()),
    description: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
    isEncrypted: v.optional(v.boolean()),
    dataType: v.optional(v.string()),
    defaultValue: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // Check if setting exists
    const existing = await ctx.db
      .query('system_settings')
      .withIndex('by_category_and_key', (q) => q.eq('category', args.category).eq('key', args.key))
      .first();

    if (existing) {
      // Update existing
      await ctx.db.patch(existing._id, {
        value: args.value,
        label: args.label,
        description: args.description,
        is_public: args.isPublic,
        is_encrypted: args.isEncrypted,
        data_type: args.dataType,
        default_value: args.defaultValue,
        updated_at: Date.now(),
        version: (existing.version ?? 0) + 1,
      });

      return existing._id;
    } else {
      // Create new
      const id = await ctx.db.insert('system_settings', {
        category: args.category,
        key: args.key,
        value: args.value,
        label: args.label,
        description: args.description,
        is_public: args.isPublic ?? false,
        is_encrypted: args.isEncrypted ?? false,
        data_type: args.dataType ?? 'string',
        default_value: args.defaultValue,
        updated_at: Date.now(),
        version: 1,
      });

      return id;
    }
  },
});

/**
 * Set multiple settings at once (bulk update)
 */
export const setBulkSettings = mutation({
  args: {
    category: v.string(),
    settings: v.any(), // Record<string, any>
  },
  handler: async (ctx, args) => {
    const results = [];

    for (const [key, value] of Object.entries(args.settings as Record<string, any>)) {
      const existing = await ctx.db
        .query('system_settings')
        .withIndex('by_category_and_key', (q) => q.eq('category', args.category).eq('key', key))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          value,
          updated_at: Date.now(),
          version: (existing.version ?? 0) + 1,
        });
        results.push(existing._id);
      } else {
        const id = await ctx.db.insert('system_settings', {
          category: args.category,
          key,
          value,
          is_public: false,
          is_encrypted: false,
          data_type: 'string',
          updated_at: Date.now(),
          version: 1,
        });
        results.push(id);
      }
    }

    return results;
  },
});

/**
 * Delete a setting
 */
export const deleteSetting = mutation({
  args: {
    category: v.string(),
    key: v.string(),
  },
  handler: async (ctx, args) => {
    const setting = await ctx.db
      .query('system_settings')
      .withIndex('by_category_and_key', (q) => q.eq('category', args.category).eq('key', args.key))
      .first();

    if (setting) {
      await ctx.db.delete(setting._id);
      return true;
    }

    return false;
  },
});

/**
 * Reset setting to default value
 */
export const resetSetting = mutation({
  args: {
    category: v.string(),
    key: v.string(),
  },
  handler: async (ctx, args) => {
    const setting = await ctx.db
      .query('system_settings')
      .withIndex('by_category_and_key', (q) => q.eq('category', args.category).eq('key', args.key))
      .first();

    if (setting && setting.default_value !== undefined) {
      await ctx.db.patch(setting._id, {
        value: setting.default_value,
        updated_at: Date.now(),
        version: (setting.version ?? 0) + 1,
      });
      return true;
    }

    return false;
  },
});

// ==================== THEME PRESETS ====================

/**
 * Get all theme presets
 */
export const getThemePresets = query({
  handler: async (ctx) => {
    return await ctx.db.query('theme_presets').collect();
  },
});

/**
 * Get default theme preset
 */
export const getDefaultTheme = query({
  handler: async (ctx) => {
    const defaultTheme = await ctx.db
      .query('theme_presets')
      .withIndex('by_is_default', (q) => q.eq('is_default', true))
      .first();

    return defaultTheme;
  },
});

/**
 * Get theme preset by name
 */
export const getThemeByName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('theme_presets')
      .withIndex('by_name', (q) => q.eq('name', args.name))
      .first();
  },
});

/**
 * Create or update theme preset
 */
export const saveThemePreset = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    colors: v.any(),
    typography: v.optional(v.any()),
    layout: v.optional(v.any()),
    isDefault: v.optional(v.boolean()),
    isCustom: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Check if theme with this name exists
    const existing = await ctx.db
      .query('theme_presets')
      .withIndex('by_name', (q) => q.eq('name', args.name))
      .first();

    // If setting as default, unset other defaults
    if (args.isDefault) {
      const allThemes = await ctx.db.query('theme_presets').collect();
      for (const theme of allThemes) {
        if (theme.is_default && theme._id !== existing?._id) {
          await ctx.db.patch(theme._id, { is_default: false });
        }
      }
    }

    if (existing) {
      // Update existing theme
      await ctx.db.patch(existing._id, {
        description: args.description,
        colors: args.colors,
        typography: args.typography,
        layout: args.layout,
        is_default: args.isDefault ?? existing.is_default,
        is_custom: args.isCustom ?? existing.is_custom,
      });

      return existing._id;
    } else {
      // Create new theme
      const id = await ctx.db.insert('theme_presets', {
        name: args.name,
        description: args.description,
        colors: args.colors,
        typography: args.typography,
        layout: args.layout,
        is_default: args.isDefault ?? false,
        is_custom: args.isCustom ?? true,
        created_at: Date.now(),
      });

      return id;
    }
  },
});

/**
 * Delete theme preset
 */
export const deleteThemePreset = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const theme = await ctx.db
      .query('theme_presets')
      .withIndex('by_name', (q) => q.eq('name', args.name))
      .first();

    if (theme && !theme.is_default) {
      // Don't allow deleting default theme
      await ctx.db.delete(theme._id);
      return true;
    }

    return false;
  },
});

/**
 * Set theme as default
 */
export const setDefaultTheme = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    // Unset all other defaults
    const allThemes = await ctx.db.query('theme_presets').collect();
    for (const theme of allThemes) {
      if (theme.is_default) {
        await ctx.db.patch(theme._id, { is_default: false });
      }
    }

    // Set new default
    const theme = await ctx.db
      .query('theme_presets')
      .withIndex('by_name', (q) => q.eq('name', args.name))
      .first();

    if (theme) {
      await ctx.db.patch(theme._id, { is_default: true });
      return true;
    }

    return false;
  },
});
