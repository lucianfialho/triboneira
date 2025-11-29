
import { config } from 'dotenv';
config({ path: '.env.local' });
import { db } from './lib/db/client';
import { events, matches, eventParticipants } from './lib/db/schema';
import { eq, count } from 'drizzle-orm';

async function checkEventData() {
    try {
        const eventId = 15;
        console.log(`Checking data for Event ID ${eventId}...`);

        // Check Event existence
        const event = await db.query.events.findFirst({
            where: eq(events.id, eventId),
        });

        if (!event) {
            console.log('❌ Event not found!');
            process.exit(0);
        }
        console.log('✅ Event found:', event.name);

        // Count Matches
        const matchesCount = await db
            .select({ count: count() })
            .from(matches)
            .where(eq(matches.eventId, eventId));

        console.log('Matches count:', matchesCount[0].count);

        // Count Participants
        const participantsCount = await db
            .select({ count: count() })
            .from(eventParticipants)
            .where(eq(eventParticipants.eventId, eventId));

        console.log('Participants count:', participantsCount[0].count);

        process.exit(0);
    } catch (error) {
        console.error('Error checking event data:', error);
        process.exit(1);
    }
}

checkEventData();
