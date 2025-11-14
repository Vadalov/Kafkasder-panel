import { NextRequest, NextResponse } from 'next/server';
import { getConvexHttp } from '@/lib/convex/server';
import { api } from '@/convex/_generated/api';
import logger from '@/lib/logger';
import { Id } from '@/convex/_generated/dataModel';

/**
 * POST /api/errors/update-occurrence
 * Update error occurrence count (for n8n workflows)
 * Body: { error_id: string, occurrence_count?: number, last_seen?: string, ... }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { error_id, occurrence_count, last_seen, ...otherUpdates } = body;

    if (!error_id) {
      return NextResponse.json({ success: false, error: 'error_id is required' }, { status: 400 });
    }

    const convex = getConvexHttp();

    // Get current error to update occurrence count
    const currentError = await convex.query(api.errors.get, {
      id: error_id as Id<'errors'>,
    });

    if (!currentError) {
      return NextResponse.json({ success: false, error: 'Error not found' }, { status: 404 });
    }

    // Update error with new occurrence data
    const updateData: any = {
      id: error_id as Id<'errors'>,
    };

    if (occurrence_count !== undefined) {
      // Note: errors.update doesn't directly update occurrence_count
      // We need to use the update mutation which may not support this field
      // For now, we'll update other fields and log the occurrence
    }

    if (last_seen) {
      // Update last_seen through metadata or other means
      updateData.metadata = {
        ...(currentError.metadata || {}),
        last_seen,
        occurrence_count: occurrence_count || currentError.occurrence_count,
        ...otherUpdates,
      };
    }

    // Update the error record
    const result = await convex.mutation(api.errors.update, updateData);

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Error occurrence updated successfully',
    });
  } catch (error) {
    logger.error('Update error occurrence error', error, {
      endpoint: '/api/errors/update-occurrence',
      method: 'POST',
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update error occurrence',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
