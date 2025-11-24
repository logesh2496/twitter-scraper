
import { Scraper } from './src/scraper';
import { SpaceParticipant } from './src/spaces/core/SpaceParticipant';

async function verify() {
    console.log('Verifying SpaceParticipant fix...');

    const scraper = new Scraper();

    // Mock getCookies
    scraper.getCookies = async () => {
        const { Cookie } = require('tough-cookie');
        return [
            new Cookie({ key: 'auth_token', value: 'test_token', domain: 'twitter.com', path: '/', secure: true, httpOnly: true, hostOnly: false, creation: new Date(), lastAccessed: new Date() }),
            new Cookie({ key: 'ct0', value: 'test_csrf', domain: 'twitter.com', path: '/', secure: true, httpOnly: false, hostOnly: false, creation: new Date(), lastAccessed: new Date() })
        ];
    };

    // Mock auth fetch to avoid actual network calls failing
    const mockFetch = async (url: RequestInfo | URL, init?: RequestInit) => {
        console.log(`Fetch called: ${url}`);
        if (url.toString().includes('authorizeToken')) {
            return new Response(JSON.stringify({ authorization_token: 'mock_auth_token' }), { status: 200 });
        }
        if (url.toString().includes('AudioSpaceById')) {
            return new Response(JSON.stringify({ data: { audioSpace: { metadata: { media_key: 'test_media_key' } } } }), { status: 200 });
        }
        if (url.toString().includes('live_video_stream/status')) {
            return new Response(JSON.stringify({ source: { location: 'http://test.hls' }, chatToken: 'mock_chat_jwt', lifecycleToken: 'mock_lifecycle' }), { status: 200 });
        }
        if (url.toString().includes('accessChat')) {
            return new Response(JSON.stringify({ access_token: 'mock_chat_access', endpoint: 'http://chat.endpoint', room_id: 'mock_room' }), { status: 200 });
        }
        if (url.toString().includes('startWatching')) {
            return new Response(JSON.stringify({ session: 'mock_watch_session' }), { status: 200 });
        }
        return new Response('{}', { status: 200 });
    };

    // @ts-ignore
    scraper.options = { fetch: mockFetch };

    const participant = new SpaceParticipant(scraper, { spaceId: 'test_space_id' });

    try {
        await participant.joinAsListener();
        console.log('Successfully joined as listener (mocked).');
    } catch (error) {
        console.error('Error joining space:', error);
        process.exit(1);
    }
}

verify();
