
import { config } from 'dotenv';
config({ path: '.env.local' });
import { db } from './lib/db/client';
import { matches } from './lib/db/schema';

async function seedMatches() {
    try {
        const eventId = 15;
        console.log(`Seeding matches for Event ID ${eventId}...`);

        const newMatches = [
            // Round 1 Matches (Scheduled)
            {
                eventId,
                externalId: `seed-${Date.now()}-1`,
                source: 'manual',
                team1Id: 192, // MIBR
                team2Id: 191, // TYLOO
                date: new Date(Date.now() + 3600000), // +1 hour
                format: 'bo1',
                status: 'scheduled',
                hasStats: false
            },
            {
                eventId,
                externalId: `seed-${Date.now()}-2`,
                source: 'manual',
                team1Id: 189, // Liquid
                team2Id: 186, // NAVI
                date: new Date(Date.now() + 7200000), // +2 hours
                format: 'bo1',
                status: 'scheduled',
                hasStats: false
            },
            {
                eventId,
                externalId: `seed-${Date.now()}-3`,
                source: 'manual',
                team1Id: 187, // Astralis
                team2Id: 188, // 3DMAX
                date: new Date(Date.now() + 10800000), // +3 hours
                format: 'bo1',
                status: 'scheduled',
                hasStats: false
            },
            {
                eventId,
                externalId: `seed-${Date.now()}-4`,
                source: 'manual',
                team1Id: 105, // Passion UA
                team2Id: 185, // Aurora
                date: new Date(Date.now() + 14400000), // +4 hours
                format: 'bo1',
                status: 'scheduled',
                hasStats: false
            },
            // Live Match Example
            {
                eventId,
                externalId: `seed-${Date.now()}-live`,
                source: 'manual',
                team1Id: 192, // MIBR
                team2Id: 189, // Liquid
                date: new Date(),
                format: 'bo3',
                status: 'live',
                scoreTeam1: 1,
                scoreTeam2: 0,
                hasStats: false
            }
        ];

        await db.insert(matches).values(newMatches);
        console.log('✅ Matches seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding matches:', error);
        process.exit(1);
    }
}

seedMatches();
