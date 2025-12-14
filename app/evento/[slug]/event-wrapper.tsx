'use client';

import { useState } from 'react';
import { EventPageTemplate, type Stream } from '@/components/templates/event-page-template';
import { EventDashboard, type SelectedStream } from '@/components/event-dashboard';

interface EventWrapperProps {
  eventId: string;
  eventName: string;
  slug: string;
}

/**
 * Client wrapper que gerencia a transição entre:
 * 1. EventDashboard - seleção de jogos e streams
 * 2. EventPageTemplate - multistream das streams selecionadas
 */
export function EventWrapper({ eventId, eventName, slug }: EventWrapperProps) {
  const [isMultistream, setIsMultistream] = useState(false);
  const [selectedStreams, setSelectedStreams] = useState<SelectedStream[]>([]);

  const handleStartMultistream = (streams: SelectedStream[]) => {
    setSelectedStreams(streams);
    setIsMultistream(true);
  };

  /**
   * Converte SelectedStream[] para função initialStreams
   * que o EventPageTemplate espera
   */
  const getInitialStreams = (isMobile: boolean): Stream[] => {
    // Limita streams baseado no dispositivo
    const limit = isMobile ? 1 : Math.min(selectedStreams.length, 4);
    return selectedStreams.slice(0, limit);
  };

  // Dashboard - seleção de streams
  if (!isMultistream) {
    return (
      <EventDashboard
        slug={slug}
        eventId={eventId}
        onStartMultistream={handleStartMultistream}
      />
    );
  }

  // Multistream - assistir streams selecionadas
  return (
    <EventPageTemplate
      eventId={eventId}
      initialStreams={getInitialStreams}
      eventLogo={`/events/${slug}.png`}
      storageKey={`multistream-evento-${slug}`}
    />
  );
}
