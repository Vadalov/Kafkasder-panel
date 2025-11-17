/**
 * GET /api/security
 * Get all security settings
 *
 * PUT /api/security?type=password|session|2fa|general
 * Update security settings by type
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuthenticatedUser, buildErrorResponse } from '@/lib/api/auth-utils';
import { readOnlyRateLimit, mutationRateLimit } from '@/lib/rate-limit';
import { fetchQuery, fetchMutation } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';

async function getSecurityHandler(_request: NextRequest) {
  try {
    // Require authentication - only super admins can view security settings
    const { user } = await requireAuthenticatedUser();

    const isSuperAdmin = user.role?.toUpperCase() === 'SUPER_ADMIN';

    if (!isSuperAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: 'Güvenlik ayarlarını görüntülemek için super admin yetkisi gerekli',
        },
        { status: 403 }
      );
    }

    const settings = await fetchQuery(api.security.getSecuritySettings);

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    const authError = buildErrorResponse(error);
    if (authError) {
      return NextResponse.json(authError.body, { status: authError.status });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Güvenlik ayarları alınamadı',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export const GET = readOnlyRateLimit(getSecurityHandler);

async function updateSecurityHandler(request: NextRequest) {
  try {
    // Require authentication - only super admins can update security settings
    const { user } = await requireAuthenticatedUser();

    const isSuperAdmin = user.role?.toUpperCase() === 'SUPER_ADMIN';

    if (!isSuperAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: 'Güvenlik ayarlarını güncellemek için super admin yetkisi gerekli',
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (!type || !['password', 'session', '2fa', 'general'].includes(type)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Geçersiz güvenlik türü (password, session, 2fa, general olmalı)',
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    let result;

    switch (type) {
      case 'password':
        result = await fetchMutation(api.security.updatePasswordPolicy, body);
        break;
      case 'session':
        result = await fetchMutation(api.security.updateSessionSettings, body);
        break;
      case '2fa':
        result = await fetchMutation(api.security.update2FASettings, body);
        break;
      case 'general':
        result = await fetchMutation(api.security.updateGeneralSecurity, body);
        break;
      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Geçersiz güvenlik türü',
          },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `${type.toUpperCase()} güvenlik ayarları güncellendi`,
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
        error: 'Güvenlik ayarları güncellenemedi',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export const PUT = mutationRateLimit(updateSecurityHandler);
