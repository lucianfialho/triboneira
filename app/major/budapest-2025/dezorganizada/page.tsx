'use client';

import { EventPageTemplate, type Stream } from '@/components/templates/event-page-template';

export default function DezorganizadaPage() {
  const getDezorganizadaStreams = (isMobile: boolean): Stream[] => {
    // Dezorganizada streams - Gaules e canais relacionados
    return isMobile ? [
      {
        id: 'gaules',
        url: 'https://kick.com/gaules',
        platform: 'kick',
        title: 'Gaules - Major Budapest 2025',
        isMuted: false,
        volume: 50,
        channelName: 'gaules',
      },
      {
        id: 'gaulestv',
        url: 'https://kick.com/gaulestv',
        platform: 'kick',
        title: 'GaulesTV - Major Budapest 2025',
        isMuted: true,
        volume: 50,
        channelName: 'gaulestv',
      },
      {
        id: 'gaulestv2',
        url: 'https://kick.com/gaulestv2',
        platform: 'kick',
        title: 'GaulesTV2 - Major Budapest 2025',
        isMuted: true,
        volume: 50,
        channelName: 'gaulestv2',
      },
    ] : [
      {
        id: 'gaules',
        url: 'https://kick.com/gaules',
        platform: 'kick',
        title: 'Gaules - Major Budapest 2025',
        isMuted: false,
        volume: 50,
        channelName: 'gaules',
      },
      {
        id: 'gaulestv',
        url: 'https://kick.com/gaulestv',
        platform: 'kick',
        title: 'GaulesTV - Major Budapest 2025',
        isMuted: true,
        volume: 50,
        channelName: 'gaulestv',
      },
      {
        id: 'gaulestv2',
        url: 'https://kick.com/gaulestv2',
        platform: 'kick',
        title: 'GaulesTV2 - Major Budapest 2025',
        isMuted: true,
        volume: 50,
        channelName: 'gaulestv2',
      },
    ];
  };

  return (
    <EventPageTemplate
      eventId={16}
      initialStreams={getDezorganizadaStreams}
      eventLogo="/major-budapest-2025.png"
    />
  );
}
