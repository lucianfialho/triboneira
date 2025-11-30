import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface NewsAnalysisInput {
  title: string;
  summary?: Array<{ type: string; text: string }>;
  content?: string;
}

/**
 * Generate analytical commentary for news article
 *
 * Creates a professional, analyst-style comment about the news
 * that provides context, analysis, and implications for the CS2 scene
 */
export async function generateAnalyticalCommentary(input: NewsAnalysisInput): Promise<string | null> {
  try {
    // Build context from summary bullets if available
    let context = '';
    if (input.summary && Array.isArray(input.summary)) {
      context = input.summary.map(b => `- ${b.text}`).join('\n');
    }

    // If we have translated content, use first 500 chars as additional context
    if (input.content && input.content.length > 0) {
      const contentPreview = input.content.substring(0, 500);
      context += `\n\nConteúdo: ${contentPreview}...`;
    }

    const prompt = `Você é um analista profissional de Counter-Strike 2 (CS2) criando comentários para Twitter.

Notícia: "${input.title}"

Contexto:
${context}

Crie um comentário analítico CURTO (máximo 180 caracteres) sobre esta notícia que:
- Forneça contexto ou análise profissional (não apenas repita a notícia)
- Destaque implicações para times, jogadores ou o cenário competitivo
- Use tom profissional mas acessível (como um analista de esports)
- Seja objetivo e direto
- NÃO use emojis
- NÃO use hashtags
- NÃO mencione o link ou site

Exemplos de bom comentário analítico:
- "Movimento esperado após resultados inconsistentes. A mudança pode trazer novo estilo tático ao time."
- "Decisão arriscada considerando o histórico recente, mas mostra ambição da org em buscar títulos."
- "Contratação que preenche lacuna estratégica crucial. Potencial para elevar o nível do roster."

IMPORTANTE: Retorne APENAS o comentário, sem aspas ou formatação extra. Máximo 180 caracteres.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-5-nano-2025-08-07',
      messages: [
        {
          role: 'system',
          content: 'Você é um analista profissional de Counter-Strike 2 especializado em criar comentários concisos e analíticos sobre notícias do cenário competitivo.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_completion_tokens: 100,
    });

    const commentary = completion.choices[0]?.message?.content?.trim();

    if (!commentary || commentary.length === 0) {
      return null;
    }

    // Ensure it's not too long (leave room for title + links)
    if (commentary.length > 180) {
      return commentary.substring(0, 177) + '...';
    }

    return commentary;

  } catch (error: any) {
    console.error(`Error generating analytical commentary: ${error.message}`);
    return null;
  }
}
