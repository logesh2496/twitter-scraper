import { Cookie } from 'tough-cookie';
import { cycleTLSFetch } from './src/cycletls-fetch';
import { Scraper } from './src/scraper';
import * as dotenv from 'dotenv';
import { SearchMode } from './src/search';

// Load environment variables from .env file
dotenv.config();

/**
 * Simple script to login and fetch an Audio Space by ID.
 * 
 * Usage:
 *   npx ts-node fetch-space.ts <SPACE_ID>
 * 
 * Example:
 *   npx ts-node fetch-space.ts 1OdJrOenbWvxX
 */

async function main() {
  const spaceId = process.argv[2];
  if (!spaceId) {
    console.error('Usage: npx ts-node fetch-space.ts <SPACE_ID>');
    process.exit(1);
  }

//   const username = process.env.TWITTER_USERNAME;
//   const password = process.env.TWITTER_PASSWORD;
//   const email = process.env.TWITTER_EMAIL;
//   const twoFactorSecret = process.env.TWITTER_2FA_SECRET;

//   if (!username || !password) {
//     console.error('Missing TWITTER_USERNAME or TWITTER_PASSWORD in .env file');
//     process.exit(1);
//   }

//   const scraper = new Scraper({
//     fetch: cycleTLSFetch,
//     experimental: {
//       xClientTransactionId: true,
//       xpff: true,
//     },
//   });

//   console.log(`Logging in as ${username}...`);
//   try {
//     await scraper.login(username, password, email, twoFactorSecret);
//     console.log('✅ Login successful!');
//   } catch (error) {
//     if (error instanceof Error && 'data' in error) {
//       console.error('❌ Login failed with data:', JSON.stringify((error as any).data, null, 2));
//     }
//     console.error('❌ Login failed:', error);
//     process.exit(1);
//   }
  const scraper = new Scraper({
    experimental: {
      xClientTransactionId: true,
      xpff: true,
    },
  });
  const cookieString = 'ct0=ef82f17b14c0b32247352f0e92d70a9fcb607edc5ea799ed7d23aa181194772d0fc9bae60cb2d81b186b9b2b0449c366aa98103a2426d6d6220e1e69eba09c43f7b2872d558e6971bbd9e5cb2dded70e; auth_token=0f3193905c870c74a36f8f3cf123213e5881670a; lang=en;';
  const cookies = cookieString
  .split(';')
  .map((c) => Cookie.parse(c))
  .filter(Boolean);

  await scraper.setCookies(cookies as any);

  const isLogged = await scraper.isLoggedIn();
  console.log('✅ Logged in:', isLogged);

  console.log(`Fetching Audio Space: ${spaceId}...`);
  try {
    const space = await scraper.getAudioSpaceById(spaceId);
    console.log('✅ Successfully fetched Audio Space!');
    console.log('\n--- Space Details ---');
    console.log(JSON.stringify(space, null, 2));
  } catch (error) {
    console.error('❌ Error fetching Audio Space:', error);
    process.exit(1);
  }
//   console.log(`Searching...`);
//   try {
//     const qRes = await scraper.fetchSearchTweets(
//       'bettercallzaal',
//       100,
//       SearchMode.Latest,
//     )
//     console.log('✅ Successfully searched!');
//     console.log(qRes.tweets)
    
//   } catch (error) {
//     console.error('❌ Error Searching:', error);
//     process.exit(1);
//   }
}

main().catch((err) => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
