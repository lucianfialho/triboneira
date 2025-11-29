
import { config } from 'dotenv';
config({ path: '.env.local' });
import { db } from './lib/db/client';
import { eventParticipants, teams } from './lib/db/schema';
import { eq } from 'drizzle-orm';

async function listParticipants() {
    try {
        const eventId = 15;
        const participants = await db
            .select({
                teamName: teams.name,
                teamId: teams.id
            })
            .from(eventParticipants)
            .innerJoin(teams, eq(eventParticipants.teamId, teams.id))
            .where(eq(eventParticipants.eventId, eventId));

        console.log('Participants:', participants);
        process.exit(0);
    } catch (error) {
        console.error('Error listing participants:', error);
        process.exit(1);
    }
}

listParticipants();
