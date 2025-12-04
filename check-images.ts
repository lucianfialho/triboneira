import { db } from './lib/db/client';
import { news } from './lib/db/schema';
import { desc } from 'drizzle-orm';

async function checkImages() {
  const recentNews = await db
    .select({
      id: news.id,
      title: news.title,
      imageUrl: news.imageUrl,
      metadata: news.metadata,
    })
    .from(news)
    .orderBy(desc(news.publishedAt))
    .limit(5);

  console.log('📰 5 notícias mais recentes:\n');
  recentNews.forEach((n, i) => {
    const metadata = n.metadata as any;
    const metadataImage = metadata?.imageUrl;

    console.log(`${i + 1}. ${n.title.substring(0, 60)}`);
    console.log(`   imageUrl field: ${n.imageUrl || 'NULL'}`);
    console.log(`   metadata.imageUrl: ${metadataImage || 'NULL'}`);
    console.log('');
  });
}

checkImages().catch(console.error);
