import { ContentTemplate, GeneratedContent } from '../types';

/**
 * Upset Templates
 */

// Instagram Feed - Upset Announcement
export const instagramUpsetTemplate: ContentTemplate = {
  id: 'instagram-upset-feed',
  category: 'upset',
  platform: 'instagram',
  format: 'feed',
  name: 'Upset Announcement',
  description: 'Dramatic upset announcement post',

  requiredFields: ['underdog', 'favorite', 'rankDifference', 'upsetLevel', 'score', 'matchId'],

  generate: (data): GeneratedContent => {
    const { underdog, favorite, rankDifference, upsetLevel, score } = data;

    // Determine intensity based on upset level
    const intensityMap: Record<string, { emoji: string; prefix: string }> = {
      minor: { emoji: '⚡', prefix: 'Surprise!' },
      moderate: { emoji: '🔥', prefix: 'UPSET!' },
      major: { emoji: '💥', prefix: 'MAJOR UPSET!' },
      massive: { emoji: '🚨', prefix: 'MASSIVE UPSET!' },
    };
    const intensity = intensityMap[upsetLevel] || { emoji: '⚡', prefix: 'UPSET!' };

    return {
      visual: {
        type: 'image',
        template: 'upset-announcement',
        data: {
          underdogLogo: underdog.logoUrl,
          favoriteLogo: favorite.logoUrl,
          underdogName: underdog.name,
          favoriteName: favorite.name,
          underdogRank: underdog.rank,
          favoriteRank: favorite.rank,
          rankDifference,
          score: `${score.team1} - ${score.team2}`,
          upsetLevel,
          background: upsetLevel === 'massive' || upsetLevel === 'major' ? 'red-explosion' : 'orange-gradient',
        },
      },

      text: {
        headline: `${intensity.prefix} ${underdog.name} defeats ${favorite.name}!`,
        caption:
          `${intensity.emoji} ${intensity.prefix.toUpperCase()}\n\n` +
          `#${underdog.rank} ${underdog.name} stuns #${favorite.rank} ${favorite.name}!\n\n` +
          `Final Score: ${score.team1}-${score.team2}\n` +
          `Rank Difference: ${rankDifference} places!\n\n` +
          `This is ${upsetLevel === 'massive' ? 'an absolutely MASSIVE' : upsetLevel === 'major' ? 'a MAJOR' : 'a significant'} upset in the CS2 scene!\n\n` +
          `Did you see this coming? 👀`,
        hashtags: ['CS2Upset', 'CS2', 'Esports', 'Underdog', underdog.name.replace(/\s/g, ''), favorite.name.replace(/\s/g, '')],
      },

      links: [
        {
          url: `https://www.hltv.org/matches/${data.matchId}`,
          title: 'Match Details',
        },
      ],
    };
  },
};

// Instagram Reel - Upset Reaction
export const instagramUpsetReelTemplate: ContentTemplate = {
  id: 'instagram-upset-reel',
  category: 'upset',
  platform: 'instagram',
  format: 'reel',
  name: 'Upset Reaction Reel',
  description: 'Short-form video announcing upset with drama',

  requiredFields: ['underdog', 'favorite', 'rankDifference', 'upsetLevel'],

  generate: (data): GeneratedContent => {
    const { underdog, favorite, rankDifference, upsetLevel } = data;

    return {
      visual: {
        type: 'video',
        template: 'upset-reel',
        data: {
          script: [
            {
              scene: 'setup',
              duration: 3,
              text: `#${favorite.rank} ${favorite.name}`,
              visuals: 'Show favorite team logo, confident',
            },
            {
              scene: 'vs',
              duration: 2,
              text: 'vs',
              visuals: 'VS animation',
            },
            {
              scene: 'underdog',
              duration: 3,
              text: `#${underdog.rank} ${underdog.name}`,
              visuals: 'Show underdog logo, determined',
            },
            {
              scene: 'upset',
              duration: 5,
              text: upsetLevel === 'massive' ? 'YOU WON\'T BELIEVE THIS...' : 'UPSET ALERT!',
              visuals: 'Dramatic reveal, explosion effects',
            },
            {
              scene: 'result',
              duration: 5,
              text: `${underdog.name} WINS!\n${rankDifference} rank difference!`,
              visuals: 'Show final score, celebration',
            },
          ],
          music: 'epic-dramatic',
          effects: ['slow-motion', 'explosion', 'shake'],
        },
      },

      text: {
        caption:
          `🚨 UPSET ALERT! 🚨\n\n` +
          `${underdog.name} (#${underdog.rank}) just shocked the world by defeating ${favorite.name} (#${favorite.rank})!\n\n` +
          `That's a ${rankDifference} rank difference! 😱\n\n` +
          `Follow for daily CS2 highlights! 🎮\n\n` +
          `#CS2 #Esports #Upset #Gaming #CounterStrike`,
        hashtags: ['CS2', 'Esports', 'Upset', 'Gaming', 'CounterStrike'],
      },
    };
  },
};

// Twitter - Upset Alert
export const twitterUpsetTemplate: ContentTemplate = {
  id: 'twitter-upset',
  category: 'upset',
  platform: 'twitter',
  format: 'tweet',
  name: 'Upset Alert Tweet',
  description: 'Quick upset announcement for Twitter',

  requiredFields: ['underdog', 'favorite', 'rankDifference', 'upsetLevel', 'score'],

  generate: (data): GeneratedContent => {
    const { underdog, favorite, rankDifference, upsetLevel, score } = data;

    const emojiMap: Record<string, string> = {
      minor: '⚡',
      moderate: '🔥',
      major: '💥',
      massive: '🚨🚨🚨',
    };
    const intensityEmoji = emojiMap[upsetLevel] || '⚡';

    const tweet =
      `${intensityEmoji} ${upsetLevel.toUpperCase()} UPSET ${intensityEmoji}\n\n` +
      `#${underdog.rank} ${underdog.name} DEFEATS #${favorite.rank} ${favorite.name}!\n\n` +
      `${score.team1}-${score.team2}\n\n` +
      `Rank difference: ${rankDifference} places!\n\n` +
      `#CS2 #Esports`;

    return {
      text: {
        caption: tweet,
        hashtags: ['CS2', 'Esports', 'Upset'],
      },
    };
  },
};

// Export all upset templates
export const upsetTemplates = [
  instagramUpsetTemplate,
  instagramUpsetReelTemplate,
  twitterUpsetTemplate,
];
