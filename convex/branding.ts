/**
 * Convex Mutations and Queries for Branding Settings
 * Handles logo uploads, organization info, and brand customization
 */

import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

/**
 * Get all branding settings
 */
export const getBrandingSettings = query({
  handler: async (ctx) => {
    const settings = await ctx.db
      .query('system_settings')
      .withIndex('by_category', (q) => q.eq('category', 'branding'))
      .collect();

    // Convert to key-value object
    const brandingObject: Record<string, any> = {};
    settings.forEach((setting) => {
      brandingObject[setting.key] = setting.value;
    });

    return brandingObject;
  },
});

/**
 * Update organization info (name, slogan, footer, etc.)
 */
export const updateOrganizationInfo = mutation({
  args: {
    organizationName: v.optional(v.string()),
    slogan: v.optional(v.string()),
    footerText: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    address: v.optional(v.string()),
    website: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updates = [];

    // Update each field if provided
    for (const [key, value] of Object.entries(args)) {
      if (value !== undefined) {
        const existing = await ctx.db
          .query('system_settings')
          .withIndex('by_category_and_key', (q) => q.eq('category', 'branding').eq('key', key))
          .first();

        if (existing) {
          await ctx.db.patch(existing._id, {
            value,
            updated_at: Date.now(),
            version: (existing.version ?? 0) + 1,
          });
        } else {
          await ctx.db.insert('system_settings', {
            category: 'branding',
            key,
            value,
            is_public: true,
            is_encrypted: false,
            data_type: 'string',
            updated_at: Date.now(),
            version: 1,
          });
        }
        updates.push(key);
      }
    }

    return {
      success: true,
      message: `Updated ${updates.length} branding settings`,
      updated: updates,
    };
  },
});

/**
 * Update logo URL (after file upload)
 */
export const updateLogo = mutation({
  args: {
    logoType: v.union(
      v.literal('main_logo'),
      v.literal('logo_dark'),
      v.literal('favicon'),
      v.literal('email_logo')
    ),
    storageId: v.string(), // Convex storage ID
    url: v.string(), // Public URL from storage
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('system_settings')
      .withIndex('by_category_and_key', (q) =>
        q.eq('category', 'branding').eq('key', args.logoType)
      )
      .first();

    const logoData = {
      storageId: args.storageId,
      url: args.url,
      uploadedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, {
        value: logoData,
        updated_at: Date.now(),
        version: (existing.version ?? 0) + 1,
      });
    } else {
      await ctx.db.insert('system_settings', {
        category: 'branding',
        key: args.logoType,
        value: logoData,
        label: args.logoType
          .split('_')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' '),
        is_public: true,
        is_encrypted: false,
        data_type: 'json',
        updated_at: Date.now(),
        version: 1,
      });
    }

    return {
      success: true,
      message: `${args.logoType} updated successfully`,
      logoType: args.logoType,
      url: args.url,
    };
  },
});

/**
 * Remove a logo
 */
export const removeLogo = mutation({
  args: {
    logoType: v.union(
      v.literal('main_logo'),
      v.literal('logo_dark'),
      v.literal('favicon'),
      v.literal('email_logo')
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('system_settings')
      .withIndex('by_category_and_key', (q) =>
        q.eq('category', 'branding').eq('key', args.logoType)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return {
        success: true,
        message: `${args.logoType} removed successfully`,
      };
    }

    return {
      success: false,
      message: 'Logo not found',
    };
  },
});

/**
 * Seed default branding settings
 */
export const seedDefaultBranding = mutation({
  handler: async (ctx) => {
    const existingBranding = await ctx.db
      .query('system_settings')
      .withIndex('by_category', (q) => q.eq('category', 'branding'))
      .first();

    if (existingBranding) {
      return {
        success: false,
        message: 'Branding settings already exist',
      };
    }

    // Default organization info
    const defaults = [
      {
        key: 'organizationName',
        value: 'Kafkasder',
        label: 'Organizasyon Adı',
        description: 'Derneğin resmi adı',
      },
      {
        key: 'slogan',
        value: 'Yardımlaşma ve Dayanışma Derneği',
        label: 'Slogan',
        description: 'Organizasyon sloganı',
      },
      {
        key: 'footerText',
        value: '© 2024 Kafkasder. Tüm hakları saklıdır.',
        label: 'Footer Metni',
        description: 'Sayfa altı telif hakkı metni',
      },
      {
        key: 'contactEmail',
        value: 'info@kafkasder.org',
        label: 'İletişim E-postası',
        description: 'Genel iletişim e-posta adresi',
      },
      {
        key: 'contactPhone',
        value: '+90 XXX XXX XX XX',
        label: 'İletişim Telefonu',
        description: 'Genel iletişim telefon numarası',
      },
      {
        key: 'address',
        value: 'İstanbul, Türkiye',
        label: 'Adres',
        description: 'Fiziksel adres',
      },
      {
        key: 'website',
        value: 'https://kafkasder.org',
        label: 'Website',
        description: 'Resmi web sitesi',
      },
    ];

    for (const setting of defaults) {
      await ctx.db.insert('system_settings', {
        category: 'branding',
        key: setting.key,
        value: setting.value,
        label: setting.label,
        description: setting.description,
        is_public: true,
        is_encrypted: false,
        data_type: 'string',
        updated_at: Date.now(),
        version: 1,
      });
    }

    return {
      success: true,
      message: 'Default branding settings created',
      count: defaults.length,
    };
  },
});
