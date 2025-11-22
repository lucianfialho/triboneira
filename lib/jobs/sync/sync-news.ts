import { db } from '../../db/client';
import { games, news } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { getHLTVClient } from '../../services/hltv/client';
import { SyncLogger } from '../utils/logger';

export async function syncNews(logger: SyncLogger) {
  console.log('📰 Syncing news from HLTV...\n');

  // Get active games
  const activeGames = await db
    .select()
    .from(games)
    .where(eq(games.active, true));

  if (activeGames.length === 0) {
    console.log('⚠️  No active games found');
    await logger.success(0);
    return 0;
  }

  const hltvClient = getHLTVClient();
  let totalSynced = 0;

  for (const game of activeGames) {
    if (game.slug !== 'cs2') {
      console.log(`⏭️  Skipping ${game.name} (not CS2)`);
      continue;
    }

    console.log(`🔄 Syncing news for ${game.name}...`);

    try {
      const hltvNews = await hltvClient.getNews();
      console.log(`   Found ${hltvNews.length} news items`);

      // Upsert news
      for (const newsItem of hltvNews) {
        // Use ID if available, otherwise use link hash
        const externalId = newsItem.id
          ? newsItem.id.toString()
          : Buffer.from(newsItem.link).toString('base64').substring(0, 100);

        await db
          .insert(news)
          .values({
            gameId: game.id,
            externalId,
            source: 'hltv',
            title: newsItem.title,
            description: newsItem.description || null,
            link: newsItem.link,
            publishedAt: new Date(newsItem.date),
            country: newsItem.country?.code || null,
            metadata: {
              countryName: newsItem.country?.name,
              originalId: newsItem.id,
            },
          })
          .onConflictDoUpdate({
            target: [news.externalId, news.source],
            set: {
              title: newsItem.title,
              description: newsItem.description || null,
              link: newsItem.link,
              publishedAt: new Date(newsItem.date),
              country: newsItem.country?.code || null,
              metadata: {
                countryName: newsItem.country?.name,
                originalId: newsItem.id,
              },
            },
          });

        totalSynced++;
      }

      console.log(`   ✅ Synced ${hltvNews.length} news items\n`);
    } catch (error: any) {
      console.error(`   ❌ Error syncing news for ${game.name}:`, error.message);
    }
  }

  await logger.success(totalSynced);
  return totalSynced;
}
