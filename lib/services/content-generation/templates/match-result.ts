import { ContentTemplate, GeneratedContent } from '../types';

/**
 * Match Result Templates
 */

// Instagram Feed - Match Result Card
export const instagramMatchResultTemplate: ContentTemplate = {
  id: 'instagram-match-result-feed',
  category: 'match-result',
  platform: 'instagram',
  format: 'feed',
  name: 'Match Result Card',
  description: 'Standard match result post with score and teams',

  requiredFields: ['team1', 'team2', 'score', 'winner', 'event', 'matchId'],

  generate: (data): GeneratedContent => {
    const { team1, team2, score, winner, event, format, maps } = data;

    // Determine winner for caption
    const winnerName = winner?.name || team1.name;
    const loserName = winner?.name === team1.name ? team2.name : team1.name;

    // Build maps text
    let mapsText = '';
    if (maps && maps.length > 0) {
      mapsText = maps
        .map((m: any, i: number) => {
          const mapName = m.mapName || m.name;
          const scoreText = `${m.team1Score}-${m.team2Score}`;
          return `Map ${i + 1} (${mapName}): ${scoreText}`;
        })
        .join('\n');
    }

    return {
      visual: {
        type: 'image',
        template: 'match-result-card',
        data: {
          team1Logo: team1.logoUrl,
          team2Logo: team2.logoUrl,
          team1Name: team1.name,
          team2Name: team2.name,
          score: `${score.team1} - ${score.team2}`,
          event: event?.name || '',
          format: format || 'BO3',
          winnerSide: winner?.name === team1.name ? 'left' : 'right',
        },
      },

      text: {
        headline: `${winnerName} defeats ${loserName}`,
        caption: `🏆 ${winnerName} takes the win!\n\n` +
          `${team1.name} ${score.team1} - ${score.team2} ${team2.name}\n\n` +
          (mapsText ? `${mapsText}\n\n` : '') +
          `📍 ${event?.name || 'Tournament'}\n\n` +
          `What did you think of this match? 💬`,
        hashtags: ['CS2', 'CSGO', 'Esports', team1.name.replace(/\s/g, ''), team2.name.replace(/\s/g, '')],
      },

      links: [
        {
          url: `https://www.hltv.org/matches/${data.matchId}`,
          title: 'View on HLTV',
        },
      ],
    };
  },
};

// Instagram Story - Quick Match Update
export const instagramMatchResultStoryTemplate: ContentTemplate = {
  id: 'instagram-match-result-story',
  category: 'match-result',
  platform: 'instagram',
  format: 'story',
  name: 'Match Result Story',
  description: 'Quick match result update for stories',

  requiredFields: ['team1', 'team2', 'score', 'winner'],

  generate: (data): GeneratedContent => {
    const { team1, team2, score, winner } = data;

    return {
      visual: {
        type: 'image',
        template: 'match-result-story',
        data: {
          team1Logo: team1.logoUrl,
          team2Logo: team2.logoUrl,
          team1Name: team1.name,
          team2Name: team2.name,
          score: `${score.team1} - ${score.team2}`,
          winnerSide: winner?.name === team1.name ? 'left' : 'right',
          background: 'gradient-blue',
        },
      },

      text: {
        caption: `${winner?.name || team1.name} wins!`,
      },
    };
  },
};

// Twitter/X - Match Result Tweet
export const twitterMatchResultTemplate: ContentTemplate = {
  id: 'twitter-match-result',
  category: 'match-result',
  platform: 'twitter',
  format: 'tweet',
  name: 'Match Result Tweet',
  description: 'Concise match result for Twitter',

  requiredFields: ['team1', 'team2', 'score', 'winner', 'event'],

  generate: (data): GeneratedContent => {
    const { team1, team2, score, winner, event, maps } = data;

    let mapsEmoji = '';
    if (maps && maps.length > 0) {
      mapsEmoji = maps.map((m: any) => {
        const team1Won = m.team1Score > m.team2Score;
        return team1Won ? '🟢' : '🔴';
      }).join(' ');
    }

    const tweet =
      `🏆 ${winner?.name || team1.name} defeats ${winner?.name === team1.name ? team2.name : team1.name}!\n\n` +
      `${team1.name} ${score.team1} - ${score.team2} ${team2.name}\n` +
      (mapsEmoji ? `${mapsEmoji}\n` : '') +
      `\n📍 ${event?.name || 'Tournament'}\n\n` +
      `#CS2 #Esports`;

    return {
      text: {
        caption: tweet,
        hashtags: ['CS2', 'Esports'],
      },

      links: [
        {
          url: `https://www.hltv.org/matches/${data.matchId}`,
          title: 'Details',
        },
      ],
    };
  },
};

// Export all match result templates
export const matchResultTemplates = [
  instagramMatchResultTemplate,
  instagramMatchResultStoryTemplate,
  twitterMatchResultTemplate,
];
