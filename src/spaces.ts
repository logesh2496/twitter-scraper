import stringify from 'json-stable-stringify';
import { requestApi, RequestApiResult, addApiFeatures } from './api';
import { TwitterAuth } from './auth';
import { TwitterApiErrorRaw } from './errors';

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
 * Audio Space object containing space details
 */
export interface AudioSpace {
  rest_id?: string;
  metadata?: AudioSpaceMetadata;
  participants?: {
    total?: number;
    admins?: AudioSpaceParticipant[];
    speakers?: AudioSpaceParticipant[];
    listeners?: AudioSpaceParticipant[];
  };
  state?: string;
  title?: string;
  started_at?: number;
  ended_at?: number;
  created_at?: number;
  updated_at?: number;
  creator_id?: string;
  is_space_available_for_replay?: boolean;
  is_space_available_for_clipping?: boolean;
  disallow_join?: boolean;
  narrow_cast_space_type?: number;
  [key: string]: unknown;
}

/**
 * Audio Space metadata
 */
export interface AudioSpaceMetadata {
  rest_id?: string;
  state?: string;
  title?: string;
  media_key?: string;
  created_at?: number;
  started_at?: number;
  ended_at?: number;
  updated_at?: number;
  disallow_join?: boolean;
  narrow_cast_space_type?: number;
  is_space_available_for_replay?: boolean;
  is_space_available_for_clipping?: boolean;
  conversation_controls?: number;
  total_replay_watched?: number;
  total_live_listeners?: number;
  [key: string]: unknown;
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

/**
 * Fetches an Audio Space by its ID using Twitter's GraphQL API.
 * @param spaceId The Audio Space ID to fetch.
 * @param auth The TwitterAuth instance to use for authentication.
 * @returns A RequestApiResult containing the Audio Space data or an error.
 */
export async function getAudioSpaceById(
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
