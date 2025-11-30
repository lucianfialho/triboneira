import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, ExternalLink, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/db/client';
import { news, newsTranslations, newsSummaries, newsContentCache } from '@/lib/db/schema';
import { eq, or } from 'drizzle-orm';

export const revalidate = 3600; // Revalidate every hour

interface NewsDetail {
  id: number;
  title: string;
  originalTitle: string;
  slug: string;
  imageUrl: string | null;
  publishedAt: string;
  originalLink: string;
  isTranslated: boolean;
  content: string;
  summaryBullets?: Array<{ type: string; text: string }>;
  wordCount: number;
}

async function getNewsDetail(slug: string): Promise<NewsDetail | null> {
  try {
    const [newsItem] = await db
      .select({
        id: news.id,
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
      return null;
    }

    return {
      id: newsItem.id,
      title: newsItem.translatedTitle || newsItem.originalTitle,
      originalTitle: newsItem.originalTitle,
      slug: newsItem.slugPtBr || newsItem.slug || '',
      imageUrl: newsItem.imageUrl,
      publishedAt: newsItem.publishedAt?.toISOString() || '',
      originalLink: `https://www.hltv.org${newsItem.link}`,
      isTranslated: !!newsItem.translatedTitle,
      content: newsItem.translatedContent || newsItem.originalContent || '',
      summaryBullets: newsItem.summaryBullets as Array<{ type: string; text: string }> | undefined,
      wordCount: newsItem.wordCount || 0,
    };
  } catch (error) {
    console.error('Error fetching news detail:', error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const news = await getNewsDetail(slug);

  if (!news) {
    return {
      title: 'Notícia não encontrada | Triboneira',
    };
  }

  return {
    title: `${news.title} | Triboneira`,
    description: news.summaryBullets?.[0]?.text || news.title,
    keywords: 'CS2, Counter-Strike 2, esports, notícias, HLTV',
    openGraph: {
      title: news.title,
      description: news.summaryBullets?.[0]?.text || news.title,
      type: 'article',
      publishedTime: news.publishedAt,
      images: news.imageUrl ? [{ url: news.imageUrl }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: news.title,
      description: news.summaryBullets?.[0]?.text || news.title,
      images: news.imageUrl ? [news.imageUrl] : [],
    },
  };
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const news = await getNewsDetail(slug);

  if (!news) {
    notFound();
  }

  const formattedDate = new Date(news.publishedAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/noticias"
          className="inline-flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para notícias
        </Link>

        {/* Header */}
        <header className="mb-8">
          {/* Featured Image */}
          {news.imageUrl && (
            <div className="relative aspect-video rounded-xl overflow-hidden mb-6 border border-[hsl(var(--border))]">
              <Image
                src={news.imageUrl}
                alt={news.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl font-bold text-[hsl(var(--foreground))] mb-4 leading-tight">
            {news.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-[hsl(var(--muted-foreground))]">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <time>{formattedDate}</time>
            </div>

            {news.isTranslated && (
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                Traduzido PT-BR
              </Badge>
            )}

            <span>•</span>
            <span>{news.wordCount} palavras</span>
            <span>•</span>
            <a
              href={news.originalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-[hsl(var(--primary))] transition-colors"
            >
              Ver original no HLTV
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </header>

        {/* Summary */}
        {news.summaryBullets && news.summaryBullets.length > 0 && (
          <div className="glass-card p-6 mb-8 animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1 h-6 bg-[hsl(var(--primary))] rounded-full" />
              <h2 className="font-semibold text-lg text-[hsl(var(--foreground))]">
                📋 Resumo
              </h2>
            </div>
            <ul className="space-y-3">
              {news.summaryBullets.map((bullet, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Badge
                    variant="outline"
                    className="mt-0.5 capitalize bg-[hsl(var(--surface-elevated))] border-[hsl(var(--border))]"
                  >
                    {bullet.type}
                  </Badge>
                  <span className="flex-1 text-[hsl(var(--foreground))]">{bullet.text}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-slate dark:prose-invert max-w-none
            prose-headings:text-[hsl(var(--foreground))]
            prose-p:text-[hsl(var(--foreground))]
            prose-a:text-[hsl(var(--primary))]
            prose-strong:text-[hsl(var(--foreground))]
            prose-ul:text-[hsl(var(--foreground))]
            prose-ol:text-[hsl(var(--foreground))]
            prose-blockquote:text-[hsl(var(--muted-foreground))]
            prose-blockquote:border-[hsl(var(--border))]
            prose-code:text-[hsl(var(--primary))]
            prose-pre:bg-[hsl(var(--surface-elevated))]
            prose-pre:border
            prose-pre:border-[hsl(var(--border))]"
          dangerouslySetInnerHTML={{ __html: news.content }}
        />

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-[hsl(var(--border))]">
          <p className="text-sm text-[hsl(var(--muted-foreground))] text-center">
            Fonte original:{' '}
            <a
              href={news.originalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[hsl(var(--primary))] hover:underline"
            >
              HLTV.org
            </a>
          </p>
        </footer>
      </article>
    </div>
  );
}
