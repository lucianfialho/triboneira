import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { db } from '../lib/db/client';
import { games } from '../lib/db/schema';

async function testConnection() {
  try {
    console.log('🔌 Testing Neon database connection...\n');

    // Test 1: Insert CS2 game
    console.log('1️⃣  Inserting CS2 game...');
    const [cs2Game] = await db
      .insert(games)
      .values({
        slug: 'cs2',
        name: 'Counter-Strike 2',
        active: true,
      })
      .onConflictDoUpdate({
        target: games.slug,
        set: { updatedAt: new Date() },
      })
      .returning();

    console.log(`✅ Game inserted/updated: ${cs2Game.name} (ID: ${cs2Game.id})\n`);

    // Test 2: Query all games
    console.log('2️⃣  Querying all games...');
    const allGames = await db.select().from(games);
    console.log(`✅ Found ${allGames.length} game(s):`);
    allGames.forEach((game) => {
      console.log(`   - ${game.name} (${game.slug}) - Active: ${game.active}`);
    });

    console.log('\n✅ Database connection successful!');
    console.log('🎉 All tables are ready to use!\n');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

testConnection();
