/**
 * Webhook: Bağış Oluşturulduğunda n8n'e Bildirim Gönder
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
