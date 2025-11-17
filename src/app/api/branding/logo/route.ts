/**
 * POST /api/branding/logo
 * Upload and update organization logos
 * Supports: main_logo, logo_dark, favicon, email_logo
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuthenticatedUser, buildErrorResponse } from '@/lib/api/auth-utils';
import { mutationRateLimit } from '@/lib/rate-limit';
import { fetchMutation } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';

async function uploadLogoHandler(request: NextRequest) {
  try {
    // Require authentication - only admins can upload logos
    const { user } = await requireAuthenticatedUser();

    const isAdmin =
      user.role?.toUpperCase() === 'ADMIN' || user.role?.toUpperCase() === 'SUPER_ADMIN';

    if (!isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: 'Logo yüklemek için admin yetkisi gerekli',
        },
        { status: 403 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const logoType = formData.get('logoType') as string;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: 'Dosya bulunamadı',
        },
        { status: 400 }
      );
    }

    if (!logoType || !['main_logo', 'logo_dark', 'favicon', 'email_logo'].includes(logoType)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Geçersiz logo türü',
        },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Sadece PNG, JPG, WEBP ve SVG formatları destekleniyor',
        },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: 'Dosya boyutu maksimum 5MB olabilir',
        },
        { status: 400 }
      );
    }

    // Convert file to base64 for Convex storage
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');

    // Create a temporary URL (in production, you'd upload to Convex storage)
    // For now, we'll simulate storage ID and URL
    const storageId = `${Date.now()}_${file.name}`;
    const url = `data:${file.type};base64,${base64}`;

    // Update logo in database
    await fetchMutation(api.branding.updateLogo, {
      logoType: logoType as 'main_logo' | 'logo_dark' | 'favicon' | 'email_logo',
      storageId,
      url,
    });

    return NextResponse.json({
      success: true,
      message: 'Logo başarıyla yüklendi',
      data: {
        logoType,
        url,
        storageId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      },
    });
  } catch (error) {
    const authError = buildErrorResponse(error);
    if (authError) {
      return NextResponse.json(authError.body, { status: authError.status });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Logo yüklenemedi',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export const POST = mutationRateLimit(uploadLogoHandler);

/**
 * DELETE /api/branding/logo
 * Remove a logo
 */
async function deleteLogoHandler(request: NextRequest) {
  try {
    const { user } = await requireAuthenticatedUser();

    const isAdmin =
      user.role?.toUpperCase() === 'ADMIN' || user.role?.toUpperCase() === 'SUPER_ADMIN';

    if (!isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: 'Logo silmek için admin yetkisi gerekli',
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const logoType = searchParams.get('logoType');

    if (!logoType || !['main_logo', 'logo_dark', 'favicon', 'email_logo'].includes(logoType)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Geçersiz logo türü',
        },
        { status: 400 }
      );
    }

    const result = await fetchMutation(api.branding.removeLogo, {
      logoType: logoType as 'main_logo' | 'logo_dark' | 'favicon' | 'email_logo',
    });

    return NextResponse.json(result);
  } catch (error) {
    const authError = buildErrorResponse(error);
    if (authError) {
      return NextResponse.json(authError.body, { status: authError.status });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Logo silinemedi',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export const DELETE = mutationRateLimit(deleteLogoHandler);
