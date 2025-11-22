import { NextResponse } from 'next/server';
import HLTV from 'hltv';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET() {
  try {
    console.log('[TEST] Attempting to fetch matches from HLTV...');

    const matches = await HLTV.getMatches();

    return NextResponse.json({
      success: true,
      environment: 'production',
      matchesCount: matches.length,
      sample: matches.slice(0, 3),
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[TEST] Error fetching matches:', error.message);

    return NextResponse.json({
      success: false,
      error: error.message,
      isCloudflare: error.message.includes('Cloudflare'),
      environment: 'production',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
