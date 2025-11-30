import OpenAI from 'openai';

/**
 * AI Tweet Generator
 * Uses GPT-4o-mini to generate varied, engaging tweets
 *
 * Used for 80% of tweets to:
 * - Add maximum variety and avoid spam detection
 * - Generate natural, human-like content
 * - Prevent repetitive patterns that trigger Twitter bans
 */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface MatchTweetData {
  winner: string;
  loser: string;
  score: string;
  eventName: string;
  mvpName?: string;
  mvpStats?: string;
  isUpset?: boolean;
  winnerRank?: number;
  loserRank?: number;
}

/**
 * Generate AI-powered match result tweet
 * Returns tweet content WITHOUT link (link is added after)
 */
export async function generateMatchTweet(data: MatchTweetData): Promise<string> {
  const upsetContext = data.isUpset
    ? `IMPORTANTE: Isso foi um UPSET! O time com rank menor venceu. Destaque isso!`
    : '';

  const mvpContext = data.mvpName && data.mvpStats
    ? `MVP: ${data.mvpName} (${data.mvpStats})`
    : '';

  const prompt = `Você é um analista de CS2 criando um tweet ENGAJADOR sobre uma partida que acabou de terminar:

**Resultado:**
${data.winner} ${data.score} ${data.loser}
Evento: ${data.eventName}
${mvpContext}
${upsetContext}

**Ranks:**
${data.winner}: ${data.winnerRank ? `#${data.winnerRank}` : 'N/A'}
${data.loser}: ${data.loserRank ? `#${data.loserRank}` : 'N/A'}

**Instruções:**
- Crie um tweet em PT-BR com NO MÁXIMO 200 caracteres
- Seja CRIATIVO e ENGAJADOR (não use templates genéricos)
- Se for upset, DESTAQUE isso de forma impactante
- Mencione o MVP se for relevante
- Use 1-2 emojis relevantes
- Não inclua hashtags ou links (vou adicionar depois)
- Tom: Casual mas informativo, como um caster empolgado

Responda APENAS com o texto do tweet, nada mais.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.9, // Alta criatividade
      max_tokens: 100,
    });

    return response.choices[0].message.content?.trim() || '';
  } catch (error: any) {
    console.error('❌ Error generating AI tweet:', error.message);
    // Fallback to empty (caller will use template instead)
    return '';
  }
}

/**
 * Check if we should use AI for this tweet (80% chance)
 * High percentage to avoid spam detection from repetitive patterns
 */
export function shouldUseAI(): boolean {
  return Math.random() < 0.8;
}
