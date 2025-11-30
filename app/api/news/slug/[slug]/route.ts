import { db } from '@/lib/db/client';
import { news, newsTranslations, newsSummaries, newsContentCache } from '@/lib/db/schema';
import { eq, or } from 'drizzle-orm';

export async function GET(
    request: Request,
    context: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await context.params;

        const [newsItem] = await db
            .select({
                id: news.id,
                externalId: news.externalId,
                slug: news.slug,
                slugPtBr: news.slugPtBr,
                originalTitle: news.title,
                imageUrl: news.imageUrl,
                publishedAt: news.publishedAt,
                link: news.link,
                translatedTitle: newsTranslations.title,
                translatedContent: newsTranslations.content,
                summaryBullets: newsSummaries.bullets,
                originalContent: newsContentCache.content,
                wordCount: newsContentCache.wordCount,
            })
            .from(news)
            .leftJoin(newsTranslations, eq(newsTranslations.newsId, news.id))
            .leftJoin(newsSummaries, eq(newsSummaries.newsId, news.id))
            .leftJoin(newsContentCache, eq(newsContentCache.newsId, news.id))
            .where(
                or(
                    eq(news.slug, slug),
                    eq(news.slugPtBr, slug)
                )
            )
            .limit(1);

        if (!newsItem) {
            return Response.json({ error: 'News not found' }, { status: 404 });
        }

        return Response.json({
            id: newsItem.id,
            externalId: newsItem.externalId,
            title: newsItem.translatedTitle || newsItem.originalTitle,
            originalTitle: newsItem.originalTitle,
            slug: newsItem.slugPtBr || newsItem.slug,
            imageUrl: newsItem.imageUrl,
            publishedAt: newsItem.publishedAt,
            originalLink: `https://www.hltv.org${newsItem.link}`,
            isTranslated: !!newsItem.translatedTitle,
            content: newsItem.translatedContent || newsItem.originalContent,
            summaryBullets: newsItem.summaryBullets,
            wordCount: newsItem.wordCount || 0,
        });
    } catch (error) {
        console.error('Error fetching news by slug:', error);
        return Response.json({ error: 'Failed to fetch news' }, { status: 500 });
    }
}
