/**
 * Integration Example
 * Shows how to integrate content generation with existing cron jobs
 */

import { handleMatchFinished, handleDailyRecap, processContentQueue } from '../event-handlers';
import { getContentQueue } from '../content-queue';
import { getContentGenerator } from '../content-generator';
import { getVisualGenerator } from '../visual-generator';
import { ContentTrigger } from '../types';

/**
 * Example: Integrate with sync-matches job
 *
 * Add this to the end of sync-matches.ts after a match is synced
 */
export async function exampleMatchIntegration(skipDetectors = false, generateVisuals = false) {
  // After syncing a match that just finished
  const matchId = 2378954;
  const matchData = {
    team1: {
      id: 4608,
      name: 'FaZe',
      logoUrl: 'https://example.com/faze-logo.png',
      rank: 3,
    },
    team2: {
      id: 5995,
      name: 'Vitality',
      logoUrl: 'https://example.com/vitality-logo.png',
      rank: 2,
    },
    winner: {
      id: 4608,
      name: 'FaZe',
    },
    score: {
      team1: 2,
      team2: 1,
    },
    maps: [
      { mapName: 'Mirage', team1Score: 16, team2Score: 13 },
      { mapName: 'Dust2', team1Score: 14, team2Score: 16 },
      { mapName: 'Inferno', team1Score: 16, team2Score: 14 },
    ],
    format: 'bo3',
    event: {
      name: 'IEM Katowice 2025',
    },
    matchId,
  };

  // Generate content automatically
  if (skipDetectors) {
    // Demo mode: Only generate basic match result
    const generator = getContentGenerator({ generateVisuals });
    const queue = getContentQueue();

    const matchResultTrigger: ContentTrigger = {
      event: 'match.finished',
      data: matchData,
      timestamp: new Date(),
      priority: 'medium',
    };

    const matchResultContent = await generator.generateFromTrigger(matchResultTrigger);
    queue.enqueueBatch(matchResultContent);
    console.log(`  ✅ Generated ${matchResultContent.length} match result posts (demo mode)`);

    // Simulate upset detection
    console.log(`  🔥 [SIMULATED] UPSET DETECTED! MOUZ (#15) beats FaZe (#3)`);
    const upsetTrigger: ContentTrigger = {
      event: 'upset.detected',
      data: {
        underdog: { name: 'MOUZ', rank: 15, logoUrl: 'https://example.com/mouz.png' },
        favorite: { name: 'FaZe', rank: 3, logoUrl: 'https://example.com/faze.png' },
        rankDifference: 12,
        upsetLevel: 'major',
        score: matchData.score,
        matchId,
      },
      timestamp: new Date(),
      priority: 'high',
    };
    const upsetContent = await generator.generateFromTrigger(upsetTrigger);
    queue.enqueueBatch(upsetContent);
    console.log(`  ✅ Generated ${upsetContent.length} upset posts (simulated)`);
  } else {
    await handleMatchFinished(matchId, matchData);
  }

  // Content is now in queue, ready to be published
}

/**
 * Example: Integrate with daily-recap job
 *
 * Add this to the end of daily-recap.ts
 */
export async function exampleDailyRecapIntegration() {
  const recap = {
    date: new Date('2025-11-23'),
    summary: {
      totalMatches: 12,
      totalEvents: 3,
      totalUpsets: 2,
      totalOvertimes: 3,
      epicSeries: 1,
    },
    topPerformances: [
      {
        player: { id: 1234, nickname: 's1mple' },
        team: { id: 5995, name: 'Vitality' },
        match: { id: 2378954, externalId: '2378954' },
        stats: {
          kills: 28,
          deaths: 15,
          assists: 7,
          rating: '1.85',
          adr: '95.3',
        },
      },
    ],
    upsets: [
      {
        matchId: 2378955,
        favorite: { name: 'FaZe', rank: 3 },
        underdog: { name: 'MOUZ', rank: 15 },
        rankDifference: 12,
        upsetLevel: 'major',
      },
    ],
  };

  // Generate content automatically
  await handleDailyRecap(recap);
}

/**
 * Example: Publishing content (mock)
 *
 * This shows how you would publish content to actual platforms
 */
export async function examplePublishFlow() {
  // Mock publish function
  const publishToInstagram = async (content: any): Promise<boolean> => {
    console.log('📱 Publishing to Instagram...');
    console.log('   Format:', content.format);
    console.log('   Caption:', content.data.generated.text.caption?.substring(0, 100) + '...');

    // Here you would:
    // 1. Generate the image/video using the template
    // 2. Upload to Instagram API
    // 3. Return success/failure

    return true; // Mock success
  };

  const publishToTwitter = async (content: any): Promise<boolean> => {
    console.log('🐦 Publishing to Twitter...');
    console.log('   Tweet:', content.data.generated.text.caption);

    // Here you would:
    // 1. Format the tweet
    // 2. Upload media if any
    // 3. Post via Twitter API
    // 4. Return success/failure

    return true; // Mock success
  };

  // Process queue with platform-specific publishers
  await processContentQueue(async (content) => {
    switch (content.platform) {
      case 'instagram':
        return await publishToInstagram(content);
      case 'twitter':
        return await publishToTwitter(content);
      default:
        console.warn(`No publisher for platform: ${content.platform}`);
        return false;
    }
  });
}

/**
 * Example: Content Queue Management
 */
export function exampleQueueManagement() {
  const queue = getContentQueue();

  // Get stats
  const stats = queue.getStats();
  console.log('📊 Queue Stats:', stats);

  // Get high priority items
  const highPriority = queue.getByPriority('high');
  console.log(`🔥 ${highPriority.length} high priority items`);

  // Get Instagram items
  const instagramItems = queue.getByPlatform('instagram');
  console.log(`📱 ${instagramItems.length} Instagram posts queued`);

  // Cleanup old published items
  const cleaned = queue.cleanup(7); // Remove items older than 7 days
  console.log(`🗑️  Cleaned ${cleaned} old items`);
}

/**
 * Example: Full workflow
 */
export async function exampleFullWorkflow(demoMode = false, generateVisuals = false) {
  console.log('\n🚀 Starting content generation workflow...\n');

  if (demoMode) {
    console.log('💡 Running in DEMO MODE (no database required)\n');
  }

  if (generateVisuals) {
    console.log('🎨 Visual generation ENABLED\n');
  }

  // Step 1: Generate content from a match
  await exampleMatchIntegration(demoMode, generateVisuals);

  // Step 2: Generate content from daily recap (skip in demo mode)
  if (!demoMode) {
    await exampleDailyRecapIntegration();
  } else {
    console.log('\n📊 [SKIPPED] Daily recap (requires database)\n');
  }

  // Step 3: Check queue status
  const queue = getContentQueue();
  const stats = queue.getStats();
  console.log('\n📊 Current Queue Status:');
  console.log(`   Total: ${stats.total}`);
  console.log(`   Ready: ${stats.byStatus.ready}`);
  console.log(`   High Priority: ${stats.byPriority.high}`);
  console.log(`   Instagram: ${queue.getByPlatform('instagram').length}`);
  console.log(`   Twitter: ${queue.getByPlatform('twitter').length}`);

  // Step 4: Show generated content details
  if (generateVisuals) {
    console.log('\n🖼️  Generated Visual Files:');
    const allItems = queue.getByStatus('ready');
    allItems.forEach(item => {
      const visual = item.data?.generated?.visual;
      if (visual?.filePath) {
        console.log(`   📁 ${item.platform} ${item.format}: ${visual.filePath}`);
        console.log(`      Size: ${visual.dimensions?.width}x${visual.dimensions?.height}`);
      }
    });
  }

  // Step 5: Process queue (publish content)
  console.log('\n📤 Processing queue...\n');
  await examplePublishFlow();

  // Step 6: Final stats
  const finalStats = queue.getStats();
  console.log('\n✅ Workflow Complete!');
  console.log(`   Published: ${finalStats.byStatus.published}`);
  console.log(`   Failed: ${finalStats.byStatus.failed}`);
  console.log(`   Remaining: ${finalStats.byStatus.ready}\n`);
}

// Run the example if this file is executed directly
if (require.main === module) {
  // Check if DATABASE_URL is set
  const demoMode = !process.env.DATABASE_URL;

  // Check if visual generation should be enabled
  const generateVisuals = process.env.GENERATE_VISUALS === 'true';

  if (demoMode) {
    console.log('\n⚠️  DATABASE_URL not set - running in DEMO MODE');
    console.log('Set DATABASE_URL in .env.local to run with real database\n');
  }

  if (!generateVisuals) {
    console.log('💡 Set GENERATE_VISUALS=true to generate actual images\n');
  }

  exampleFullWorkflow(demoMode, generateVisuals)
    .then(async () => {
      // Cleanup visual generator if used
      if (generateVisuals) {
        const visualGenerator = getVisualGenerator();
        await visualGenerator.close();
      }

      console.log('✅ Example completed successfully');
      process.exit(0);
    })
    .catch(async (error) => {
      console.error('❌ Example failed:', error);

      // Cleanup visual generator if used
      if (generateVisuals) {
        const visualGenerator = getVisualGenerator();
        await visualGenerator.close();
      }

      process.exit(1);
    });
}
