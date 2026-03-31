import stringify from 'json-stable-stringify';
import { requestApi, RequestApiResult, addApiFeatures, bearerToken2 } from './api';
import { TwitterAuth } from './auth';
import { TwitterApiErrorRaw } from './errors';
import { updateCookieJar } from './requests';
import { Headers } from 'headers-polyfill';
import {
    AudioSpaceByIdResponse,
    AudioSpaceByIdVariables,
    AuthenticatePeriscopeResponse,
    BrowseSpaceTopicsResponse,
    Community,
    CommunitySelectQueryResponse,
    LoginTwitterTokenResponse,
    Subtopic,
} from './types/spaces';

/**
 * Generates a random string that mimics a UUID v4.
 */
// TODO: install and replace with uuidv4
function generateRandomId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

/**
 * Audio Space response structure from Twitter GraphQL API
 */
export interface AudioSpaceResponse {
  data?: {
    audioSpace?: AudioSpace;
  };
  errors?: TwitterApiErrorRaw[];
}

/**
 * Represents Sharings within an Audio Space.
 */
interface Sharings {
  items: any[];
  slice_info: Record<string, any>;
}

/**
 * Audio Space object containing space details
 */
export interface AudioSpace {
  metadata: AudioSpaceMetadata;
  participants: {
    total: number;
    admins: AudioSpaceParticipant[];
    speakers: AudioSpaceParticipant[];
    listeners: AudioSpaceParticipant[];
  };
  is_subscribed: boolean;
  sharings: Sharings;
}

/**
 * Represents the result details of a Creator.
 */
interface CreatorResult {
  __typename: string;
  id: string;
  rest_id: string;
  affiliates_highlighted_label: Record<string, any>;
  has_graduated_access: boolean;
  is_blue_verified: boolean;
  profile_image_shape: string;
  legacy: {
    following: boolean;
    can_dm: boolean;
    can_media_tag: boolean;
    created_at: string;
    default_profile: boolean;
    default_profile_image: boolean;
    description: string;
    entities: {
      description: {
        urls: any[];
      };
    };
    fast_followers_count: number;
    favourites_count: number;
    followers_count: number;
    friends_count: number;
    has_custom_timelines: boolean;
    is_translator: boolean;
    listed_count: number;
    location: string;
    media_count: number;
    name: string;
    needs_phone_verification: boolean;
    normal_followers_count: number;
    pinned_tweet_ids_str: string[];
    possibly_sensitive: boolean;
    profile_image_url_https: string;
    profile_interstitial_type: string;
    screen_name: string;
    statuses_count: number;
    translator_type: string;
    verified: boolean;
    want_retweets: boolean;
    withheld_in_countries: string[];
  };
  tipjar_settings: Record<string, any>;
}
/**
 * Audio Space metadata
 */
export interface AudioSpaceMetadata {
  rest_id: string;
  state: string;
  media_key: string;
  created_at: number;
  started_at: number;
  ended_at: string;
  updated_at: number;
  content_type: string;
  creator_results: {
    result: CreatorResult;
  };
  conversation_controls: number;
  disallow_join: boolean;
  is_employee_only: boolean;
  is_locked: boolean;
  is_muted: boolean;
  is_space_available_for_clipping: boolean;
  is_space_available_for_replay: boolean;
  narrow_cast_space_type: number;
  no_incognito: boolean;
  total_replay_watched: number;
  total_live_listeners: number;
  tweet_results: Record<string, any>;
  max_guest_sessions: number;
  max_admin_capacity: number;
}

/**
 * Audio Space participant
 */
export interface AudioSpaceParticipant {
  user_id?: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  is_admin?: boolean;
  is_speaker?: boolean;
  is_muted?: boolean;
  [key: string]: unknown;
}

interface LiveVideoSource {
  location: string;
  noRedirectPlaybackUrl: string;
  status: string;
  streamType: string;
}

/**
 * Live Video Stream Status
 */
export interface LiveVideoStreamStatus {
  source: LiveVideoSource;
  sessionId: string;
  chatToken: string;
  lifecycleToken: string;
  shareUrl: string;
  chatPermissionType: string;
}

/**
 * Fetches an Audio Space by its ID using Twitter's GraphQL API.
 * @param spaceId The Audio Space ID to fetch.
 * @param auth The TwitterAuth instance to use for authentication.
 * @returns A RequestApiResult containing the Audio Space data or an error.
 */
export async function fetchAudioSpaceById(
  spaceId: string,
  auth: TwitterAuth,
): Promise<RequestApiResult<AudioSpace>> {
  const queryId = 'Tvv_cNXCbtTcgdy1vWYPMw';
  const operationName = 'AudioSpaceById';

  const variables = {
    id: spaceId,
    isMetatagsQuery: false,
    withReplays: true,
    withListeners: true,
  };

  const features = addApiFeatures({
    spaces_2022_h2_spaces_communities: true,
    spaces_2022_h2_clipping: true,
    creator_subscriptions_tweet_preview_api_enabled: true,
    profile_label_improvements_pcf_label_in_post_enabled: false,
    rweb_tipjar_consumption_enabled: true,
    responsive_web_graphql_exclude_directive_enabled: true,
    verified_phone_label_enabled: false,
    premium_content_api_read_enabled: false,
    communities_web_enable_tweet_community_results_fetch: true,
    c9s_tweet_anatomy_moderator_badge_enabled: true,
    responsive_web_grok_analyze_button_fetch_trends_enabled: true,
    articles_preview_enabled: true,
    responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
    responsive_web_edit_tweet_api_enabled: true,
    graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
    view_counts_everywhere_api_enabled: true,
    longform_notetweets_consumption_enabled: true,
    responsive_web_twitter_article_tweet_consumption_enabled: true,
    tweet_awards_web_tipping_enabled: false,
    creator_subscriptions_quote_tweet_preview_enabled: false,
    freedom_of_speech_not_reach_fetch_enabled: true,
    standardized_nudges_misinfo: true,
    tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled:
      true,
    rweb_video_timestamps_enabled: true,
    longform_notetweets_rich_text_read_enabled: true,
    longform_notetweets_inline_media_enabled: true,
    responsive_web_graphql_timeline_navigation_enabled: true,
    responsive_web_enhance_cards_enabled: false,
  });

  const params = new URLSearchParams();
  const variablesStr = stringify(variables);
  const featuresStr = stringify(features);

  if (variablesStr) params.set('variables', variablesStr);
  if (featuresStr) params.set('features', featuresStr);

  const url = `https://x.com/i/api/graphql/${queryId}/${operationName}?${params.toString()}`;

  const res = await requestApi<AudioSpaceResponse>(url, auth);

  if (!res.success) {
    return res;
  }

  const { value } = res;
  const { errors } = value;

  if (
    (!value.data || !value.data.audioSpace) &&
    errors != null &&
    errors.length > 0
  ) {
    return {
      success: false,
      err: new Error(errors.map((e) => e.message).join('\n')),
    };
  }

  if (!value.data || !value.data.audioSpace) {
    return {
      success: false,
      err: new Error('Audio Space not found.'),
    };
  }

  return {
    success: true,
    value: value.data.audioSpace,
  };
}

/**
 * Fetches the status of an Audio Space stream by its media key.
 * @param mediaKey The media key of the Audio Space.
 * @param auth The authentication object.
 * @returns The status of the Audio Space stream.
 */
export async function fetchLiveVideoStreamStatus(
  mediaKey: string,
  auth: TwitterAuth,
): Promise<LiveVideoStreamStatus> {
  const baseUrl = `https://x.com/i/api/1.1/live_video_stream/status/${mediaKey}`;
  const queryParams = new URLSearchParams({
    client: 'web',
    use_syndication_guest_id: 'false',
    cookie_set_host: 'x.com',
  });

  const url = `${baseUrl}?${queryParams.toString()}`;

  const onboardingTaskUrl = 'https://x.com';

  // Retrieve necessary cookies and tokens
  const cookies = await auth.cookieJar().getCookies(onboardingTaskUrl);
  const xCsrfToken = cookies.find((cookie) => cookie.key === 'ct0');

  const headers = new Headers({
    Accept: '*/*',
    Authorization: `Bearer ${(auth as any).bearerToken}`,
    'Content-Type': 'application/json',
    Cookie: await auth.cookieJar().getCookieString(onboardingTaskUrl),
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'x-guest-token': (auth as any).guestToken,
    'x-twitter-auth-type': 'OAuth2Client',
    'x-twitter-active-user': 'yes',
    'x-csrf-token': xCsrfToken?.value as string,
  });

  try {
    const response = await auth.fetch(url, {
      method: 'GET',
      headers: headers,
    });

    // Update the cookie jar with any new cookies from the response
    await updateCookieJar(auth.cookieJar(), response.headers);

    // Check for errors in the response
    if (!response.ok) {
      throw new Error(
        `Failed to fetch live video stream status: ${await response.text()}`,
      );
    }

    return await response.json();
  } catch (error) {
    console.error(
      `Error fetching live video stream status for mediaKey ${mediaKey}:`,
      error,
    );
    throw error;
  }
}

/**
 * Authenticates Periscope to obtain a token.
 * @param auth The authentication object.
 * @returns The Periscope authentication token.
 */
export async function fetchAuthenticatePeriscope(
    auth: TwitterAuth,
): Promise<string> {
    const queryId = 'r7VUmxbfqNkx7uwjgONSNw';
    const operationName = 'AuthenticatePeriscope';

    const variables = {};
    const features = {};

    const variablesEncoded = encodeURIComponent(JSON.stringify(variables));
    const featuresEncoded = encodeURIComponent(JSON.stringify(features));

    const url = `https://x.com/i/api/graphql/${queryId}/${operationName}?variables=${variablesEncoded}&features=${featuresEncoded}`;

    const onboardingTaskUrl = 'https://x.com';

    const cookies = await auth.cookieJar().getCookies(onboardingTaskUrl);
    const xCsrfToken = cookies.find((cookie) => cookie.key === 'ct0');

    if (!xCsrfToken) {
        throw new Error('CSRF Token (ct0) not found in cookies.');
    }

    const clientTransactionId = generateRandomId();

    const headers = new Headers({
        Accept: '*/*',
        Authorization: `Bearer ${bearerToken2}`,
        'Content-Type': 'application/json',
        Cookie: await auth.cookieJar().getCookieString(onboardingTaskUrl),
        'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'x-guest-token': (auth as any).guestToken,
        'x-twitter-auth-type': 'OAuth2Session',
        'x-twitter-active-user': 'yes',
        'x-csrf-token': xCsrfToken.value,
        'x-client-transaction-id': clientTransactionId,
        'sec-ch-ua-platform': '"Windows"',
        'sec-ch-ua':
            '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        'x-twitter-client-language': 'en',
        'sec-ch-ua-mobile': '?0',
        Referer: 'https://x.com/i/spaces/start',
    });

    try {
        const response = await auth.fetch(url, {
            method: 'GET',
            headers: headers,
        });

        await updateCookieJar(auth.cookieJar(), response.headers);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText}`);
        }

        const data: AuthenticatePeriscopeResponse = await response.json();

        if (data.errors && data.errors.length > 0) {
            throw new Error(`API Errors: ${JSON.stringify(data.errors)}`);
        }

        if (!data.data.authenticate_periscope) {
            throw new Error('Periscope authentication failed, no data returned.');
        }

        return data.data.authenticate_periscope;
    } catch (error) {
        console.error('Error during Periscope authentication:', error);
        throw error;
    }
}

/**
 * Logs in to Twitter via Proxsee using the Periscope JWT to obtain a login cookie.
 * @param jwt The JWT obtained via AuthenticatePeriscope.
 * @param auth The authentication object.
 * @returns The response containing the cookie and user information.
 */
export async function fetchLoginTwitterToken(
    jwt: unknown,
    auth: TwitterAuth,
): Promise<LoginTwitterTokenResponse> {
    const url = 'https://proxsee.pscp.tv/api/v2/loginTwitterToken';

    const idempotenceKey = generateRandomId();

    const payload = {
        jwt: jwt,
        vendor_id: 'm5-proxsee-login-a2011357b73e',
        create_user: true,
    };

    const headers = new Headers({
        'Content-Type': 'application/json',
        'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        Referer: 'https://x.com/',
        'sec-ch-ua':
            '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        'sec-ch-ua-platform': '"Windows"',
        'sec-ch-ua-mobile': '?0',
        'X-Periscope-User-Agent': 'Twitter/m5',
        'X-Idempotence': idempotenceKey,
        'X-Attempt': '1',
    });

    try {
        const response = await auth.fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload),
        });

        // Update the cookie jar with any new cookies from the response
        await updateCookieJar(auth.cookieJar(), response.headers);

        // Check if the response is successful
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText}`);
        }

        const data: LoginTwitterTokenResponse = await response.json();

        if (!data.cookie || !data.user) {
            throw new Error('Twitter authentication failed, missing data.');
        }

        return data;
    } catch (error) {
        console.error('Error logging into Twitter via Proxsee:', error);
        throw error;
    }
}