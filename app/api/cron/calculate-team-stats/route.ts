import { NextResponse } from 'next/server';
import { calculateTeamStats } from '@/lib/jobs/calculate/calculate-team-stats';
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
      'calculate-team-stats',
      async (logger: SyncLogger) => {
        return await calculateTeamStats(logger);
      }
    );

    return NextResponse.json({
      success: true,
      job: 'calculate-team-stats',
      itemsCalculated: totalCalculated,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in calculate-team-stats cron:', error);
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
