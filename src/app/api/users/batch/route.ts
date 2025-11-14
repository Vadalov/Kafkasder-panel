import { NextRequest, NextResponse } from 'next/server';
import { convexUsers } from '@/lib/convex/api';
import logger from '@/lib/logger';
import { Id } from '@/convex/_generated/dataModel';

/**
 * POST /api/users/batch
 * Get multiple users by IDs (for n8n workflows)
 * Body: { user_ids: string[] }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_ids } = body;

    if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'user_ids array is required' },
        { status: 400 }
      );
    }

    // Fetch users in parallel
    const userPromises = user_ids.map((id: string) =>
      convexUsers.get(id as Id<'users'>).catch(() => null)
    );

    const users = await Promise.all(userPromises);
    const validUsers = users.filter((user) => user !== null);

    return NextResponse.json({
      success: true,
      data: validUsers,
      total: validUsers.length,
    });
  } catch (error) {
    logger.error('Batch get users error', error, {
      endpoint: '/api/users/batch',
      method: 'POST',
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get users',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
