/**
 * GET /api/communication?type=email|sms|whatsapp
 * Get communication settings by type
 *
 * GET /api/communication (no type)
 * Get all communication settings
 *
 * PUT /api/communication?type=email|sms|whatsapp
 * Update communication settings by type
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuthenticatedUser, buildErrorResponse } from '@/lib/api/auth-utils';
import { readOnlyRateLimit, mutationRateLimit } from '@/lib/rate-limit';
import { fetchQuery, fetchMutation } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';

async function getCommunicationHandler(request: NextRequest) {
  try {
    // Require authentication - only admins can view communication settings
    const { user } = await requireAuthenticatedUser();

    const isAdmin =
      user.role?.toUpperCase() === 'ADMIN' || user.role?.toUpperCase() === 'SUPER_ADMIN';

    if (!isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: 'İletişim ayarlarını görüntülemek için admin yetkisi gerekli',
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type) {
      // Get specific type
      if (!['email', 'sms', 'whatsapp'].includes(type)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Geçersiz iletişim türü (email, sms, whatsapp olmalı)',
          },
          { status: 400 }
        );
      }

      const settings = await fetchQuery(api.communication.getCommunicationSettings, {
        type: type as 'email' | 'sms' | 'whatsapp',
      });

      return NextResponse.json({
        success: true,
        data: settings,
      });
    } else {
      // Get all types
      const settings = await fetchQuery(api.communication.getAllCommunicationSettings);

      return NextResponse.json({
        success: true,
        data: settings,
      });
    }
  } catch (error) {
    const authError = buildErrorResponse(error);
    if (authError) {
      return NextResponse.json(authError.body, { status: authError.status });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'İletişim ayarları alınamadı',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export const GET = readOnlyRateLimit(getCommunicationHandler);

async function updateCommunicationHandler(request: NextRequest) {
  try {
    // Require authentication - only admins can update communication settings
    const { user } = await requireAuthenticatedUser();

    const isAdmin =
      user.role?.toUpperCase() === 'ADMIN' || user.role?.toUpperCase() === 'SUPER_ADMIN';

    if (!isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: 'İletişim ayarlarını güncellemek için admin yetkisi gerekli',
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (!type || !['email', 'sms', 'whatsapp'].includes(type)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Geçersiz iletişim türü (email, sms, whatsapp olmalı)',
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    let result;

    switch (type) {
      case 'email':
        result = await fetchMutation(api.communication.updateEmailSettings, body);
        break;
      case 'sms':
        result = await fetchMutation(api.communication.updateSmsSettings, body);
        break;
      case 'whatsapp':
        result = await fetchMutation(api.communication.updateWhatsAppSettings, body);
        break;
      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Geçersiz iletişim türü',
          },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `${type.toUpperCase()} ayarları güncellendi`,
      data: result,
    });
  } catch (error) {
    const authError = buildErrorResponse(error);
    if (authError) {
      return NextResponse.json(authError.body, { status: authError.status });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'İletişim ayarları güncellenemedi',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export const PUT = mutationRateLimit(updateCommunicationHandler);
