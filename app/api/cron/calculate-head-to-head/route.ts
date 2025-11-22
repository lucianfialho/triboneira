import { NextResponse } from 'next/server';
import { calculateHeadToHead } from '@/lib/jobs/calculate/calculate-head-to-head';
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

    // Run calculation with logging
    const totalCalculated = await withSyncLog(
      'calculate-head-to-head',
      async (logger: SyncLogger) => {
        return await calculateHeadToHead(logger);
      }
    );

    return NextResponse.json({
      success: true,
      job: 'calculate-head-to-head',
      itemsCalculated: totalCalculated,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in calculate-head-to-head cron:', error);
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
