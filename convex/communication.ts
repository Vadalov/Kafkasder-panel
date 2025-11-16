/**
 * Convex Mutations and Queries for Communication Settings
 * Handles Email/SMTP, SMS/Twilio, and WhatsApp configurations
 */

import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

/**
 * Get all communication settings by type (email, sms, whatsapp)
 */
export const getCommunicationSettings = query({
  args: {
    type: v.union(v.literal('email'), v.literal('sms'), v.literal('whatsapp')),
  },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query('system_settings')
      .withIndex('by_category', (q) => q.eq('category', args.type))
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
 * Get all communication settings (all types)
 */
export const getAllCommunicationSettings = query({
  handler: async (ctx) => {
    const emailSettings = await ctx.db
      .query('system_settings')
      .withIndex('by_category', (q) => q.eq('category', 'email'))
      .collect();

    const smsSettings = await ctx.db
      .query('system_settings')
      .withIndex('by_category', (q) => q.eq('category', 'sms'))
      .collect();

    const whatsappSettings = await ctx.db
      .query('system_settings')
      .withIndex('by_category', (q) => q.eq('category', 'whatsapp'))
      .collect();

    const toObject = (settings: any[]) => {
      const obj: Record<string, any> = {};
      settings.forEach((s) => {
        obj[s.key] = s.value;
      });
      return obj;
    };

    return {
      email: toObject(emailSettings),
      sms: toObject(smsSettings),
      whatsapp: toObject(whatsappSettings),
    };
  },
});

/**
 * Update Email/SMTP settings
 */
export const updateEmailSettings = mutation({
  args: {
    smtpHost: v.optional(v.string()),
    smtpPort: v.optional(v.number()),
    smtpUser: v.optional(v.string()),
    smtpPassword: v.optional(v.string()),
    smtpSecure: v.optional(v.boolean()),
    fromEmail: v.optional(v.string()),
    fromName: v.optional(v.string()),
    replyToEmail: v.optional(v.string()),
    enabled: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const updates = [];

    for (const [key, value] of Object.entries(args)) {
      if (value !== undefined) {
        const existing = await ctx.db
          .query('system_settings')
          .withIndex('by_category_and_key', (q) => q.eq('category', 'email').eq('key', key))
          .first();

        const isEncrypted = key.includes('password') || key.includes('Password');

        if (existing) {
          await ctx.db.patch(existing._id, {
            value,
            is_encrypted: isEncrypted,
            updated_at: Date.now(),
            version: (existing.version ?? 0) + 1,
          });
        } else {
          await ctx.db.insert('system_settings', {
            category: 'email',
            key,
            value,
            is_public: false,
            is_encrypted: isEncrypted,
            data_type: typeof value === 'boolean' ? 'boolean' : typeof value === 'number' ? 'number' : 'string',
            updated_at: Date.now(),
            version: 1,
          });
        }
        updates.push(key);
      }
    }

    return {
      success: true,
      message: `Updated ${updates.length} email settings`,
      updated: updates,
    };
  },
});

/**
 * Update SMS/Twilio settings
 */
export const updateSmsSettings = mutation({
  args: {
    twilioAccountSid: v.optional(v.string()),
    twilioAuthToken: v.optional(v.string()),
    twilioPhoneNumber: v.optional(v.string()),
    twilioMessagingServiceSid: v.optional(v.string()),
    enabled: v.optional(v.boolean()),
    testMode: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const updates = [];

    for (const [key, value] of Object.entries(args)) {
      if (value !== undefined) {
        const existing = await ctx.db
          .query('system_settings')
          .withIndex('by_category_and_key', (q) => q.eq('category', 'sms').eq('key', key))
          .first();

        const isEncrypted = key.includes('token') || key.includes('Token') || key.includes('sid') || key.includes('Sid');

        if (existing) {
          await ctx.db.patch(existing._id, {
            value,
            is_encrypted: isEncrypted,
            updated_at: Date.now(),
            version: (existing.version ?? 0) + 1,
          });
        } else {
          await ctx.db.insert('system_settings', {
            category: 'sms',
            key,
            value,
            is_public: false,
            is_encrypted: isEncrypted,
            data_type: typeof value === 'boolean' ? 'boolean' : 'string',
            updated_at: Date.now(),
            version: 1,
          });
        }
        updates.push(key);
      }
    }

    return {
      success: true,
      message: `Updated ${updates.length} SMS settings`,
      updated: updates,
    };
  },
});

/**
 * Update WhatsApp settings
 */
export const updateWhatsAppSettings = mutation({
  args: {
    phoneNumberId: v.optional(v.string()),
    accessToken: v.optional(v.string()),
    businessAccountId: v.optional(v.string()),
    webhookVerifyToken: v.optional(v.string()),
    enabled: v.optional(v.boolean()),
    testMode: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const updates = [];

    for (const [key, value] of Object.entries(args)) {
      if (value !== undefined) {
        const existing = await ctx.db
          .query('system_settings')
          .withIndex('by_category_and_key', (q) => q.eq('category', 'whatsapp').eq('key', key))
          .first();

        const isEncrypted = key.includes('token') || key.includes('Token') || key.includes('access');

        if (existing) {
          await ctx.db.patch(existing._id, {
            value,
            is_encrypted: isEncrypted,
            updated_at: Date.now(),
            version: (existing.version ?? 0) + 1,
          });
        } else {
          await ctx.db.insert('system_settings', {
            category: 'whatsapp',
            key,
            value,
            is_public: false,
            is_encrypted: isEncrypted,
            data_type: typeof value === 'boolean' ? 'boolean' : 'string',
            updated_at: Date.now(),
            version: 1,
          });
        }
        updates.push(key);
      }
    }

    return {
      success: true,
      message: `Updated ${updates.length} WhatsApp settings`,
      updated: updates,
    };
  },
});

/**
 * Test email configuration
 */
export const testEmailConnection = mutation({
  args: {
    testEmail: v.string(),
  },
  handler: async (_ctx, _args) => {
    // TODO: Implement actual email test
    // This would send a test email using the configured SMTP settings
    return {
      success: true,
      message: 'Test email sent successfully (TODO: implement actual test)',
    };
  },
});

/**
 * Test SMS configuration
 */
export const testSmsConnection = mutation({
  args: {
    testPhoneNumber: v.string(),
  },
  handler: async (_ctx, _args) => {
    // TODO: Implement actual SMS test
    // This would send a test SMS using Twilio
    return {
      success: true,
      message: 'Test SMS sent successfully (TODO: implement actual test)',
    };
  },
});

/**
 * Test WhatsApp configuration
 */
export const testWhatsAppConnection = mutation({
  args: {
    testPhoneNumber: v.string(),
  },
  handler: async (_ctx, _args) => {
    // TODO: Implement actual WhatsApp test
    // This would send a test message using WhatsApp Business API
    return {
      success: true,
      message: 'Test WhatsApp message sent successfully (TODO: implement actual test)',
    };
  },
});

/**
 * Seed default communication settings
 */
export const seedDefaultCommunication = mutation({
  handler: async (ctx) => {
    // Email defaults
    const emailDefaults = [
      { key: 'smtpHost', value: 'smtp.gmail.com', label: 'SMTP Host' },
      { key: 'smtpPort', value: 587, label: 'SMTP Port' },
      { key: 'smtpUser', value: '', label: 'SMTP User' },
      { key: 'smtpPassword', value: '', label: 'SMTP Password', is_encrypted: true },
      { key: 'smtpSecure', value: true, label: 'SMTP Secure (TLS)' },
      { key: 'fromEmail', value: 'noreply@kafkasder.org', label: 'From Email' },
      { key: 'fromName', value: 'Kafkasder', label: 'From Name' },
      { key: 'replyToEmail', value: 'info@kafkasder.org', label: 'Reply-To Email' },
      { key: 'enabled', value: false, label: 'Email Enabled' },
    ];

    // SMS defaults
    const smsDefaults = [
      { key: 'twilioAccountSid', value: '', label: 'Twilio Account SID', is_encrypted: true },
      { key: 'twilioAuthToken', value: '', label: 'Twilio Auth Token', is_encrypted: true },
      { key: 'twilioPhoneNumber', value: '', label: 'Twilio Phone Number' },
      { key: 'twilioMessagingServiceSid', value: '', label: 'Messaging Service SID', is_encrypted: true },
      { key: 'enabled', value: false, label: 'SMS Enabled' },
      { key: 'testMode', value: true, label: 'Test Mode' },
    ];

    // WhatsApp defaults
    const whatsappDefaults = [
      { key: 'phoneNumberId', value: '', label: 'Phone Number ID' },
      { key: 'accessToken', value: '', label: 'Access Token', is_encrypted: true },
      { key: 'businessAccountId', value: '', label: 'Business Account ID' },
      { key: 'webhookVerifyToken', value: '', label: 'Webhook Verify Token', is_encrypted: true },
      { key: 'enabled', value: false, label: 'WhatsApp Enabled' },
      { key: 'testMode', value: true, label: 'Test Mode' },
    ];

    const allDefaults = [
      ...emailDefaults.map((d) => ({ ...d, category: 'email' })),
      ...smsDefaults.map((d) => ({ ...d, category: 'sms' })),
      ...whatsappDefaults.map((d) => ({ ...d, category: 'whatsapp' })),
    ];

    for (const setting of allDefaults) {
      const existing = await ctx.db
        .query('system_settings')
        .withIndex('by_category_and_key', (q) =>
          q.eq('category', setting.category).eq('key', setting.key)
        )
        .first();

      if (!existing) {
        await ctx.db.insert('system_settings', {
          category: setting.category,
          key: setting.key,
          value: setting.value,
          label: setting.label,
          is_public: false,
          is_encrypted: setting.is_encrypted ?? false,
          data_type: typeof setting.value === 'boolean' ? 'boolean' : typeof setting.value === 'number' ? 'number' : 'string',
          updated_at: Date.now(),
          version: 1,
        });
      }
    }

    return {
      success: true,
      message: 'Default communication settings created',
      count: allDefaults.length,
    };
  },
});
