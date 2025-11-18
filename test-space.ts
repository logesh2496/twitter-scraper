// Import from built dist modules (requires: yarn build)
// @ts-ignore - CommonJS modules
import { cycleTLSFetch } from './dist/cycletls/cjs/index.cjs';
// @ts-ignore - CommonJS modules
import { Scraper } from './dist/node/cjs/index.cjs';

/**
 * Simple test script to fetch an Audio Space by ID
 *
 * Prerequisites:
 *   - Run 'yarn build' first to build the dist modules
 *
 * Usage:
 *   npx tsx test-space.ts
 *   (or: npx ts-node test-space.ts)
 *
 * Note: Replace the spaceId below with a valid Space ID from Twitter.
 * You can find Space IDs from Twitter URLs like: https://x.com/i/spaces/1YpKkZqjqVXKj
 */

async function main() {
  // Create a new scraper instance (uses guest auth by default)
  const scraper = new Scraper({
    fetch: cycleTLSFetch,
    experimental: {
      xClientTransactionId: true,
      xpff: true,
    },
  });

  await scraper.login(
    process.env['TWITTER_USERNAME'],
    process.env['TWITTER_PASSWORD'],
    process.env['TWITTER_EMAIL'],
    process.env['TWITTER_2FA_SECRET'],
  );

  // Replace with a valid Space ID
  // You can find Space IDs from Twitter URLs like: https://x.com/i/spaces/1YpKkZqjqVXKj
  const spaceId = '1OdJrOenbWvxX'; // Example Space ID - replace with a real one

  console.log(`Fetching Audio Space with ID: ${spaceId}`);
  console.log('---');

  try {
    const space = await scraper.fetchAudioSpaceById(spaceId);

    console.log('✅ Successfully fetched Audio Space!');
    console.log('\nSpace Details:');
    console.log(JSON.stringify(space, null, 2));
  } catch (error) {
    console.error('❌ Error fetching Audio Space:');
    if (error instanceof Error) {
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}

main();
