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
        channelName: 'gaules',
      },
      {
        id: 'gaulestv',
        url: 'https://kick.com/gaulestv',
        platform: 'kick',
        title: 'GaulesTV - Major Budapest 2025',
        isMuted: true,
        channelName: 'gaulestv',
      },
      {
        id: 'gaulestv2',
        url: 'https://kick.com/gaulestv2',
        platform: 'kick',
        title: 'GaulesTV2 - Major Budapest 2025',
        isMuted: true,
        channelName: 'gaulestv2',
      },
    ] : [
      {
        id: 'gaules',
        url: 'https://kick.com/gaules',
        platform: 'kick',
        title: 'Gaules - Major Budapest 2025',
        isMuted: false,
        channelName: 'gaules',
      },
      {
        id: 'gaulestv',
        url: 'https://kick.com/gaulestv',
        platform: 'kick',
        title: 'GaulesTV - Major Budapest 2025',
        isMuted: true,
        channelName: 'gaulestv',
      },
      {
        id: 'gaulestv2',
        url: 'https://kick.com/gaulestv2',
        platform: 'kick',
        title: 'GaulesTV2 - Major Budapest 2025',
        isMuted: true,
        channelName: 'gaulestv2',
      },
    ];
  };

  return (
    <EventPageTemplate
      eventId={15}
      initialStreams={getTriboneiraStreams}
      eventLogo="/major-budapest-2025.png"
    />
  );
}
