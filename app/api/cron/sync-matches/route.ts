import { NextResponse } from 'next/server';
import { syncMatches } from '@/lib/jobs/sync/sync-matches';
import { SyncLogger, withSyncLog } from '@/lib/jobs/utils/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes

export async function GET(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Run sync with logging (normal mode)
    const totalSynced = await withSyncLog(
      'sync-matches',
      async (logger: SyncLogger) => {
        return await syncMatches(logger, false);
      }
    );

    return NextResponse.json({
      success: true,
      job: 'sync-matches',
      mode: 'normal',
      itemsSynced: totalSynced,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in sync-matches cron:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
