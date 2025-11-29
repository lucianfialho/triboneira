import { db } from '@/lib/db/client';
import { news, newsTranslations, newsSummaries, newsContentCache } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const newsId = parseInt(id);

        if (isNaN(newsId)) {
            return Response.json({ error: 'Invalid news ID' }, { status: 400 });
        }

        const [newsItem] = await db
            .select({
                id: news.id,
                externalId: news.externalId,
                originalTitle: news.title,
                metadata: news.metadata,
                publishedAt: news.publishedAt,
                link: news.link,
                translatedTitle: newsTranslations.title,
                translatedContent: newsTranslations.content,
                summaryBullets: newsSummaries.bullets,
                originalContent: newsContentCache.content,
            })
            .from(news)
            .leftJoin(newsTranslations, eq(newsTranslations.newsId, news.id))
            .leftJoin(newsSummaries, eq(newsSummaries.newsId, news.id))
            .leftJoin(newsContentCache, eq(newsContentCache.newsId, news.id))
            .where(eq(news.id, newsId))
            .limit(1);

        if (!newsItem) {
            return Response.json({ error: 'News not found' }, { status: 404 });
        }

        const metadata = newsItem.metadata as any;

        return Response.json({
            id: newsItem.id,
            externalId: newsItem.externalId,
            title: newsItem.translatedTitle || newsItem.originalTitle,
            originalTitle: newsItem.originalTitle,
            imageUrl: metadata?.imageUrl || null,
            publishedAt: newsItem.publishedAt,
            link: newsItem.link,
            isTranslated: !!newsItem.translatedTitle,
            content: newsItem.translatedContent || newsItem.originalContent,
            summaryBullets: newsItem.summaryBullets,
        });
    } catch (error) {
        console.error('Error fetching news detail:', error);
        return Response.json({ error: 'Failed to fetch news detail' }, { status: 500 });
    }
}
