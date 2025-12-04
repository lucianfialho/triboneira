import { db } from './lib/db/client';
import { news } from './lib/db/schema';
import { desc, isNull } from 'drizzle-orm';
import { eq } from 'drizzle-orm';

/**
 * Extract featured image URL from HLTV news page HTML
 */
function extractImageUrl(html: string): string | null {
  // Look for og:image meta tag (most reliable)
  const ogImageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
  if (ogImageMatch) {
    return ogImageMatch[1];
  }

  // Fallback: Look for img-cdn.hltv.org images (featured image is usually the first large one)
  const imgMatch = html.match(/https?:\/\/img-cdn\.hltv\.org\/gallerypicture\/[^"'\s]+/i);
  if (imgMatch) {
    return imgMatch[0];
  }

  return null;
}

/**
 * Fetch and update image URLs for news items that don't have them
 */
async function updateNewsImages() {
  console.log('🖼️  Fetching news items without images...\n');

  // Get news items without imageUrl
  const newsWithoutImages = await db
    .select({
      id: news.id,
      title: news.title,
      link: news.link,
    })
    .from(news)
    .where(isNull(news.imageUrl))
    .orderBy(desc(news.publishedAt))
    .limit(20); // Process 20 at a time to avoid overwhelming HLTV

  console.log(`📰 Found ${newsWithoutImages.length} news items without images\n`);

  let updated = 0;
  let failed = 0;

  for (const item of newsWithoutImages) {
    const fullUrl = `https://www.hltv.org${item.link}`;

    try {
      console.log(`🔍 Fetching: ${item.title.substring(0, 60)}...`);

      const response = await fetch(fullUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        },
      });

      if (!response.ok) {
        console.log(`   ❌ Failed to fetch (${response.status})`);
        failed++;
        continue;
      }

      const html = await response.text();
      const imageUrl = extractImageUrl(html);

      if (imageUrl) {
        // Update database
        await db
          .update(news)
          .set({ imageUrl })
          .where(eq(news.id, item.id));

        console.log(`   ✅ Updated with image: ${imageUrl.substring(0, 80)}...`);
        updated++;
      } else {
        console.log(`   ⚠️  No image found`);
        failed++;
      }

      // Be nice to HLTV - wait 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error: any) {
      console.log(`   ❌ Error: ${error.message}`);
      failed++;
    }
  }

  console.log(`\n📊 Results:`);
  console.log(`   ✅ Updated: ${updated}`);
  console.log(`   ❌ Failed: ${failed}`);
}

updateNewsImages().catch(console.error);
