import 'dotenv/config';
import { db } from '../lib/db/client';
import { matches } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

async function cleanEventMatches() {
  const eventId = 14; // Budapest Major Stage 1

  console.log(`🗑️  Limpando matches do evento ${eventId}...`);

  const deleted = await db
    .delete(matches)
    .where(eq(matches.eventId, eventId));

  console.log(`✅ Matches deletados com sucesso!`);
}

cleanEventMatches().catch(console.error);
