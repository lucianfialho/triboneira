/**
 * Simple test for visual generation
 */

import { getVisualGenerator } from '../visual-generator';

async function testVisual() {
  console.log('🎨 Testing Visual Generator...\n');

  const visualGenerator = getVisualGenerator({ debug: false });

  try {
    // Test match result
    console.log('1️⃣ Generating match result image...');
    const matchVisual = await visualGenerator.generate(
      'instagram-match-result-feed',
      {
        team1Name: 'FaZe',
        team1Rank: 3,
        team1Score: 2,
        team2Name: 'Vitality',
        team2Rank: 2,
        team2Score: 1,
        winnerSide: 'left',
        eventName: 'IEM Katowice 2025',
        maps: [
          { name: 'Mirage', team1Score: 16, team2Score: 13 },
          { name: 'Dust2', team1Score: 14, team2Score: 16 },
          { name: 'Inferno', team1Score: 16, team2Score: 14 },
        ],
      },
      'instagram',
      'feed'
    );

    console.log(`   ✅ Generated: ${matchVisual.filePath}`);
    console.log(`   📐 Size: ${matchVisual.width}x${matchVisual.height}`);
    console.log(`   💾 File size: ${(matchVisual.size / 1024).toFixed(2)} KB\n`);

    // Test upset
    console.log('2️⃣ Generating upset image...');
    const upsetVisual = await visualGenerator.generate(
      'instagram-upset-feed',
      {
        underdogName: 'MOUZ',
        underdogRank: 15,
        favoriteName: 'FaZe',
        favoriteRank: 3,
        rankDifference: 12,
        upsetLevel: 'major',
        score: '2-1',
      },
      'instagram',
      'feed'
    );

    console.log(`   ✅ Generated: ${upsetVisual.filePath}`);
    console.log(`   📐 Size: ${upsetVisual.width}x${upsetVisual.height}`);
    console.log(`   💾 File size: ${(upsetVisual.size / 1024).toFixed(2)} KB\n`);

    // Test story format
    console.log('3️⃣ Generating story format...');
    const storyVisual = await visualGenerator.generate(
      'instagram-match-result-story',
      {
        team1Name: 'FaZe',
        team1Rank: 3,
        team1Score: 2,
        team2Name: 'Vitality',
        team2Rank: 2,
        team2Score: 1,
        winnerSide: 'left',
        eventName: 'IEM Katowice 2025',
        maps: [
          { name: 'Mirage', team1Score: 16, team2Score: 13 },
          { name: 'Dust2', team1Score: 14, team2Score: 16 },
          { name: 'Inferno', team1Score: 16, team2Score: 14 },
        ],
      },
      'instagram',
      'story'
    );

    console.log(`   ✅ Generated: ${storyVisual.filePath}`);
    console.log(`   📐 Size: ${storyVisual.width}x${storyVisual.height}`);
    console.log(`   💾 File size: ${(storyVisual.size / 1024).toFixed(2)} KB\n`);

    console.log('✅ All visuals generated successfully!');
    console.log('\n📁 Check the generated-content/ directory for the images.\n');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await visualGenerator.close();
  }
}

testVisual().catch(console.error);
