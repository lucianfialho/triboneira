import { db } from '@/lib/db/client';
import { news, newsTranslations, newsSummaries, newsContentCache } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar, ExternalLink, Globe } from 'lucide-react';
import { notFound } from 'next/navigation';

export const revalidate = 600; // Cache for 10 minutes

export default async function NewsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const newsId = parseInt(id);

    if (isNaN(newsId)) {
        notFound();
    }

    const [newsItem] = await db
        .select({
            id: news.id,
            title: newsTranslations.title,
            originalTitle: news.title,
            content: newsTranslations.content,
            originalContent: newsContentCache.content,
            metadata: news.metadata,
            publishedAt: news.publishedAt,
            link: news.link,
            bullets: newsSummaries.bullets,
        })
        .from(news)
        .leftJoin(newsTranslations, eq(newsTranslations.newsId, news.id))
        .leftJoin(newsSummaries, eq(newsSummaries.newsId, news.id))
        .leftJoin(newsContentCache, eq(newsContentCache.newsId, news.id))
        .where(eq(news.id, newsId))
        .limit(1);

    if (!newsItem) {
        notFound();
    }

    const metadata = newsItem.metadata as any;
    const imageUrl = metadata?.imageUrl;
    const displayTitle = newsItem.title || newsItem.originalTitle;
    const displayContent = newsItem.content || newsItem.originalContent || metadata?.description || '';
    const isTranslated = !!newsItem.title;

    const formattedDate = newsItem.publishedAt
        ? new Date(newsItem.publishedAt).toLocaleDateString('pt-BR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
        : '';

    return (
        <main className="min-h-screen bg-[hsl(var(--background))] pb-20">
            {/* Header / Navigation */}
            <div className="sticky top-0 z-10 bg-[hsl(var(--background))]/80 backdrop-blur-md border-b border-[hsl(var(--border))]">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Voltar</span>
                    </Link>
                </div>
            </div>

            <article className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
                {/* Hero Image */}
                {imageUrl && (
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-8 shadow-2xl border border-[hsl(var(--border))]">
                        <Image
                            src={imageUrl}
                            alt={displayTitle}
                            fill
                            className="object-cover"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    </div>
                )}

                {/* Header Content */}
                <header className="mb-8">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                        {isTranslated && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-500 border border-green-500/20">
                                <Globe className="w-3.5 h-3.5" />
                                Traduzido PT-BR
                            </span>
                        )}
                        {formattedDate && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[hsl(var(--surface-elevated))] text-[hsl(var(--muted-foreground))] border border-[hsl(var(--border))]">
                                <Calendar className="w-3.5 h-3.5" />
                                {formattedDate}
                            </span>
                        )}
                    </div>

                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[hsl(var(--foreground))] leading-tight mb-6">
                        {displayTitle}
                    </h1>

                    {/* Summary Bullets */}
                    {(newsItem.bullets as any) && (newsItem.bullets as any).length > 0 && (
                        <div className="bg-[hsl(var(--surface-elevated))] border border-[hsl(var(--border))] rounded-xl p-6 mb-8">
                            <h2 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-4 flex items-center gap-2">
                                <span className="w-1 h-6 bg-[hsl(var(--primary))] rounded-full" />
                                Resumo Rápido
                            </h2>
                            <ul className="space-y-3">
                                {(newsItem.bullets as any).map((bullet: any, idx: number) => (
                                    <li key={idx} className="flex items-start gap-3 text-[hsl(var(--muted-foreground))]">
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[hsl(var(--primary))] shrink-0" />
                                        <span className="leading-relaxed">{bullet.text as string}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </header>

                {/* Main Content */}
                <div
                    className="prose prose-invert prose-lg max-w-none prose-headings:text-[hsl(var(--foreground))] prose-p:text-[hsl(var(--muted-foreground))] prose-a:text-[hsl(var(--primary))] prose-strong:text-[hsl(var(--foreground))]"
                    dangerouslySetInnerHTML={{ __html: displayContent }}
                />

                {/* Footer / Original Link */}
                <footer className="mt-12 pt-8 border-t border-[hsl(var(--border))]">
                    <a
                        href={newsItem.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-[hsl(var(--primary))] hover:underline font-medium transition-colors"
                    >
                        Ler notícia original no HLTV
                        <ExternalLink className="w-4 h-4" />
                    </a>
                </footer>
            </article>
        </main>
    );
}
