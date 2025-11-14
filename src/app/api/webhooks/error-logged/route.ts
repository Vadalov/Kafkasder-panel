/**
 * Webhook: Hata Oluştuğunda n8n'e Bildirim Gönder
 */

import { NextResponse } from 'next/server';

const N8N_WEBHOOK_URL =
  process.env.N8N_ERROR_WEBHOOK_URL || 'https://vmi2876541.contaboserver.net/webhook/error-logged';
const WEBHOOK_SECRET = process.env.N8N_WEBHOOK_SECRET || 'your-secret-key';

/**
 * n8n'e hata bildirimi gönder
 * Sadece critical ve high severity hataları gönder
 */
async function notifyN8N(errorData: any) {
  // Sadece kritik hataları gönder
  if (!['critical', 'high'].includes(errorData.severity)) {
    console.log('Skipping n8n notification for non-critical error');
    return false;
  }

  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': WEBHOOK_SECRET,
      },
      body: JSON.stringify({
        ...errorData,
        triggered_at: new Date().toISOString(),
        source: 'kafkasder-panel',
      }),
    });

    if (!response.ok) {
      console.error('n8n webhook failed:', await response.text());
      return false;
    }

    console.log('n8n error webhook sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending error webhook to n8n:', error);
    return false;
  }
}

/**
 * POST /api/webhooks/error-logged
 */
export async function POST(request: Request) {
  try {
    const error = await request.json();

    // Zorunlu alanları kontrol et
    if (!error.error_code || !error.title || !error.severity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // n8n'e webhook gönder (async, hata olsa bile devam et)
    notifyN8N(error).catch((err) => {
      console.error('Error webhook notification failed (non-blocking):', err);
    });

    return NextResponse.json({
      success: true,
      message: 'Error webhook notification sent',
    });
  } catch (error) {
    console.error('Error in error webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
