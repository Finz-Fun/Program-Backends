import { TwitterService } from './services/twitter-service';

async function testMentions() {
  const service = new TwitterService();
  await service.initialize();

  console.log('Starting mention listener test...');

  await service.listenToMentions();

  // Optional: Stop after 5 minutes
//   setTimeout(() => {
//     service.stopListening();
//     process.exit(0);
//   }, 5 * 60 * 1000);
}

testMentions().catch(console.error);