import { db } from './lib/db/client';
import { news } from './lib/db/schema';
import { desc } from 'drizzle-orm';

async function checkMetadata() {
  const result = await db
    .select({
      id: news.id,
      title: news.title,
      link: news.link,
      imageUrl: news.imageUrl,
      metadata: news.metadata
    })
    .from(news)
    .orderBy(desc(news.publishedAt))
    .limit(1);

  console.log(JSON.stringify(result[0], null, 2));
}

checkMetadata().catch(console.error);
