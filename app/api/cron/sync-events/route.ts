import { NextResponse } from 'next/server';
import { syncEvents } from '@/lib/jobs/sync/sync-events';
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

    // Run sync with logging
    const totalSynced = await withSyncLog(
      'sync-events',
      async (logger: SyncLogger) => {
        return await syncEvents(logger);
      }
    );

    return NextResponse.json({
      success: true,
      job: 'sync-events',
      itemsSynced: totalSynced,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in sync-events cron:', error);
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
