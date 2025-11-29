import { ContentTrigger } from './types';
import { getContentGenerator } from './content-generator';
import { getContentQueue } from './content-queue';
// import { detectUpset, detectOvertimes, detectEpicSeries } from '../../jobs/analysis/detect-upsets'; // Moved to cron-service

/**
 * Event Handlers
 * Handle different types of events and generate appropriate content
 */

/**
 * Handle match finished event
 */
export async function handleMatchFinished(matchId: number, matchData: any): Promise<void> {
  console.log(`\n🎮 Handling match finished event: ${matchId}`);

  const generateVisuals = process.env.GENERATE_VISUALS === 'true';
  console.log(`   📸 Visual generation: ${generateVisuals ? 'ENABLED' : 'DISABLED'} (GENERATE_VISUALS=${process.env.GENERATE_VISUALS})`);
  const generator = getContentGenerator({ generateVisuals });
  const queue = getContentQueue();

  // 1. Generate basic match result content
  const matchResultTrigger: ContentTrigger = {
    event: 'match.finished',
    data: matchData,
    timestamp: new Date(),
    priority: 'medium',
  };

  const matchResultContent = await generator.generateFromTrigger(matchResultTrigger);
  queue.enqueueBatch(matchResultContent);
  console.log(`  ✅ Generated ${matchResultContent.length} match result posts`);

  // NOTE: Upset/overtime/epic series detection moved to cron-service
  // Uncomment and implement these when integrating with cron-service

  // // 2. Check for upset
  // const upset = await detectUpset(matchId);
  // if (upset && upset.isUpset && upset.rankDifference >= 10) {
  //   console.log(`  🔥 UPSET DETECTED! ${upset.underdog.name} beats ${upset.favorite.name}`);

  //   const upsetTrigger: ContentTrigger = {
  //     event: 'upset.detected',
  //     data: {
  //       ...upset,
  //       matchId,
  //       score: matchData.score,
  //     },
  //     timestamp: new Date(),
  //     priority: 'high',
  //   };

  //   const upsetContent = await generator.generateFromTrigger(upsetTrigger);
  //   queue.enqueueBatch(upsetContent);
  //   console.log(`  ✅ Generated ${upsetContent.length} upset posts`);
  // }

  // // 3. Check for overtime
  // const overtime = await detectOvertimes(matchId);
  // if (overtime && overtime.totalOvertimes > 0) {
  //   console.log(`  ⏱️  OVERTIME DETECTED! ${overtime.totalOvertimes} maps went to OT`);

  //   const overtimeTrigger: ContentTrigger = {
  //     event: 'overtime.detected',
  //     data: {
  //       ...overtime,
  //       matchId,
  //     },
  //     timestamp: new Date(),
  //     priority: 'high',
  //   };

  //   const overtimeContent = await generator.generateFromTrigger(overtimeTrigger);
  //   queue.enqueueBatch(overtimeContent);
  //   console.log(`  ✅ Generated ${overtimeContent.length} overtime posts`);
  // }

  // // 4. Check for epic series
  // const epicSeries = await detectEpicSeries(matchId);
  // if (epicSeries) {
  //   console.log(`  💥 EPIC SERIES DETECTED! Went to map ${epicSeries.totalMaps}`);

  //   const epicSeriesTrigger: ContentTrigger = {
  //     event: 'epic-series.detected',
  //     data: {
  //       ...epicSeries,
  //       matchId,
  //     },
  //     timestamp: new Date(),
  //     priority: 'high',
  //   };

  //   const epicSeriesContent = await generator.generateFromTrigger(epicSeriesTrigger);
  //   queue.enqueueBatch(epicSeriesContent);
  //   console.log(`  ✅ Generated ${epicSeriesContent.length} epic series posts`);
  // }

  console.log(`✅ Match ${matchId} processing complete\n`);
}

/**
 * Handle daily recap event
 */
export async function handleDailyRecap(recap: any): Promise<void> {
  console.log(`\n📊 Handling daily recap event`);

  const generator = getContentGenerator();
  const queue = getContentQueue();

  // Generate daily recap content
  const recapTrigger: ContentTrigger = {
    event: 'daily.recap',
    data: recap,
    timestamp: new Date(),
    priority: 'medium',
  };

  const recapContent = await generator.generateFromTrigger(recapTrigger);
  queue.enqueueBatch(recapContent);
  console.log(`  ✅ Generated ${recapContent.length} daily recap posts`);

  // Generate top performances content if available
  if (recap.topPerformances && recap.topPerformances.length > 0) {
    for (let index = 0; index < recap.topPerformances.slice(0, 3).length; index++) {
      const performance = recap.topPerformances[index];
      const perfTrigger: ContentTrigger = {
        event: 'player.performance',
        data: {
          ...performance,
          rank: index + 1,
          date: recap.date,
        },
        timestamp: new Date(),
        priority: index === 0 ? 'high' : 'medium',
      };

      const perfContent = await generator.generateFromTrigger(perfTrigger);
      queue.enqueueBatch(perfContent);
    }

    console.log(`  ✅ Generated ${recap.topPerformances.length} player performance posts`);
  }

  console.log(`✅ Daily recap processing complete\n`);
}

/**
 * Handle player performance event
 */
export async function handlePlayerPerformance(matchId: number, playerData: any): Promise<void> {
  console.log(`\n⭐ Handling exceptional player performance: ${playerData.player.nickname}`);

  const generator = getContentGenerator();
  const queue = getContentQueue();

  const performanceTrigger: ContentTrigger = {
    event: 'player.performance',
    data: {
      ...playerData,
      matchId,
    },
    timestamp: new Date(),
    priority: playerData.stats.rating > 1.8 ? 'high' : 'medium',
  };

  const performanceContent = await generator.generateFromTrigger(performanceTrigger);
  queue.enqueueBatch(performanceContent);
  console.log(`  ✅ Generated ${performanceContent.length} player highlight posts\n`);
}

/**
 * Handle event starting
 */
export async function handleEventStarting(eventData: any): Promise<void> {
  console.log(`\n🎪 Handling event starting: ${eventData.name}`);

  const generator = getContentGenerator();
  const queue = getContentQueue();

  const eventTrigger: ContentTrigger = {
    event: 'event.starting',
    data: eventData,
    timestamp: new Date(),
    priority: 'high',
  };

  const eventContent = await generator.generateFromTrigger(eventTrigger);
  queue.enqueueBatch(eventContent);
  console.log(`  ✅ Generated ${eventContent.length} event announcement posts\n`);
}

/**
 * Process content queue
 * This should be called periodically to publish queued content
 */
export async function processContentQueue(
  publishCallback: (content: any) => Promise<boolean>
): Promise<void> {
  const queue = getContentQueue();
  const stats = queue.getStats();

  console.log(`\n📤 Processing content queue...`);
  console.log(`   Total items: ${stats.total}`);
  console.log(`   Ready: ${stats.byStatus.ready}`);
  console.log(`   High priority: ${stats.byPriority.high}`);

  // Process items one by one
  let processed = 0;
  let failed = 0;

  while (processed < 10) {
    // Process max 10 items per run
    const item = queue.dequeue();

    if (!item) {
      break; // No more items to process
    }

    try {
      console.log(`  📝 Publishing: ${item.id} (${item.platform} ${item.format})`);

      // Call the publish callback
      const success = await publishCallback(item);

      if (success) {
        queue.markPublished(item.id);
        processed++;
      } else {
        queue.markFailed(item.id, 'Publish callback returned false');
        failed++;
      }
    } catch (error: any) {
      console.error(`  ❌ Failed to publish ${item.id}:`, error.message);
      queue.markFailed(item.id, error.message);
      failed++;
    }
  }

  console.log(`✅ Queue processing complete:`);
  console.log(`   Published: ${processed}`);
  console.log(`   Failed: ${failed}\n`);
}
