import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db/client';
import { events } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { EventWrapper } from './event-wrapper';

export const revalidate = 600; // ISR: 10 minutos

interface EventPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Busca evento por slug no banco de dados
 */
async function getEventBySlug(slug: string) {
  try {
    return await db.query.events.findFirst({
      where: eq(events.slug, slug),
      columns: {
        id: true,
        externalId: true,
        name: true,
        slug: true,
        prizePool: true,
        location: true,
      },
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    return null;
  }
}

/**
 * Gera metadata para SEO
 */
export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    return {
      title: 'Evento não encontrado | Triboneira',
    };
  }

  const title = `${event.name} - Ao Vivo | Triboneira`;
  const description = `Assista ao vivo ${event.name}${event.prizePool ? `. Prize Pool: ${event.prizePool}` : ''}${event.location ? `. Local: ${event.location}` : ''}. Multistream de CS2 com os melhores streamers.`;

  return {
    title,
    description,
    keywords: [
      'CS2',
      'Counter-Strike 2',
      'esports',
      'ao vivo',
      'streaming',
      'multistream',
      event.name,
      event.location || '',
    ].filter(Boolean).join(', '),
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'pt_BR',
      siteName: 'Triboneira',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `/evento/${slug}`,
    },
  };
}

/**
 * Página dinâmica de evento - /evento/[slug]
 * Server Component que busca dados e passa para Client Component wrapper
 *
 * Fluxo:
 * 1. Usuário vê EventDashboard com jogos e streams disponíveis
 * 2. Seleciona quais streams assistir
 * 3. Clica em "Assistir" e vai para o multistream
 */
export default async function EventoPage({ params }: EventPageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  return (
    <EventWrapper
      eventId={event.externalId}
      eventName={event.name}
      slug={slug}
    />
  );
}
