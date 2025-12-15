import { MetadataRoute } from 'next';
import { db } from '@/lib/db/client';
import { events } from '@/lib/db/schema';
import { isNotNull } from 'drizzle-orm';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://entreganewba.com.br';
  const currentDate = new Date();

  // Guide slugs
  const guideSlugs = [
    'primeiro-setup',
    'layouts',
    'command-palette',
    'compartilhar',
    'audio',
    'descobrir',
    'performance',
  ];

  // Fetch eventos com slugs para incluir no sitemap
  const allEvents = await db.query.events.findMany({
    where: isNotNull(events.slug),
    columns: {
      slug: true,
      status: true,
      updatedAt: true,
    },
    orderBy: (events, { desc }) => [desc(events.dateStart)],
  });

  // Rotas estáticas
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'hourly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/guides`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    // Individual guide pages
    ...guideSlugs.map((slug) => ({
      url: `${baseUrl}/guides/${slug}`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Rotas dinâmicas de eventos
  const eventRoutes: MetadataRoute.Sitemap = allEvents
    .filter((event) => event.slug) // Apenas eventos com slug válido
    .map((event) => ({
      url: `${baseUrl}/evento/${event.slug}`,
      lastModified: event.updatedAt || currentDate,
      // Eventos ongoing atualizam a cada hora, outros diariamente
      changeFrequency: event.status === 'ongoing' ? ('hourly' as const) : ('daily' as const),
      // Eventos ongoing têm prioridade alta (0.9), outros média-alta (0.7)
      priority: event.status === 'ongoing' ? 0.9 : 0.7,
    }));

  return [...staticRoutes, ...eventRoutes];
}
