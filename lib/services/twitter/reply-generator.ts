import OpenAI from 'openai';
import { db } from '../../db/client';
import { teams, matches, events } from '../../db/schema';
import { desc, eq, and, gte, sql } from 'drizzle-orm';

/**
 * Reply Generator with GPT-4o-nano
 * Generates contextual, engaging replies to Twitter mentions
 */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface MentionContext {
  username: string;
  content: string;
  category: string | null;
  sentiment: string | null;
}

/**
 * Fetch relevant context from database based on mention content
 */
async function fetchRelevantContext(content: string): Promise<string> {
  const lowerContent = content.toLowerCase();
  let context = '';

  // Check if asking about specific team
  const teamNames = ['furia', 'liquid', 'faze', 'navi', 'vitality', 'g2', 'mouz', 'spirit'];
  const mentionedTeam = teamNames.find(team => lowerContent.includes(team));

  if (mentionedTeam) {
    const teamData = await db
      .select()
      .from(teams)
      .where(sql`LOWER(${teams.name}) LIKE ${`%${mentionedTeam}%`}`)
      .limit(1);

    if (teamData.length > 0) {
      const team = teamData[0];
      context += `\n**Time ${team.name}:**\n`;
      context += `- Rank mundial: #${team.rank || 'N/A'}\n`;
      context += `- País: ${team.country}\n`;
    }
  }

  // Check if asking about upcoming matches
  if (lowerContent.includes('próximo') || lowerContent.includes('quando') || lowerContent.includes('jogo')) {
    const upcomingMatches = await db
      .select({
        team1: sql<string>`t1.name`,
        team2: sql<string>`t2.name`,
        date: matches.date,
        event: events.name,
      })
      .from(matches)
      .innerJoin(sql`teams AS t1`, eq(matches.team1Id, sql`t1.id`))
      .innerJoin(sql`teams AS t2`, eq(matches.team2Id, sql`t2.id`))
      .leftJoin(events, eq(matches.eventId, events.id))
      .where(
        and(
          eq(matches.status, 'scheduled'),
          gte(matches.date, new Date())
        )
      )
      .orderBy(matches.date)
      .limit(3);

    if (upcomingMatches.length > 0) {
      context += `\n**Próximas partidas:**\n`;
      upcomingMatches.forEach((match) => {
        const dateStr = match.date ? new Date(match.date).toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }) : 'TBD';
        context += `- ${match.team1} vs ${match.team2} (${match.event}) - ${dateStr}\n`;
      });
    }
  }

  // Check if asking about recent results
  if (lowerContent.includes('resultado') || lowerContent.includes('ganhou') || lowerContent.includes('venceu')) {
    const recentMatches = await db
      .select({
        team1: sql<string>`t1.name`,
        team2: sql<string>`t2.name`,
        score1: matches.scoreTeam1,
        score2: matches.scoreTeam2,
        winner: sql<string>`tw.name`,
        event: events.name,
      })
      .from(matches)
      .innerJoin(sql`teams AS t1`, eq(matches.team1Id, sql`t1.id`))
      .innerJoin(sql`teams AS t2`, eq(matches.team2Id, sql`t2.id`))
      .innerJoin(sql`teams AS tw`, eq(matches.winnerId, sql`tw.id`))
      .leftJoin(events, eq(matches.eventId, events.id))
      .where(eq(matches.status, 'finished'))
      .orderBy(desc(matches.updatedAt))
      .limit(3);

    if (recentMatches.length > 0) {
      context += `\n**Resultados recentes:**\n`;
      recentMatches.forEach((match) => {
        context += `- ${match.winner} venceu! ${match.team1} ${match.score1}-${match.score2} ${match.team2} (${match.event})\n`;
      });
    }
  }

  return context || '\n(Nenhum dado específico encontrado no banco)';
}

/**
 * Generate AI reply to mention using GPT-4o-nano
 */
export async function generateReply(mention: MentionContext): Promise<string> {
  try {
    // Fetch relevant context from database
    const dbContext = await fetchRelevantContext(mention.content);

    const systemPrompt = `Você é o bot oficial do entreganewba.com.br, um site de multistream de CS2.

**Personalidade:**
- Tom casual, divertido, como um caster empolgado
- Use emojis moderadamente (1-2 por reply)
- Seja útil e informativo
- Nunca seja rude, mesmo se a pessoa for
- Sempre termine com call-to-action pro site

**Regras:**
- Máximo 200 caracteres
- Use PT-BR
- Seja objetivo
- Se não souber algo, admita e convide pra assistir os jogos
- SEMPRE inclua link do site no final: entreganewba.com.br/major/budapest-2025/

**Dados disponíveis:**
${dbContext}`;

    const userPrompt = `Usuário @${mention.username} mencionou:
"${mention.content}"

Categoria detectada: ${mention.category || 'outro'}
Sentimento: ${mention.sentiment || 'neutro'}

Gere uma resposta natural e engajadora.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-5-nano-2025-08-07', // GPT-5 Nano - mais rápido e barato
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.8, // Criatividade moderada
      max_tokens: 100,
    });

    const reply = response.choices[0].message.content?.trim() || '';

    if (!reply) {
      throw new Error('AI returned empty reply');
    }

    return reply;

  } catch (error: any) {
    console.error('❌ Error generating AI reply:', error.message);

    // Fallback to generic reply
    return `Opa @${mention.username}! 👋 No momento tô processando muita info, mas cola no site que tem tudo sobre CS2 ao vivo! 📺 entreganewba.com.br/major/budapest-2025/`;
  }
}

/**
 * Check if we should reply to this mention
 * Rate limiting: max 20 replies/hour
 */
export async function shouldReplyToMention(
  category: string | null,
  sentiment: string | null
): Promise<boolean> {
  // Never reply to toxic mentions
  if (sentiment === 'toxic') {
    return false;
  }

  // Only reply to relevant categories
  const relevantCategories = ['match_query', 'stat_request', 'opinion'];
  if (category && !relevantCategories.includes(category)) {
    return false;
  }

  // Rate limiting: check replies in last hour
  // (Implementation would check twitterMentions table for recent responses)
  // For now, always return true if passes above checks

  return true;
}
