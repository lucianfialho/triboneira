import HLTV from 'hltv';

async function checkEvent() {
  try {
    const event = await HLTV.getEvent({ id: 8841 });
    
    console.log('Event:', event.name);
    console.log('Status:', event.status);
    console.log('Date Start:', event.dateStart);
    console.log('Date End:', event.dateEnd);
    console.log('Prize Pool:', event.prizePool);
    console.log('Location:', event.location);
    console.log('Number of teams:', event.teams?.length || 0);
    
    // Check if it's a major
    const isMajor = event.name.toLowerCase().includes('major') ||
      (event.prizePool && parseInt(event.prizePool.replace(/\D/g, '')) >= 1000000);
    
    console.log('\nIs Major?', isMajor);
    console.log('Should be Championship Mode?', event.status === 'ongoing' && isMajor);
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

checkEvent();
