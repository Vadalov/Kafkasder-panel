/**
 * Error Statistics and Trends API
 * GET /api/errors/stats - Get error statistics (requires auth and admin permission)
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchQuery } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';
import { createLogger } from '@/lib/logger';
import { requireAuthenticatedUser, buildErrorResponse } from '@/lib/api/auth-utils';
import { readOnlyRateLimit } from '@/lib/rate-limit';

const logger = createLogger('api:errors:stats');

/**
 * GET /api/errors/stats
 * Get error statistics
 * Requires authentication and admin permissions
 *
 * SECURITY CRITICAL: Error statistics contain sensitive system information
 */
async function getErrorStatsHandler(request: NextRequest) {
  try {
    // Require authentication - error stats are sensitive system data
    const { user } = await requireAuthenticatedUser();

    // Only admins can view error statistics
    const isAdmin =
      user.role?.toUpperCase() === 'ADMIN' || user.role?.toUpperCase() === 'SUPER_ADMIN';
    if (!isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: 'Hata istatistiklerini görüntülemek için admin yetkisi gerekli',
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');

    logger.info('Fetching error statistics', { start_date, end_date });

    const stats = await fetchQuery(api.errors.getStats, {
      start_date: start_date || undefined,
      end_date: end_date || undefined,
    });

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    const authError = buildErrorResponse(error);
    if (authError) {
      return NextResponse.json(authError.body, { status: authError.status });
    }

    logger.error('Failed to fetch error statistics', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch error statistics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Export handler with rate limiting
export const GET = readOnlyRateLimit(getErrorStatsHandler);
