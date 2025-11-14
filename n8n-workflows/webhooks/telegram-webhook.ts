/**
 * Webhook: Telegram Bildirimi Gönderme
 *
 * Bu dosyayı şu konuma kopyalayın:
 * src/app/api/webhooks/telegram-notify/route.ts
 *
 * Telegram üzerinden bildirim göndermek için kullanın
 */

import { NextResponse } from 'next/server';

const N8N_TELEGRAM_WEBHOOK_URL =
  process.env.N8N_TELEGRAM_WEBHOOK_URL ||
  'https://vmi2876541.contaboserver.net/webhook/telegram-notify';
const WEBHOOK_SECRET = process.env.N8N_WEBHOOK_SECRET || 'your-secret-key';

/**
 * Telegram bildirim tipleri
 */
type NotificationType =
  | 'donation' // Bağış bildirimi
  | 'meeting' // Toplantı bildirimi
  | 'error' // Hata bildirimi
  | 'task' // Görev bildirimi
  | 'beneficiary' // İhtiyaç sahibi bildirimi
  | 'scholarship' // Burs bildirimi
  | 'general'; // Genel bildirim

interface TelegramNotification {
  type: NotificationType;
  title: string;
  description?: string;
  details?: Record<string, any>;
  url?: string;
  recipient_type: 'group' | 'personal';
  recipient_id?: string; // Chat ID (personal için)
  has_attachment?: boolean;
  attachment?: {
    data: string; // Base64
    filename: string;
    caption?: string;
  };
}

/**
 * n8n'e Telegram bildirimi gönder
 */
async function sendTelegramNotification(notification: TelegramNotification) {
  try {
    const response = await fetch(N8N_TELEGRAM_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': WEBHOOK_SECRET,
      },
      body: JSON.stringify({
        ...notification,
        triggered_at: new Date().toISOString(),
        source: 'kafkasder-panel',
      }),
    });

    if (!response.ok) {
      console.error('Telegram webhook failed:', await response.text());
      return false;
    }

    console.log('Telegram notification sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    return false;
  }
}

/**
 * POST /api/webhooks/telegram-notify
 */
export async function POST(request: Request) {
  try {
    const notification = (await request.json()) as TelegramNotification;

    // Zorunlu alanları kontrol et
    if (!notification.type || !notification.title || !notification.recipient_type) {
      return NextResponse.json(
        { error: 'Missing required fields: type, title, recipient_type' },
        { status: 400 }
      );
    }

    // Telegram bildirimi gönder (async, hata olsa bile devam et)
    sendTelegramNotification(notification).catch((err) => {
      console.error('Telegram notification failed (non-blocking):', err);
    });

    return NextResponse.json({
      success: true,
      message: 'Telegram notification sent',
    });
  } catch (error) {
    console.error('Error in Telegram webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Helper Functions - Projenizde kullanın
 */

/**
 * Bağış bildirimi gönder
 */
export async function notifyDonation(donation: {
  donor_name: string;
  amount: number;
  currency: string;
  receipt_number: string;
}) {
  await fetch('/api/webhooks/telegram-notify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'donation',
      title: 'Yeni Bağış Alındı! 💰',
      description: `${donation.donor_name} tarafından ${donation.amount} ${donation.currency} bağış yapıldı.`,
      details: {
        Bağışçı: donation.donor_name,
        Tutar: `${donation.amount} ${donation.currency}`,
        'Makbuz No': donation.receipt_number,
      },
      url: `https://panel.kafkasder.org/donations/${donation.receipt_number}`,
      recipient_type: 'group', // Tüm gruba bildir
    }),
  }).catch(console.error);
}

/**
 * Toplantı hatırlatması gönder
 */
export async function notifyMeeting(meeting: {
  title: string;
  date: string;
  location: string;
  participant_telegram_ids: string[];
}) {
  // Tüm katılımcılara gönder
  for (const telegramId of meeting.participant_telegram_ids) {
    await fetch('/api/webhooks/telegram-notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'meeting',
        title: 'Toplantı Hatırlatması 📅',
        description: meeting.title,
        details: {
          Tarih: meeting.date,
          Yer: meeting.location,
        },
        url: `https://panel.kafkasder.org/meetings`,
        recipient_type: 'personal',
        recipient_id: telegramId,
      }),
    }).catch(console.error);
  }
}

/**
 * Kritik hata bildirimi
 */
export async function notifyError(error: {
  title: string;
  description: string;
  severity: string;
  error_code: string;
}) {
  // Sadece critical/high severity hatalar için bildir
  if (!['critical', 'high'].includes(error.severity)) {
    return;
  }

  await fetch('/api/webhooks/telegram-notify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'error',
      title: `🚨 ${error.severity.toUpperCase()} HATA!`,
      description: error.title,
      details: {
        Açıklama: error.description,
        'Error Code': error.error_code,
        Severity: error.severity,
      },
      url: `https://panel.kafkasder.org/errors/${error.error_code}`,
      recipient_type: 'group', // Admin grubuna bildir
    }),
  }).catch(console.error);
}

/**
 * Genel bildirim gönder
 */
export async function sendGeneralNotification(
  title: string,
  description: string,
  recipientType: 'group' | 'personal' = 'group',
  recipientId?: string
) {
  await fetch('/api/webhooks/telegram-notify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'general',
      title,
      description,
      recipient_type: recipientType,
      recipient_id: recipientId,
    }),
  }).catch(console.error);
}

/**
 * Dosya ile birlikte bildirim gönder
 */
export async function sendNotificationWithFile(
  notification: TelegramNotification,
  fileBuffer: Buffer,
  filename: string
) {
  await fetch('/api/webhooks/telegram-notify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...notification,
      has_attachment: true,
      attachment: {
        data: fileBuffer.toString('base64'),
        filename,
        caption: notification.title,
      },
    }),
  }).catch(console.error);
}

/**
 * Convex Mutation Entegrasyonu
 *
 * convex/donations.ts:
 */

/*
export const create = mutation({
  args: { ... },
  handler: async (ctx, args) => {
    // Bağışı kaydet
    const donationId = await ctx.db.insert('donations', args);
    const donation = await ctx.db.get(donationId);

    // Telegram bildirimi gönder
    if (process.env.NODE_ENV === 'production') {
      fetch('https://your-domain.com/api/webhooks/telegram-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'donation',
          title: 'Yeni Bağış Alındı! 💰',
          description: `${donation.donor_name} - ${donation.amount} ${donation.currency}`,
          details: {
            'Bağışçı': donation.donor_name,
            'Tutar': `${donation.amount} ${donation.currency}`,
            'Makbuz': donation.receipt_number,
          },
          url: `https://panel.kafkasder.org/donations/${donation.receipt_number}`,
          recipient_type: 'group',
        }),
      }).catch(console.error);
    }

    return donationId;
  },
});
*/

/**
 * React Component Örneği
 */

/*
'use client';

import { useState } from 'react';

export function NotificationButton() {
  const [loading, setLoading] = useState(false);

  const sendTestNotification = async () => {
    setLoading(true);
    try {
      await fetch('/api/webhooks/telegram-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'general',
          title: 'Test Bildirimi',
          description: 'Bu bir test mesajıdır.',
          recipient_type: 'group',
        }),
      });
      alert('Telegram bildirimi gönderildi!');
    } catch (error) {
      console.error('Bildirim gönderilemedi:', error);
      alert('Hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={sendTestNotification} disabled={loading}>
      {loading ? 'Gönderiliyor...' : 'Test Bildirimi Gönder'}
    </button>
  );
}
*/

/**
 * Environment Variables (.env.local)
 *
 * N8N_TELEGRAM_WEBHOOK_URL=https://vmi2876541.contaboserver.net/webhook/telegram-notify
 * N8N_WEBHOOK_SECRET=your-secret-key-here
 * TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
 * TELEGRAM_GROUP_CHAT_ID=-1001234567890
 * TELEGRAM_ADMIN_CHAT_ID=123456789
 */
