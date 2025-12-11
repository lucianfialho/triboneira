'use client';

import { EventPageTemplate, type Stream } from '@/components/templates/event-page-template';

export default function TriboneiraPage() {
  const getTriboneiraStreams = (isMobile: boolean): Stream[] => {
    // Triboneira streams - Gaules e canais relacionados
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
        id: 'michel',
        url: 'https://kick.com/michel',
        platform: 'kick',
        title: 'Michel - Major Budapest 2025',
        isMuted: true,
        volume: 50,
        channelName: 'michel',
      },
      {
        id: 'tacocs',
        url: 'https://kick.com/tacocs',
        platform: 'kick',
        title: 'TacoCS - Major Budapest 2025',
        isMuted: true,
        volume: 50,
        channelName: 'tacocs',
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
        id: 'michel',
        url: 'https://kick.com/michel',
        platform: 'kick',
        title: 'Michel - Major Budapest 2025',
        isMuted: true,
        volume: 50,
        channelName: 'michel',
      },
      {
        id: 'tacocs',
        url: 'https://kick.com/tacocs',
        platform: 'kick',
        title: 'TacoCS - Major Budapest 2025',
        isMuted: true,
        volume: 50,
        channelName: 'tacocs',
      },
    ];
  };

  return (
    <EventPageTemplate
      eventId={16}
      initialStreams={getTriboneiraStreams}
      eventLogo="/major-budapest-2025.png"
    />
  );
}
