import HLTV from 'hltv';

console.log('🔍 Examining HLTV structure...\n');

// Check what HLTV actually is
console.log('Type of HLTV:', typeof HLTV);
console.log('HLTV constructor name:', HLTV.constructor.name);

// Get all properties/methods directly on HLTV
console.log('\n📚 Properties and methods on HLTV object:');
const keys = Object.keys(HLTV);
console.log(`   Found ${keys.length} keys`);

keys.forEach(key => {
  const value = (HLTV as any)[key];
  const type = typeof value;
  console.log(`   - ${key}: ${type}`);
});

// Check specific methods we're using
console.log('\n🔧 Checking specific methods:');
console.log(`   getMatches: ${typeof (HLTV as any).getMatches}`);
console.log(`   getEvent: ${typeof (HLTV as any).getEvent}`);
console.log(`   getEvents: ${typeof (HLTV as any).getEvents}`);

// Try to see if there's documentation
if ((HLTV as any).getMatches) {
  console.log('\n📖 getMatches function signature:');
  console.log((HLTV as any).getMatches.toString().split('\n')[0]);
}
