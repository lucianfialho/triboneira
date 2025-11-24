const { VisualGenerator } = require('./lib/services/content-generation/visual-generator');

async function testFallback() {
  const generator = new VisualGenerator({
    outputDir: './cron-service/generated-content',
    debug: false
  });

  try {
    console.log('🎨 Testing logo fallback with team initials...\n');

    const testData = {
      eventName: 'Test Tournament',
      matchFormat: 'Bo3',
      matchDate: '23 Nov 2025',
      team1Name: 'Falcons',
      team1Logo: 'https://img-cdn.hltv.org/teamlogo/INVALID_URL.png', // Force fallback
      team1Rank: 5,
      team1Score: 2,
      team2Name: 'Liquid',
      team2Logo: 'https://img-cdn.hltv.org/teamlogo/INVALID_URL.png', // Force fallback
      team2Rank: 3,
      team2Score: 0,
      winnerSide: 'left',
      maps: [
        { name: 'Dust2', team1Score: 13, team2Score: 10 },
        { name: 'Mirage', team1Score: 13, team2Score: 8 }
      ]
    };

    console.log('Generating Instagram feed post...');
    const feedVisual = await generator.generate(
      'instagram-match-result-feed',
      testData,
      'instagram',
      'feed'
    );
    console.log('✅ Feed post generated:', feedVisual.filePath);

    console.log('\nGenerating Instagram story...');
    const storyVisual = await generator.generate(
      'instagram-match-result-story',
      testData,
      'instagram',
      'story'
    );
    console.log('✅ Story generated:', storyVisual.filePath);

    console.log('\n✅ Test completed! Check the generated images for team initials fallback.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await generator.close();
  }
}

testFallback();
