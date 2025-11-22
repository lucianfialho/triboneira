import { NextResponse } from 'next/server';
import { fixEventStatus } from '@/lib/jobs/maintenance/fix-event-status';
import { SyncLogger } from '@/lib/jobs/utils/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 1 minute

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

    // Run job
    const logger = new SyncLogger();
    await logger.start('fix-event-status');

    const fixedCount = await fixEventStatus(logger);

    return NextResponse.json({
      success: true,
      job: 'fix-event-status',
      fixedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in fix-event-status cron:', error);
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
