/**
 * Webhook: Hata Oluştuğunda n8n'e Bildirim Gönder
 *
 * Bu dosyayı şu konuma kopyalayın:
 * src/app/api/webhooks/error-logged/route.ts
 *
 * Veya mevcut error tracking API'sine ekleyin
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

/**
 * React Error Boundary Entegrasyonu
 *
 * src/components/ErrorBoundary.tsx içinde kullanım:
 */

/*
import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log hatayı
    console.error('Error caught by boundary:', error, errorInfo);

    // n8n webhook'u tetikle
    this.sendErrorToWebhook(error, errorInfo);

    // Sentry'ye gönder
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        contexts: { react: errorInfo },
      });
    }
  }

  async sendErrorToWebhook(error: Error, errorInfo: React.ErrorInfo) {
    try {
      await fetch('/api/webhooks/error-logged', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error_code: 'ERR_REACT_001',
          title: error.message,
          description: error.toString(),
          category: 'runtime',
          severity: 'high',
          stack_trace: error.stack,
          error_context: errorInfo,
          component: errorInfo.componentStack?.split('\n')[1]?.trim(),
          url: window.location.href,
          device_info: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
          },
          occurrence_count: 1,
          first_seen: new Date().toISOString(),
          last_seen: new Date().toISOString(),
          status: 'new',
        }),
      });
    } catch (err) {
      console.error('Failed to send error to webhook:', err);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Bir şeyler yanlış gitti</h2>
          <p>Üzgünüz, bir hata oluştu. Lütfen sayfayı yenileyin.</p>
          <button onClick={() => window.location.reload()}>
            Sayfayı Yenile
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
*/

/**
 * Global Error Handler (window.onerror)
 *
 * src/app/layout.tsx içinde kullanım:
 */

/*
'use client';

import { useEffect } from 'react';

export function GlobalErrorHandler() {
  useEffect(() => {
    // Global error handler
    window.onerror = (message, source, lineno, colno, error) => {
      fetch('/api/webhooks/error-logged', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error_code: 'ERR_GLOBAL_001',
          title: String(message),
          description: `${message} at ${source}:${lineno}:${colno}`,
          category: 'runtime',
          severity: 'high',
          stack_trace: error?.stack,
          url: window.location.href,
          function_name: source?.split('/').pop(),
          device_info: {
            userAgent: navigator.userAgent,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
          },
          occurrence_count: 1,
          first_seen: new Date().toISOString(),
          last_seen: new Date().toISOString(),
          status: 'new',
        }),
      }).catch(console.error);

      return false; // Let default handler run
    };

    // Unhandled promise rejection
    window.onunhandledrejection = (event) => {
      fetch('/api/webhooks/error-logged', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error_code: 'ERR_PROMISE_001',
          title: 'Unhandled Promise Rejection',
          description: String(event.reason),
          category: 'runtime',
          severity: 'medium',
          error_context: { reason: event.reason },
          url: window.location.href,
          occurrence_count: 1,
          first_seen: new Date().toISOString(),
          last_seen: new Date().toISOString(),
          status: 'new',
        }),
      }).catch(console.error);
    };

    return () => {
      window.onerror = null;
      window.onunhandledrejection = null;
    };
  }, []);

  return null;
}
*/

/**
 * Convex Error Logging
 *
 * convex/errors.ts içinde:
 */

/*
import { mutation } from './_generated/server';
import { v } from 'convex/values';

export const log = mutation({
  args: {
    error_code: v.string(),
    title: v.string(),
    description: v.string(),
    category: v.string(),
    severity: v.string(),
    // ... diğer alanlar
  },
  handler: async (ctx, args) => {
    // 1. Hatayı veritabanına kaydet
    const errorId = await ctx.db.insert('errors', {
      ...args,
      status: 'new',
      occurrence_count: 1,
      first_seen: new Date().toISOString(),
      last_seen: new Date().toISOString(),
    });

    const error = await ctx.db.get(errorId);

    // 2. Kritik hatalar için n8n webhook'u tetikle
    if (['critical', 'high'].includes(args.severity)) {
      fetch('https://your-domain.com/api/webhooks/error-logged', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(error),
      }).catch(console.error);
    }

    return errorId;
  },
});
*/

/**
 * API Error Handler Middleware
 *
 * src/middleware/errorHandler.ts
 */

/*
import { NextRequest, NextResponse } from 'next/server';

export async function errorHandler(error: Error, request: NextRequest) {
  // Log hatayı
  console.error('API Error:', error);

  // Kritik hatalarda n8n'e bildir
  if (error.name === 'DatabaseError' || error.name === 'AuthenticationError') {
    fetch('https://your-domain.com/api/webhooks/error-logged', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error_code: `ERR_API_${error.name}`,
        title: error.message,
        description: error.toString(),
        category: 'system',
        severity: 'critical',
        stack_trace: error.stack,
        url: request.url,
        error_context: {
          method: request.method,
          headers: Object.fromEntries(request.headers),
        },
        occurrence_count: 1,
        first_seen: new Date().toISOString(),
        last_seen: new Date().toISOString(),
        status: 'new',
      }),
    }).catch(console.error);
  }

  return NextResponse.json(
    { error: error.message },
    { status: 500 }
  );
}
*/

/**
 * Environment Variables (.env.local)
 *
 * N8N_ERROR_WEBHOOK_URL=https://vmi2876541.contaboserver.net/webhook/error-logged
 * N8N_WEBHOOK_SECRET=your-secret-key-here
 */
