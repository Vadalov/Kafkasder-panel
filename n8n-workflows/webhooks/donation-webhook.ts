/**
 * Webhook: Bağış Oluşturulduğunda n8n'e Bildirim Gönder
 *
 * Bu dosyayı şu konuma kopyalayın:
 * src/app/api/webhooks/donation-created/route.ts
 *
 * Veya mevcut bağış oluşturma API'sine ekleyin:
 * src/app/api/donations/route.ts
 */

import { NextResponse } from 'next/server';

const N8N_WEBHOOK_URL =
  process.env.N8N_DONATION_WEBHOOK_URL ||
  'https://vmi2876541.contaboserver.net/webhook/donation-created';
const WEBHOOK_SECRET = process.env.N8N_WEBHOOK_SECRET || 'your-secret-key';

/**
 * n8n'e bağış bildirimi gönder
 */
async function notifyN8N(donationData: any) {
  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': WEBHOOK_SECRET,
      },
      body: JSON.stringify({
        ...donationData,
        triggered_at: new Date().toISOString(),
        source: 'kafkasder-panel',
      }),
    });

    if (!response.ok) {
      console.error('n8n webhook failed:', await response.text());
      return false;
    }

    console.log('n8n webhook sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending webhook to n8n:', error);
    return false;
  }
}

/**
 * POST /api/webhooks/donation-created
 *
 * Bağış oluşturulduğunda bu endpoint'i çağırın
 */
export async function POST(request: Request) {
  try {
    const donation = await request.json();

    // Zorunlu alanları kontrol et
    if (!donation.donor_name || !donation.amount || !donation.receipt_number) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // n8n'e webhook gönder (async, hata olsa bile devam et)
    notifyN8N(donation).catch((err) => {
      console.error('Webhook notification failed (non-blocking):', err);
    });

    return NextResponse.json({
      success: true,
      message: 'Webhook notification sent',
    });
  } catch (error) {
    console.error('Error in donation webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Mevcut API'ye Entegrasyon Örneği
 *
 * Eğer zaten bir bağış oluşturma API'niz varsa:
 * src/app/api/donations/route.ts içinde şöyle kullanın:
 */

/*
export async function POST(request: Request) {
  try {
    const data = await request.json();

    // 1. Bağışı veritabanına kaydet
    const donation = await createDonation(data);

    // 2. n8n'e webhook gönder (non-blocking)
    if (process.env.NODE_ENV === 'production') {
      notifyN8N(donation).catch(console.error);
    }

    // 3. Response dön
    return NextResponse.json({ success: true, data: donation });

  } catch (error) {
    console.error('Error creating donation:', error);
    return NextResponse.json(
      { error: 'Failed to create donation' },
      { status: 500 }
    );
  }
}
*/

/**
 * Convex Mutation'a Entegrasyon Örneği
 *
 * convex/donations.ts içinde:
 */

/*
import { mutation } from './_generated/server';
import { v } from 'convex/values';

export const create = mutation({
  args: {
    donor_name: v.string(),
    amount: v.number(),
    // ... diğer alanlar
  },
  handler: async (ctx, args) => {
    // 1. Bağışı kaydet
    const donationId = await ctx.db.insert('donations', {
      ...args,
      status: 'completed',
      receipt_number: generateReceiptNumber(),
    });

    const donation = await ctx.db.get(donationId);

    // 2. n8n webhook'u tetikle (Next.js API route üzerinden)
    if (process.env.NODE_ENV === 'production') {
      fetch('https://your-domain.com/api/webhooks/donation-created', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(donation),
      }).catch(console.error);
    }

    return donationId;
  },
});
*/

/**
 * Environment Variables (.env.local)
 *
 * N8N_DONATION_WEBHOOK_URL=https://vmi2876541.contaboserver.net/webhook/donation-created
 * N8N_WEBHOOK_SECRET=your-secret-key-here
 */
