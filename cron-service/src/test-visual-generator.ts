import { getVisualGenerator } from './services/content-generation/visual-generator';

async function testGenerator() {
    const generator = getVisualGenerator({ debug: true });

    console.log('🚀 Starting Visual Generator Test...');

    // Mock Data for Match Result
    const matchData = {
        eventName: 'PGL Major Copenhagen 2024',
        matchFormat: 'Grand Final (BO3)',
        matchDate: 'March 31, 2024',
        team1Name: 'FaZe Clan',
        team1Logo: 'https://img-cdn.hltv.org/teamlogo/6667/2000/h_Q-p_L0_0_0.png',
        team1Rank: 1,
        team1Score: 2,
        team2Name: 'Natus Vincere',
        team2Logo: 'https://img-cdn.hltv.org/teamlogo/4608/2000/h_Q-p_L0_0_0.png',
        team2Rank: 2,
        team2Score: 1,
        winnerSide: 'left', // FaZe won in this mock (actually NaVi won IRL but testing left winner)
        maps: [
            { name: 'Ancient', team1Score: 13, team2Score: 9 },
            { name: 'Mirage', team1Score: 2, team2Score: 13 },
            { name: 'Inferno', team1Score: 13, team2Score: 11 }
        ]
    };

    // Mock Data for Upset
    const upsetData = {
        upsetLevel: 'major',
        underdogName: 'Monte',
        underdogLogo: 'https://img-cdn.hltv.org/teamlogo/11811/2000/h_Q-p_L0_0_0.png',
        underdogRank: 22,
        favoriteName: 'Cloud9',
        favoriteLogo: 'https://img-cdn.hltv.org/teamlogo/5752/2000/h_Q-p_L0_0_0.png',
        favoriteRank: 5,
        score: '2-0',
        rankDifference: 17
    };

    try {
        // 1. Generate Match Result Feed
        console.log('\n📸 Generating Match Result Feed...');
        await generator.generate(
            'instagram-match-result-feed',
            matchData,
            'instagram',
            'feed'
        );

        // 2. Generate Match Result Story
        console.log('\n📸 Generating Match Result Story...');
        await generator.generate(
            'instagram-match-result-story',
            matchData,
            'instagram',
            'story'
        );

        // 3. Generate Upset Feed
        console.log('\n📸 Generating Upset Feed...');
        await generator.generate(
            'instagram-upset-feed',
            upsetData,
            'instagram',
            'feed'
        );

        console.log('\n✅ All tests completed successfully!');

    } catch (error) {
        console.error('\n❌ Test failed:', error);
    } finally {
        await generator.close();
    }
}

testGenerator();
